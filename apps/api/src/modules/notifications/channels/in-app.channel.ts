import { Injectable } from '@nestjs/common';
import { NotificationChannelType } from '@amg/shared';
import { PrismaService } from '../../prisma/prisma.service';
import {
  NotificationChannel,
  NotificationPayload,
} from './notification-channel.interface';

@Injectable()
export class InAppChannel implements NotificationChannel {
  readonly type = NotificationChannelType.InApp;

  constructor(private readonly prisma: PrismaService) {}

  async send(payload: NotificationPayload) {
    await this.prisma.notification.create({
      data: {
        userId: payload.userId,
        type: payload.type as never,
        title: payload.title,
        message: payload.message,
        entityType: payload.entityType,
        entityId: payload.entityId,
        channels: [this.type as never],
      },
    });
  }
}
