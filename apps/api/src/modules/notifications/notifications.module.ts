import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { InAppChannel } from './channels/in-app.channel';
import { EmailChannel } from './channels/email.channel';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationService } from './notification.service';
import { NotificationTriggers } from './notification-triggers';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationService, NotificationTriggers, InAppChannel, EmailChannel],
  exports: [NotificationsService, NotificationService, NotificationTriggers],
})
export class NotificationsModule {}
