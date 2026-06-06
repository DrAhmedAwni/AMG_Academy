import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannelType, NotificationType } from '@amg/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { EXPO_PUSH_TOKEN_REGEX } from '../notifications.constants';
import {
  NotificationChannel,
  NotificationPayload,
} from './notification-channel.interface';

@Injectable()
export class PushChannel implements NotificationChannel {
  readonly type = NotificationChannelType.Push;
  private readonly logger = new Logger(PushChannel.name);

  constructor(private readonly prisma: PrismaService) {}

  async send(payload: NotificationPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        notificationPreferences: true,
        pushDevices: {
          where: { enabled: true },
          select: { id: true, expoPushToken: true },
        },
      },
    });

    if (!user || !this.canReceivePush(user.notificationPreferences, payload.type)) {
      return;
    }

    const devices = user.pushDevices;
    const validDevices = devices.filter((device) => this.isExpoPushToken(device.expoPushToken));
    if (validDevices.length === 0) {
      return;
    }

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        validDevices.map((device) => ({
          to: device.expoPushToken,
          title: payload.title,
          body: payload.message,
          sound: 'default',
          data: {
            type: payload.type,
            entityType: payload.entityType,
            entityId: payload.entityId,
          },
        })),
      ),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      this.logger.warn(`Expo push request failed with status ${response.status}: ${errorText.slice(0, 300)}`);
      return;
    }

    const result = (await response.json().catch(() => null)) as
      | { data?: Array<{ status?: string; details?: { error?: string }; message?: string }> }
      | null;

    const failedTickets = result?.data?.filter((ticket) => ticket.status === 'error') ?? [];
    if (failedTickets.length > 0) {
      this.logger.warn(
        `Expo push returned ${failedTickets.length} failed ticket(s): ${JSON.stringify(failedTickets).slice(0, 500)}`,
      );
    }

    const disabledDeviceIds = validDevices
      .filter((device, index) => result?.data?.[index]?.details?.error === 'DeviceNotRegistered')
      .map((device) => device.id);

    if (disabledDeviceIds.length > 0) {
      await this.prisma.pushDevice.updateMany({
        where: { id: { in: disabledDeviceIds } },
        data: { enabled: false },
      });
    }
  }

  private isExpoPushToken(token: string) {
    return EXPO_PUSH_TOKEN_REGEX.test(token);
  }

  private canReceivePush(preferences: unknown, type: NotificationType) {
    const prefs = preferences && typeof preferences === 'object'
      ? (preferences as Record<string, unknown>)
      : {};

    if (prefs.push === false) {
      return false;
    }

    const preferenceKey = this.preferenceKeyForType(type);
    return preferenceKey ? prefs[preferenceKey] !== false : true;
  }

  private preferenceKeyForType(type: NotificationType) {
    switch (type) {
      case NotificationType.RegistrationSubmitted:
      case NotificationType.RegistrationApproved:
      case NotificationType.RegistrationRejected:
      case NotificationType.QrIssued:
        return 'registrationUpdates';
      case NotificationType.PaymentSuccessful:
      case NotificationType.PaymentFailed:
        return 'paymentUpdates';
      case NotificationType.NewCoursePublished:
      case NotificationType.NewEnrollment:
      case NotificationType.CourseCompleted:
        return 'courseUpdates';
      case NotificationType.EventReminder:
      case NotificationType.EventCancelled:
        return 'eventReminders';
      case NotificationType.NewAnnouncement:
        return 'announcementUpdates';
      default:
        return null;
    }
  }
}
