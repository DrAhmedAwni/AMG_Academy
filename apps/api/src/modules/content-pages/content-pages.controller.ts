import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuditAction, uuidSchema } from '@amg/shared';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { parseWithSchema } from '../../common/utils/zod.utils';
import { ContentPagesService } from './content-pages.service';

@Controller('content-pages')
export class ContentPagesController {
  constructor(private readonly contentPagesService: ContentPagesService) {}

  @Get()
  async findAllPublic() {
    return this.contentPagesService.findAllPublic();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content_pages:read')
  async findAllAdmin() {
    return this.contentPagesService.findAllAdmin();
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.contentPagesService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content_pages:create')
  @AuditLog(AuditAction.Create, 'StaticContentPage')
  async create(@Body() body: unknown) {
    return this.contentPagesService.create(body as { title: string; slug: string; body: string });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content_pages:update')
  @AuditLog(AuditAction.Update, 'StaticContentPage')
  async update(@Param('id') id: string, @Body() body: unknown) {
    return this.contentPagesService.update(parseWithSchema(uuidSchema, id), body as { title?: string; slug?: string; body?: string });
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content_pages:update')
  @AuditLog(AuditAction.Publish, 'StaticContentPage')
  async publish(@Param('id') id: string) {
    return this.contentPagesService.publish(parseWithSchema(uuidSchema, id));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('content_pages:delete')
  @AuditLog(AuditAction.Delete, 'StaticContentPage')
  async remove(@Param('id') id: string) {
    return this.contentPagesService.remove(parseWithSchema(uuidSchema, id));
  }
}
