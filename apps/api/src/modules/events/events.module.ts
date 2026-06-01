import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventReminderScheduler } from './event-reminder.scheduler';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [EventsController],
  providers: [EventsService, EventReminderScheduler],
  exports: [EventsService],
})
export class EventsModule {}
