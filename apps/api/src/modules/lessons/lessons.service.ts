import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(courseId: string) {
    const lessons = await this.prisma.lesson.findMany({
      where: { courseId },
      orderBy: { orderIndex: 'asc' },
      include: { video: { select: { id: true, duration: true } } },
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
  }) {
    const lesson = await this.prisma.lesson.create({
      data: {
        title: data.title,
        description: data.description,
        course: { connect: { id: data.courseId } },
        orderIndex: data.orderIndex,
        duration: data.duration ?? 0,
        ...(data.videoId && { video: { connect: { id: data.videoId } } }),
      },
      include: { video: { select: { id: true, duration: true } } },
    });
    return lesson;
  }

  async update(id: string, data: {
    title?: string;
    description?: string | null;
    orderIndex?: number;
    duration?: number;
    videoId?: string | null;
  }) {
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
      include: { video: { select: { id: true, duration: true } } },
    });
    return lesson;
  }

  async remove(id: string) {
    await this.prisma.lesson.delete({ where: { id } });
    return { id, deleted: true };
  }
}
