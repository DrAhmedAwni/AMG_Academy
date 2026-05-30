import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@amg/shared';
import { AnnouncementStatus, UserStatus, type Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notifications/notification.service';
import type {
  AnnouncementDto,
  AnnouncementFiltersDto,
  UpdateAnnouncementDto,
} from './dto/announcements.dto';

@Injectable()
export class AnnouncementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async findAll(query: AnnouncementFiltersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const where: Prisma.AnnouncementWhereInput = {
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { body: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query.status ? { status: this.mapStatus(query.status) } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.announcement.findMany({
        where,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.announcement.count({ where }),
    ]);

    return {
      items: items.map((announcement) => this.mapAnnouncement(announcement)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async create(input: AnnouncementDto) {
    const announcement = await this.prisma.announcement.create({
      data: input,
    });
    return this.mapAnnouncement(announcement);
  }

  async update(id: string, input: UpdateAnnouncementDto) {
    await this.ensureExists(id);
    const announcement = await this.prisma.announcement.update({
      where: { id },
      data: input,
    });
    return this.mapAnnouncement(announcement);
  }

  async publish(id: string) {
    const existing = await this.ensureExists(id);
    const announcement = await this.prisma.announcement.update({
      where: { id },
      data: {
        status: AnnouncementStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    if (existing.status !== AnnouncementStatus.PUBLISHED) {
      await this.notifyPublishedAnnouncement(announcement);
    }

    return this.mapAnnouncement(announcement);
  }

  async archive(id: string) {
    await this.ensureExists(id);
    const announcement = await this.prisma.announcement.update({
      where: { id },
      data: {
        status: AnnouncementStatus.ARCHIVED,
      },
    });
    return this.mapAnnouncement(announcement);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.announcement.delete({
      where: { id },
    });
    return null;
  }

  private async ensureExists(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    return announcement;
  }

  private async notifyPublishedAnnouncement(announcement: {
    id: string;
    title: string;
    body: string;
    targetRoles: string[];
  }) {
    const users = await this.prisma.user.findMany({
      where: {
        status: UserStatus.ACTIVE,
        ...(announcement.targetRoles.length > 0
          ? { role: { slug: { in: announcement.targetRoles } } }
          : {}),
      },
      select: { id: true },
    });

    const message = this.toPlainText(announcement.body) || 'A new AMG Academy announcement is available.';
    await Promise.all(
      users.map((user) =>
        this.notificationService.send(
          {
            userId: user.id,
            type: NotificationType.NewAnnouncement,
            title: announcement.title,
            message,
            entityType: 'Announcement',
            entityId: announcement.id,
          },
          ['in_app'],
        ),
      ),
    );
  }

  private toPlainText(value: string) {
    return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500);
  }

  private mapStatus(status: string) {
    const normalized = status.toLowerCase();
    if (normalized === 'published') {
      return AnnouncementStatus.PUBLISHED;
    }
    if (normalized === 'archived') {
      return AnnouncementStatus.ARCHIVED;
    }
    return AnnouncementStatus.DRAFT;
  }

  private mapAnnouncement(announcement: {
    id: string;
    title: string;
    body: string;
    targetRoles: string[];
    status: AnnouncementStatus;
    publishedAt: Date | null;
    createdAt: Date;
  }) {
    return {
      id: announcement.id,
      title: announcement.title,
      body: announcement.body,
      targetRoles: announcement.targetRoles,
      status: announcement.status.toLowerCase(),
      publishedAt: announcement.publishedAt?.toISOString() ?? null,
      createdAt: announcement.createdAt.toISOString(),
    };
  }
}
