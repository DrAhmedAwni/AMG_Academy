import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import type { JwtPayload } from '@amg/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findMine(@CurrentUser() user: JwtPayload, @Query() query: Record<string, string | undefined>) {
    return this.notificationsService.findMine(user.sub, query);
  }

  @Patch(':id/read')
  async markAsRead(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.notificationsService.markAsRead(user.sub, id);
  }

  @Patch('read-all')
  async markAllRead(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.markAllRead(user.sub);
  }

  @Get('preferences')
  async getPreferences(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.getPreferences(user.sub);
  }

  @Patch('preferences')
  async updatePreferences(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    return this.notificationsService.updatePreferences(user.sub, body as Record<string, boolean>);
  }

  @Post('push-token')
  async registerPushToken(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    return this.notificationsService.registerPushToken(user.sub, body as { token?: unknown });
  }

  @Delete('push-token')
  async unregisterPushToken(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    return this.notificationsService.unregisterPushToken(user.sub, body as { token?: unknown });
  }
}
