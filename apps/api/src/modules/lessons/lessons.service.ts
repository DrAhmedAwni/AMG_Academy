import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { JwtPayload } from '@amg/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(courseId: string, currentUser: JwtPayload) {
    await this.assertCanAccessCourse(courseId, currentUser);
    const lessons = await this.prisma.lesson.findMany({
      where: { courseId },
      orderBy: { orderIndex: 'asc' },
      include: { video: { select: { id: true, duration: true, originalName: true } } },
    });
    return { data: lessons };
  }

  async create(data: {
    title: string;
    description?: string | null;
    courseId: string;
    orderIndex: number;
    duration?: number;
    videoId?: string | null;
  }, currentUser: JwtPayload) {
    await this.assertCanAccessCourse(data.courseId, currentUser);
    const lesson = await this.prisma.lesson.create({
      data: {
        title: data.title,
        description: data.description,
        course: { connect: { id: data.courseId } },
        orderIndex: data.orderIndex,
        duration: data.duration ?? 0,
        ...(data.videoId && { video: { connect: { id: data.videoId } } }),
      },
      include: { video: { select: { id: true, duration: true, originalName: true } } },
    });
    return lesson;
  }

  async update(id: string, data: {
    title?: string;
    description?: string | null;
    orderIndex?: number;
    duration?: number;
    videoId?: string | null;
  }, currentUser: JwtPayload) {
    const existing = await this.prisma.lesson.findUnique({
      where: { id },
      select: { courseId: true },
    });

    if (!existing) {
      throw new NotFoundException('Lesson not found');
    }

    await this.assertCanAccessCourse(existing.courseId, currentUser);

    const updateData: any = { ...data };
    if (data.videoId !== undefined) {
      if (data.videoId) {
        updateData.video = { connect: { id: data.videoId } };
      } else {
        updateData.video = { disconnect: true };
      }
      delete updateData.videoId;
    }

    const lesson = await this.prisma.lesson.update({
      where: { id },
      data: updateData,
      include: { video: { select: { id: true, duration: true, originalName: true } } },
    });
    return lesson;
  }

  async remove(id: string, currentUser: JwtPayload) {
    const existing = await this.prisma.lesson.findUnique({
      where: { id },
      select: { courseId: true },
    });

    if (!existing) {
      throw new NotFoundException('Lesson not found');
    }

    await this.assertCanAccessCourse(existing.courseId, currentUser);
    await this.prisma.lesson.delete({ where: { id } });
    return { id, deleted: true };
  }

  private async assertCanAccessCourse(courseId: string, currentUser: JwtPayload) {
    if (currentUser.permissions.includes('*:*') || currentUser.role !== 'instructor') {
      return;
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== currentUser.sub) {
      throw new ForbiddenException('Instructors can manage only their own lessons');
    }
  }
}
