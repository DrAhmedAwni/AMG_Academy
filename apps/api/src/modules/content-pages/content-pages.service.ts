import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentPageStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentPagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPublic() {
    const pages = await this.prisma.staticContentPage.findMany({
      where: { status: ContentPageStatus.PUBLISHED },
      orderBy: { title: 'asc' },
    });
    return { data: pages };
  }

  async findAllAdmin() {
    const pages = await this.prisma.staticContentPage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { data: pages };
  }

  async findBySlug(slug: string) {
    const page = await this.prisma.staticContentPage.findUnique({ where: { slug } });
    if (!page) throw new NotFoundException('Content page not found');
    return page;
  }

  async create(data: { title: string; slug: string; body: string }) {
    const page = await this.prisma.staticContentPage.create({ data });
    return page;
  }

  async update(id: string, data: { title?: string; slug?: string; body?: string }) {
    const page = await this.prisma.staticContentPage.update({ where: { id }, data });
    return page;
  }

  async publish(id: string) {
    const page = await this.prisma.staticContentPage.update({
      where: { id },
      data: { status: ContentPageStatus.PUBLISHED, publishedAt: new Date() },
    });
    return page;
  }

  async remove(id: string) {
    await this.prisma.staticContentPage.delete({ where: { id } });
    return { id, deleted: true };
  }
}
