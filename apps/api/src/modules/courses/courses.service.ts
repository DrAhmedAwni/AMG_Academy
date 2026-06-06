import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { JwtPayload } from '@amg/shared';
import { NotificationType } from '@amg/shared';
import { Prisma, CourseStatus, EnrollmentStatus, UserStatus } from '@prisma/client';
import { CacheStoreService } from '../../common/interceptors/cache.interceptor';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notifications/notification.service';
import type { CreateCourseDto, UpdateCourseDto } from './dto/courses.dto';

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheStore: CacheStoreService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(data: CreateCourseDto) {
    const { categoryId, instructorId, price, ...rest } = data;
    const course = await this.prisma.course.create({
      data: {
        ...rest,
        price: new Prisma.Decimal(price),
        isFree: price === 0 || price === undefined,
        category: { connect: { id: categoryId } },
        instructor: { connect: { id: instructorId } },
      },
      include: {
        category: true,
        instructor: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { enrollments: true, lessons: true } },
      },
    });
    return this.mapCourse(course);
  }

  async findAllPublic(
    query: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      isFree?: boolean;
    },
    userId?: string,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.CourseWhereInput = {
      status: CourseStatus.PUBLISHED,
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.category) {
      where.category = { slug: query.category };
    }

    if (query.isFree !== undefined) {
      where.price = query.isFree ? { equals: 0 } : { gt: 0 };
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        include: {
          category: true,
          instructor: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { enrollments: true, lessons: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count({ where }),
    ]);

    let enrolledCourseIds = new Set<string>();
    if (userId) {
      const enrollments = await this.prisma.courseEnrollment.findMany({
        where: { userId, status: { not: 'CANCELLED' } },
        select: { courseId: true },
      });
      enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));
    }

    return {
      data: courses.map((c) => this.mapCourse(c, enrolledCourseIds.has(c.id))),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAllAdmin(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }, currentUser?: JwtPayload) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.CourseWhereInput = {};

    if (this.isInstructor(currentUser)) {
      where.instructorId = currentUser!.sub;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      where.status = query.status as CourseStatus;
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        include: {
          category: true,
          instructor: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { enrollments: true, lessons: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      data: courses.map((c) => this.mapCourse(c)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findBySlug(slug: string, userId?: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: {
        category: true,
        instructor: { select: { id: true, name: true, avatarUrl: true } },
        lessons: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
            orderIndex: true,
            videoId: true,
          },
        },
        _count: { select: { enrollments: true, lessons: true } },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.status !== CourseStatus.PUBLISHED) {
      throw new NotFoundException('Course not found');
    }

    let isEnrolled = false;
    let paymentStatus: string | null = null;
    let paymentId: string | null = null;
    if (userId) {
      const enrollment = await this.prisma.courseEnrollment.findUnique({
        where: { userId_courseId: { userId, courseId: course.id } },
        include: { payment: { select: { id: true, status: true } } },
      });
      isEnrolled = !!enrollment && enrollment.status !== EnrollmentStatus.CANCELLED;
      if (enrollment?.payment) {
        paymentStatus = enrollment.payment.status.toLowerCase();
        paymentId = enrollment.payment.id;
      }
    }

    return this.mapCourse(course, isEnrolled, paymentStatus, paymentId);
  }

  async findById(id: string, currentUser?: JwtPayload) {
    await this.assertCanManageCourse(id, currentUser);

    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        category: true,
        instructor: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { enrollments: true, lessons: true } },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.mapCourse(course);
  }

  async update(id: string, data: UpdateCourseDto, currentUser?: JwtPayload) {
    await this.assertCanManageCourse(id, currentUser);
    const { categoryId, instructorId, price, ...rest } = data;
    const updateData: Prisma.CourseUpdateInput = { ...rest };

    if (categoryId !== undefined) {
      updateData.category = { connect: { id: categoryId } };
    }

    if (instructorId !== undefined) {
      updateData.instructor = { connect: { id: instructorId } };
    }

    if (price !== undefined) {
      updateData.price = new Prisma.Decimal(price);
      updateData.isFree = price === 0;
    }

    const course = await this.prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        instructor: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { enrollments: true, lessons: true } },
      },
    });
    await this.cacheStore.invalidatePrefix('courses:public');
    return this.mapCourse(course);
  }

  async publish(id: string, currentUser?: JwtPayload) {
    await this.assertCanManageCourse(id, currentUser);
    const course = await this.prisma.course.update({
      where: { id },
      data: { status: CourseStatus.PUBLISHED },
      include: {
        category: true,
        instructor: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { enrollments: true, lessons: true } },
      },
    });
    await this.cacheStore.invalidatePrefix('courses:public');

    const users = await this.prisma.user.findMany({
      where: { status: UserStatus.ACTIVE },
      select: { id: true },
    });

    await Promise.all(
      users.map((user) =>
        this.notificationService.send(
          {
            userId: user.id,
            type: NotificationType.NewCoursePublished,
            title: 'New Course Available',
            message: `New course available: ${course.title}`,
            entityType: 'Course',
            entityId: id,
          },
          ['in_app', 'push'],
        ),
      ),
    );

    return this.mapCourse(course);
  }

  async archive(id: string, currentUser?: JwtPayload) {
    await this.assertCanManageCourse(id, currentUser);
    const course = await this.prisma.$transaction(async (tx) => {
      await tx.courseEnrollment.updateMany({
        where: { courseId: id, status: { not: EnrollmentStatus.CANCELLED } },
        data: { status: EnrollmentStatus.CANCELLED },
      });

      return tx.course.update({
        where: { id },
        data: { status: CourseStatus.ARCHIVED },
        include: {
          category: true,
          instructor: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { enrollments: true, lessons: true } },
        },
      });
    });
    await this.cacheStore.invalidatePrefix('courses:public');
    return this.mapCourse(course);
  }

  async remove(id: string, currentUser?: JwtPayload) {
    await this.archive(id, currentUser);
    return { id, archived: true };
  }

  async hardDelete(id: string, currentUser?: JwtPayload) {
    await this.assertCanManageCourse(id, currentUser);
    const enrollmentsCount = await this.prisma.courseEnrollment.count({ where: { courseId: id } });
    if (enrollmentsCount > 0) {
      throw new ForbiddenException('Cannot delete course with existing enrollments');
    }
    await this.prisma.$transaction([
      this.prisma.lesson.deleteMany({ where: { courseId: id } }),
      this.prisma.certificate.deleteMany({ where: { courseId: id } }),
      this.prisma.studyGroup.deleteMany({ where: { courseId: id } }),
      this.prisma.course.delete({ where: { id } }),
    ]);
    await this.cacheStore.invalidatePrefix('courses:public');
    return { id, deleted: true };
  }

  private isInstructor(user?: JwtPayload) {
    return user?.role === 'instructor' && !user.permissions.includes('*:*');
  }

  private async assertCanManageCourse(id: string, currentUser?: JwtPayload) {
    if (!this.isInstructor(currentUser)) {
      return;
    }

    const course = await this.prisma.course.findUnique({
      where: { id },
      select: { instructorId: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== currentUser!.sub) {
      throw new ForbiddenException('Instructors can manage only their own courses');
    }
  }

  private mapCourse(
    course: any,
    isEnrolled = false,
    paymentStatus?: string | null,
    paymentId?: string | null,
  ) {
    const priceNumber = Number(course.price);
    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      instructor: course.instructor,
      category: {
        id: course.category.id,
        name: course.category.name,
        slug: course.category.slug,
      },
      thumbnailUrl: course.thumbnailUrl,
      price: priceNumber,
      currency: 'EGP',
      isFree: priceNumber === 0,
      totalDuration: course.totalDuration,
      lessonCount: course._count?.lessons ?? 0,
      enrollmentsCount: course._count?.enrollments ?? 0,
      isEnrolled,
      paymentStatus: paymentStatus ?? null,
      paymentId: paymentId ?? null,
      status: course.status.toLowerCase(),
      lessons: course.lessons,
      createdAt: course.createdAt.toISOString(),
    };
  }
}
