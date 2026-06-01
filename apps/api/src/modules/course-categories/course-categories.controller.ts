import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuditAction, uuidSchema } from '@amg/shared';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { parseWithSchema } from '../../common/utils/zod.utils';
import { CourseCategoriesService } from './course-categories.service';

@Controller('course-categories')
export class CourseCategoriesController {
  constructor(private readonly service: CourseCategoriesService) {}

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('courses:create')
  @AuditLog(AuditAction.Create, 'CourseCategory')
  async create(@Body() body: unknown) {
    return this.service.create(body as { name: string; slug: string; description?: string });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('courses:update')
  @AuditLog(AuditAction.Update, 'CourseCategory')
  async update(@Param('id') id: string, @Body() body: unknown) {
    return this.service.update(parseWithSchema(uuidSchema, id), body as { name?: string; slug?: string; description?: string });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('courses:delete')
  @AuditLog(AuditAction.Delete, 'CourseCategory')
  async remove(@Param('id') id: string) {
    return this.service.remove(parseWithSchema(uuidSchema, id));
  }
}
