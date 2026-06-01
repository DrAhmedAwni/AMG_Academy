import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannelType } from '@amg/shared';
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
    const devices = await this.prisma.pushDevice.findMany({
      where: { userId: payload.userId, enabled: true },
      select: { id: true, expoPushToken: true },
    });

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
      this.logger.warn(`Expo push request failed with status ${response.status}`);
      return;
    }

    const result = (await response.json().catch(() => null)) as
      | { data?: Array<{ status?: string; details?: { error?: string } }> }
      | null;

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
}
