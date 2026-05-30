import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, EnrollmentStatus, PaymentStatus } from '@prisma/client';
import { CacheStoreService } from '../../common/interceptors/cache.interceptor';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheStore: CacheStoreService,
  ) {}

  async enroll(userId: string, data: { courseId: string }) {
    const result = await this.prisma.$transaction(async (tx) => {
      const course = await tx.course.findUnique({
        where: { id: data.courseId },
      });

      if (!course) {
        throw new NotFoundException('Course not found');
      }

      if (course.status !== 'PUBLISHED') {
        throw new BadRequestException('Course is not available for enrollment');
      }

      const existing = await tx.courseEnrollment.findUnique({
        where: { userId_courseId: { userId, courseId: data.courseId } },
      });

      if (existing && existing.status !== 'CANCELLED') {
        throw new ConflictException('You are already enrolled in this course');
      }

      const priceNumber = Number(course.price);

      if (existing && existing.status === 'CANCELLED') {
        const updated = await tx.courseEnrollment.update({
          where: { id: existing.id },
          data: { status: EnrollmentStatus.ACTIVE },
          include: { course: true, payment: true },
        });

        if (priceNumber > 0 && !updated.payment) {
          await tx.payment.create({
            data: {
              enrollmentId: updated.id,
              amount: course.price,
              currency: 'EGP',
              status: PaymentStatus.PENDING,
              provider: 'mock',
            },
          });
          const fullEnrollment = await tx.courseEnrollment.findUnique({
            where: { id: updated.id },
            include: { course: true, payment: true },
          });
          return this.mapEnrollment(fullEnrollment!);
        }

        return this.mapEnrollment(updated);
      }

      const enrollment = await tx.courseEnrollment.create({
        data: {
          userId,
          courseId: data.courseId,
          status: EnrollmentStatus.ACTIVE,
        },
        include: { course: true, payment: true },
      });

      if (priceNumber > 0) {
        await tx.payment.create({
          data: {
            enrollmentId: enrollment.id,
            amount: course.price,
            currency: 'EGP',
            status: PaymentStatus.PENDING,
            provider: 'mock',
          },
        });
        const fullEnrollment = await tx.courseEnrollment.findUnique({
          where: { id: enrollment.id },
          include: { course: true, payment: true },
        });
        return this.mapEnrollment(fullEnrollment!);
      }

      return this.mapEnrollment(enrollment);
    });
    await this.invalidatePublicCourseCache();
    return result;
  }

  async findMine(userId: string, query: Record<string, string | undefined>) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 25);
    const skip = (page - 1) * limit;

    const where: Prisma.CourseEnrollmentWhereInput = { userId };
    if (query.status) {
      where.status = query.status as EnrollmentStatus;
    }

    const [enrollments, total] = await Promise.all([
      this.prisma.courseEnrollment.findMany({
        where,
        include: {
          course: {
            include: {
              category: true,
              instructor: { select: { id: true, name: true, avatarUrl: true } },
              _count: { select: { lessons: true } },
            },
          },
          progress: true,
          payment: true,
        },
        skip,
        take: limit,
        orderBy: { enrolledAt: 'desc' },
      }),
      this.prisma.courseEnrollment.count({ where }),
    ]);

    return {
      data: enrollments.map((e) => this.mapEnrollmentWithCourse(e)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAllAdmin(query: Record<string, string | undefined>) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 25);
    const skip = (page - 1) * limit;

    const where: Prisma.CourseEnrollmentWhereInput = {};
    if (query.status) where.status = query.status as EnrollmentStatus;
    if (query.courseId) where.courseId = query.courseId;

    const [enrollments, total] = await Promise.all([
      this.prisma.courseEnrollment.findMany({
        where,
        include: {
          course: { select: { id: true, title: true, slug: true } },
          user: { select: { id: true, name: true, email: true } },
          payment: true,
        },
        skip,
        take: limit,
        orderBy: { enrolledAt: 'desc' },
      }),
      this.prisma.courseEnrollment.count({ where }),
    ]);

    return {
      data: enrollments.map((e) => this.mapEnrollment(e, true)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateProgress(
    userId: string,
    enrollmentId: string,
    data: { lessonId: string; isCompleted: boolean },
  ) {
    const enrollment = await this.prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId },
      include: { progress: true, course: { include: { lessons: true } } },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.userId !== userId) {
      throw new ForbiddenException('You can only update your own progress');
    }

    // Upsert lesson progress
    await this.prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId,
          lessonId: data.lessonId,
        },
      },
      update: {
        isCompleted: data.isCompleted,
        completedAt: data.isCompleted ? new Date() : null,
      },
      create: {
        enrollmentId,
        lessonId: data.lessonId,
        isCompleted: data.isCompleted,
        completedAt: data.isCompleted ? new Date() : null,
      },
    });

    // Check if all lessons are completed
    const totalLessons = enrollment.course.lessons.length;
    const completedLessons = enrollment.progress.filter((p) => p.isCompleted).length +
      (data.isCompleted && !enrollment.progress.some((p) => p.lessonId === data.lessonId) ? 1 : 0);

    const allCompleted = totalLessons > 0 && completedLessons >= totalLessons;

    const updated = await this.prisma.courseEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status: allCompleted ? EnrollmentStatus.COMPLETED : enrollment.status,
        completedAt: allCompleted ? new Date() : enrollment.completedAt,
      },
      include: { course: true, payment: true },
    });

    return this.mapEnrollment(updated);
  }

  private async invalidatePublicCourseCache() {
    await this.cacheStore.invalidatePrefix('courses:public');
  }

  private mapEnrollment(
    enrollment: any,
    includeUser = false,
  ) {
    const result: Record<string, unknown> = {
      id: enrollment.id,
      courseId: enrollment.courseId,
      status: enrollment.status.toLowerCase(),
      enrolledAt: enrollment.enrolledAt.toISOString(),
      completedAt: enrollment.completedAt?.toISOString() ?? null,
      paymentStatus: enrollment.payment
        ? enrollment.payment.status.toLowerCase()
        : enrollment.course.price && Number(enrollment.course.price) > 0
          ? 'pending'
          : 'not_required',
      paymentId: enrollment.payment?.id ?? null,
    };

    if (includeUser && enrollment.user) {
      result.user = {
        id: enrollment.user.id,
        name: enrollment.user.name,
        email: enrollment.user.email,
      };
    }

    return result;
  }

  private mapEnrollmentWithCourse(enrollment: any) {
    const course = enrollment.course;
    const completedLessons = enrollment.progress?.filter((p: any) => p.isCompleted).length ?? 0;
    const totalLessons = course._count?.lessons ?? 0;
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      id: enrollment.id,
      status: enrollment.status.toLowerCase(),
      enrolledAt: enrollment.enrolledAt.toISOString(),
      completedAt: enrollment.completedAt?.toISOString() ?? null,
      progressPercent,
      paymentStatus: enrollment.payment
        ? enrollment.payment.status.toLowerCase()
        : course.price && Number(course.price) > 0
          ? 'pending'
          : 'not_required',
      paymentId: enrollment.payment?.id ?? null,
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        instructor: course.instructor,
        category: {
          id: course.category.id,
          name: course.category.name,
          slug: course.category.slug,
        },
        totalDuration: course.totalDuration,
        lessonCount: totalLessons,
      },
    };
  }
}
