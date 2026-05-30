import { Injectable } from '@nestjs/common';
import { InAppChannel } from './channels/in-app.channel';
import { EmailChannel } from './channels/email.channel';
import { NotificationPayload } from './channels/notification-channel.interface';

@Injectable()
export class NotificationService {
  constructor(
    private readonly inApp: InAppChannel,
    private readonly email: EmailChannel,
  ) {}

  async send(payload: NotificationPayload, channels: ('in_app' | 'email')[] = ['in_app']) {
    const promises: Promise<void>[] = [];
    if (channels.includes('in_app')) {
      promises.push(this.inApp.send(payload).catch(() => {}));
    }
    if (channels.includes('email')) {
      promises.push(this.email.send(payload).catch(() => {}));
    }
    await Promise.all(promises);
  }
}
