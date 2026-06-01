import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuditAction, uuidSchema } from '@amg/shared';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { parseWithSchema } from '../../common/utils/zod.utils';
import {
  announcementFiltersSchema,
  announcementSchema,
  updateAnnouncementSchema,
} from './dto/announcements.dto';
import { AnnouncementsService } from './announcements.service';

@Controller('announcements')
@UseGuards(JwtAuthGuard)
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  async findPublished(@Query() query: Record<string, string | undefined>) {
    return this.announcementsService.findAll({
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 25,
      search: query.search,
      status: 'published',
    });
  }

  @Get('admin')
  @UseGuards(PermissionGuard)
  @RequirePermission('announcements:read')
  async findAll(@Query() query: Record<string, string | undefined>) {
    const input = parseWithSchema(announcementFiltersSchema, query);
    return this.announcementsService.findAll({
      page: input.page ?? 1,
      limit: input.limit ?? 25,
      search: input.search,
      status: input.status,
    });
  }

  @Post()
  @UseGuards(PermissionGuard)
  @RequirePermission('announcements:create')
  @AuditLog(AuditAction.Create, 'Announcement')
  async create(@Body() body: unknown) {
    const input = parseWithSchema(announcementSchema, body);
    return this.announcementsService.create({
      title: input.title,
      body: input.body,
      targetRoles: input.targetRoles ?? [],
    });
  }

  @Patch(':id')
  @UseGuards(PermissionGuard)
  @RequirePermission('announcements:update')
  @AuditLog(AuditAction.Update, 'Announcement')
  async update(@Param('id') id: string, @Body() body: unknown) {
    return this.announcementsService.update(
      parseWithSchema(uuidSchema, id),
      parseWithSchema(updateAnnouncementSchema, body),
    );
  }

  @Post(':id/publish')
  @UseGuards(PermissionGuard)
  @RequirePermission('announcements:update')
  @AuditLog(AuditAction.Publish, 'Announcement')
  async publish(@Param('id') id: string) {
    return this.announcementsService.publish(parseWithSchema(uuidSchema, id));
  }

  @Post(':id/archive')
  @UseGuards(PermissionGuard)
  @RequirePermission('announcements:update')
  @AuditLog(AuditAction.Archive, 'Announcement')
  async archive(@Param('id') id: string) {
    return this.announcementsService.archive(parseWithSchema(uuidSchema, id));
  }

  @Delete(':id')
  @UseGuards(PermissionGuard)
  @RequirePermission('announcements:delete')
  @AuditLog(AuditAction.Delete, 'Announcement')
  async remove(@Param('id') id: string) {
    return this.announcementsService.remove(parseWithSchema(uuidSchema, id));
  }
}
