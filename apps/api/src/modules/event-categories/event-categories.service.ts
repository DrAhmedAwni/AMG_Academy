import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateEventCategoryDto, UpdateEventCategoryDto } from './dto/event-categories.dto';

@Injectable()
export class EventCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateEventCategoryDto) {
    return this.prisma.eventCategory.create({ data });
  }

  async findAll() {
    return this.prisma.eventCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { events: true } },
        events: {
          select: {
            id: true,
            title: true,
            slug: true,
            startDate: true,
            status: true,
            price: true,
            capacity: true,
          },
          orderBy: { startDate: 'desc' },
          take: 50,
        },
      },
    });
  }

  async findById(id: string) {
    const category = await this.prisma.eventCategory.findUnique({
      where: { id },
      include: {
        _count: { select: { events: true } },
        events: {
          select: {
            id: true,
            title: true,
            slug: true,
            startDate: true,
            status: true,
            price: true,
            capacity: true,
          },
          orderBy: { startDate: 'desc' },
        },
      },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, data: UpdateEventCategoryDto) {
    await this.findById(id);
    return this.prisma.eventCategory.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.eventCategory.delete({ where: { id } });
    return { id, deleted: true };
  }
}
