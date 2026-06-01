import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuditAction, eventCategorySchema, uuidSchema } from '@amg/shared';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { parseWithSchema } from '../../common/utils/zod.utils';
import { EventCategoriesService } from './event-categories.service';

@Controller('event-categories')
export class EventCategoriesController {
  constructor(private readonly eventCategoriesService: EventCategoriesService) {}

  @Get()
  async findAll() {
    return this.eventCategoriesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('events:create')
  @AuditLog(AuditAction.Create, 'EventCategory')
  async create(@Body() body: unknown) {
    return this.eventCategoriesService.create(parseWithSchema(eventCategorySchema, body));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('events:update')
  @AuditLog(AuditAction.Update, 'EventCategory')
  async update(@Param('id') id: string, @Body() body: unknown) {
    return this.eventCategoriesService.update(parseWithSchema(uuidSchema, id), parseWithSchema(eventCategorySchema.partial(), body));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('events:delete')
  @AuditLog(AuditAction.Delete, 'EventCategory')
  async remove(@Param('id') id: string) {
    return this.eventCategoriesService.remove(parseWithSchema(uuidSchema, id));
  }
}
