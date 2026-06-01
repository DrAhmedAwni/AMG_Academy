import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventsService } from './events.service';

@Injectable()
export class EventReminderScheduler {
  private readonly logger = new Logger(EventReminderScheduler.name);

  constructor(private readonly eventsService: EventsService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleEventReminders() {
    this.logger.log('Running event reminder check');
    try {
      await this.eventsService.sendEventReminders();
    } catch (error) {
      this.logger.error('Event reminder check failed', error);
    }
  }
}
