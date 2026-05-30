import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CourseCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.courseCategory.findMany({
      orderBy: { name: 'asc' },
    });
    return { data: categories };
  }

  async create(data: { name: string; slug: string; description?: string }) {
    try {
      const category = await this.prisma.courseCategory.create({ data });
      return category;
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException('Category with this name or slug already exists');
      }
      throw e;
    }
  }

  async update(id: string, data: { name?: string; slug?: string; description?: string }) {
    try {
      const category = await this.prisma.courseCategory.update({
        where: { id },
        data,
      });
      return category;
    } catch (e: any) {
      if (e.code === 'P2025') {
        throw new NotFoundException('Category not found');
      }
      if (e.code === 'P2002') {
        throw new ConflictException('Category with this name or slug already exists');
      }
      throw e;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.courseCategory.delete({ where: { id } });
      return { id, deleted: true };
    } catch (e: any) {
      if (e.code === 'P2025') {
        throw new NotFoundException('Category not found');
      }
      throw e;
    }
  }
}
