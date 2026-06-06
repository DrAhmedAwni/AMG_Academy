import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import type { JwtPayload } from '@amg/shared';
import { AuditAction, courseFiltersSchema, courseSchema, updateCourseSchema, uuidSchema } from '@amg/shared';
import { Throttle } from '@nestjs/throttler';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { adminThrottle } from '../../common/guards/throttler.config';
import { ApiCacheInterceptor, CacheConfig } from '../../common/interceptors/cache.interceptor';
import { parseWithSchema } from '../../common/utils/zod.utils';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @UseInterceptors(ApiCacheInterceptor)
  @CacheConfig({ keyPrefix: 'courses:public', ttlSeconds: 120, varyByUser: true })
  async findAllPublic(@Query() query: Record<string, string | undefined>, @CurrentUser() user?: JwtPayload) {
    return this.coursesService.findAllPublic(parseWithSchema(courseFiltersSchema, query), user?.sub);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('courses:read')
  @Throttle(adminThrottle)
  async findAllAdmin(@CurrentUser() user: JwtPayload, @Query() query: Record<string, string | undefined>) {
    return this.coursesService.findAllAdmin(parseWithSchema(courseFiltersSchema, query), user);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('courses:read')
  @Throttle(adminThrottle)
  async findAdminById(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.coursesService.findById(parseWithSchema(uuidSchema, id), user);
  }

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  async findBySlug(@Param('slug') slug: string, @CurrentUser() user?: JwtPayload) {
    return this.coursesService.findBySlug(slug, user?.sub);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('courses:create')
  @AuditLog(AuditAction.Create, 'Course')
  async create(@Body() body: unknown) {
    return this.coursesService.create(parseWithSchema(courseSchema, body));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('courses:update')
  @AuditLog(AuditAction.Update, 'Course')
  async update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() body: unknown) {
    return this.coursesService.update(parseWithSchema(uuidSchema, id), parseWithSchema(updateCourseSchema, body), user);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('courses:update')
  @AuditLog(AuditAction.Publish, 'Course')
  async publish(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.coursesService.publish(parseWithSchema(uuidSchema, id), user);
  }

  @Post(':id/archive')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('courses:update')
  @AuditLog(AuditAction.Archive, 'Course')
  async archive(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.coursesService.archive(parseWithSchema(uuidSchema, id), user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('courses:delete')
  @AuditLog(AuditAction.Delete, 'Course')
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.coursesService.remove(parseWithSchema(uuidSchema, id), user);
  }

  @Delete(':id/hard')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('courses:delete')
  @AuditLog(AuditAction.Delete, 'Course')
  async hardDelete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.coursesService.hardDelete(parseWithSchema(uuidSchema, id), user);
  }
}
