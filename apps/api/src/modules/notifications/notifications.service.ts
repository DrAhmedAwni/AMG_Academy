import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EXPO_PUSH_TOKEN_REGEX } from './notifications.constants';
import { z } from 'zod';

const notificationPreferencesSchema = z.object({
  email: z.boolean(),
  inApp: z.boolean(),
  push: z.boolean(),
  registrationUpdates: z.boolean(),
  paymentUpdates: z.boolean(),
  courseUpdates: z.boolean(),
  eventReminders: z.boolean(),
});

const defaultNotificationPreferences = {
  email: true,
  inApp: true,
  push: true,
  registrationUpdates: true,
  paymentUpdates: true,
  courseUpdates: true,
  eventReminders: true,
} satisfies z.infer<typeof notificationPreferencesSchema>;

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMine(userId: string, query: Record<string, string | undefined>) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 25);
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (query.read !== undefined) {
      where.read = query.read === 'true';
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return {
      data: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        readAt: n.readAt?.toISOString() ?? null,
        entityType: n.entityType,
        entityId: n.entityId,
        createdAt: n.createdAt.toISOString(),
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), unreadCount },
    };
  }

  async markAsRead(userId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) throw new NotFoundException('Notification not found');

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { read: true, readAt: new Date() },
    });

    return {
      id: updated.id,
      read: updated.read,
      readAt: updated.readAt?.toISOString() ?? null,
    };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
    return { success: true };
  }

  async getPreferences(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPreferences: true } as never,
    });

    const parsedPreferences = notificationPreferencesSchema.safeParse(
      (user as { notificationPreferences?: unknown } | null)?.notificationPreferences,
    );

    return {
      data: parsedPreferences.success ? parsedPreferences.data : defaultNotificationPreferences,
    };
  }

  async updatePreferences(userId: string, preferences: Record<string, boolean>) {
    const sanitizedPreferences = notificationPreferencesSchema.parse(preferences);

    await this.prisma.user.update({
      where: { id: userId },
      data: { notificationPreferences: sanitizedPreferences } as never,
    });
    return { success: true };
  }

  async registerPushToken(
    userId: string,
    body: { token?: unknown; platform?: unknown; deviceId?: unknown },
  ) {
    const input = z
      .object({
        token: z
          .string()
          .trim()
          .regex(EXPO_PUSH_TOKEN_REGEX, 'Invalid Expo push token'),
        platform: z.string().trim().max(32).optional(),
        deviceId: z.string().trim().max(128).optional(),
      })
      .parse(body);

    const device = await this.prisma.pushDevice.upsert({
      where: { expoPushToken: input.token },
      update: {
        userId,
        platform: input.platform,
        deviceId: input.deviceId,
        enabled: true,
      },
      create: {
        userId,
        expoPushToken: input.token,
        platform: input.platform,
        deviceId: input.deviceId,
      },
    });

    return {
      id: device.id,
      enabled: device.enabled,
      platform: device.platform,
    };
  }

  async unregisterPushToken(userId: string, body: { token?: unknown }) {
    const input = z
      .object({
        token: z.string().trim().min(10).max(512),
      })
      .parse(body);

    await this.prisma.pushDevice.updateMany({
      where: { userId, expoPushToken: input.token },
      data: { enabled: false },
    });

    return { success: true };
  }
}
