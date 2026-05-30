import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import type { JwtPayload } from '@amg/shared';
import { AuditAction, eventFiltersSchema, eventSchema, updateEventSchema, uuidSchema } from '@amg/shared';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { adminThrottle } from '../../common/guards/throttler.config';
import { ApiCacheInterceptor, CacheConfig } from '../../common/interceptors/cache.interceptor';
import { parseWithSchema } from '../../common/utils/zod.utils';
import { EventsService } from './events.service';
import { Throttle } from '@nestjs/throttler';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @UseInterceptors(ApiCacheInterceptor)
  @CacheConfig({ keyPrefix: 'events:public', ttlSeconds: 120, varyByUser: true })
  async findAllPublic(@Query() query: Record<string, string | undefined>, @CurrentUser() user?: JwtPayload) {
    return this.eventsService.findAllPublic(parseWithSchema(eventFiltersSchema, query), user?.sub);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('events:read')
  @Throttle(adminThrottle)
  async findAllAdmin(@Query() query: Record<string, string | undefined>) {
    return this.eventsService.findAllAdmin(parseWithSchema(eventFiltersSchema, query));
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('events:read')
  @Throttle(adminThrottle)
  async findAdminById(@Param('id') id: string) {
    return this.eventsService.findById(parseWithSchema(uuidSchema, id));
  }

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  async findBySlug(@Param('slug') slug: string, @CurrentUser() user?: JwtPayload) {
    return this.eventsService.findBySlug(slug, user?.sub);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('events:create')
  @AuditLog(AuditAction.Create, 'Event')
  async create(@Body() body: unknown) {
    return this.eventsService.create(parseWithSchema(eventSchema, body));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('events:update')
  @AuditLog(AuditAction.Update, 'Event')
  async update(@Param('id') id: string, @Body() body: unknown) {
    return this.eventsService.update(parseWithSchema(uuidSchema, id), parseWithSchema(updateEventSchema, body));
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('events:update')
  @AuditLog(AuditAction.Publish, 'Event')
  async publish(@Param('id') id: string) {
    return this.eventsService.publish(parseWithSchema(uuidSchema, id));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('events:delete')
  @AuditLog(AuditAction.Delete, 'Event')
  async remove(@Param('id') id: string) {
    return this.eventsService.remove(parseWithSchema(uuidSchema, id));
  }
}
