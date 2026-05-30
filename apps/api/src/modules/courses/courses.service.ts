import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, CourseStatus } from '@prisma/client';
import { CacheStoreService } from '../../common/interceptors/cache.interceptor';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateCourseDto, UpdateCourseDto } from './dto/courses.dto';

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheStore: CacheStoreService,
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
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.CourseWhereInput = {};

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

    let isEnrolled = false;
    let paymentStatus: string | null = null;
    let paymentId: string | null = null;
    if (userId) {
      const enrollment = await this.prisma.courseEnrollment.findUnique({
        where: { userId_courseId: { userId, courseId: course.id } },
        include: { payment: { select: { id: true, status: true } } },
      });
      isEnrolled = !!enrollment && enrollment.status !== 'CANCELLED';
      if (enrollment?.payment) {
        paymentStatus = enrollment.payment.status.toLowerCase();
        paymentId = enrollment.payment.id;
      }
    }

    return this.mapCourse(course, isEnrolled, paymentStatus, paymentId);
  }

  async findById(id: string) {
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

  async update(id: string, data: UpdateCourseDto) {
    const updateData: Prisma.CourseUpdateInput = { ...data };
    if (data.price !== undefined) {
      updateData.price = new Prisma.Decimal(data.price);
      updateData.isFree = data.price === 0;
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

  async publish(id: string) {
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
    return this.mapCourse(course);
  }

  async archive(id: string) {
    const course = await this.prisma.course.update({
      where: { id },
      data: { status: CourseStatus.ARCHIVED },
      include: {
        category: true,
        instructor: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { enrollments: true, lessons: true } },
      },
    });
    await this.cacheStore.invalidatePrefix('courses:public');
    return this.mapCourse(course);
  }

  async remove(id: string) {
    await this.prisma.course.update({
      where: { id },
      data: { status: CourseStatus.ARCHIVED },
    });
    await this.cacheStore.invalidatePrefix('courses:public');
    return { id, deleted: true };
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
      status: course.status,
      lessons: course.lessons,
      createdAt: course.createdAt.toISOString(),
    };
  }
}
