import { Injectable } from '@nestjs/common';
import { InAppChannel } from './channels/in-app.channel';
import { EmailChannel } from './channels/email.channel';
import { PushChannel } from './channels/push.channel';
import { NotificationPayload } from './channels/notification-channel.interface';

export type NotificationDeliveryChannel = 'in_app' | 'email' | 'push';

@Injectable()
export class NotificationService {
  constructor(
    private readonly inApp: InAppChannel,
    private readonly email: EmailChannel,
    private readonly push: PushChannel,
  ) {}

  async send(payload: NotificationPayload, channels: NotificationDeliveryChannel[] = ['in_app']) {
    const promises: Promise<void>[] = [];
    if (channels.includes('in_app')) {
      promises.push(this.inApp.send(payload).catch(() => {}));
    }
    if (channels.includes('email')) {
      promises.push(this.email.send(payload).catch(() => {}));
    }
    if (channels.includes('push')) {
      promises.push(this.push.send(payload).catch(() => {}));
    }
    await Promise.all(promises);
  }
}
