import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuditAction, lessonSchema, updateLessonSchema, uuidSchema, type JwtPayload } from '@amg/shared';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { parseWithSchema } from '../../common/utils/zod.utils';
import { LessonsService } from './lessons.service';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('courses:read')
  async findAll(@CurrentUser() user: JwtPayload, @Query('courseId') courseId: string) {
    return this.lessonsService.findAll(courseId, user);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('courses:update')
  @AuditLog(AuditAction.Create, 'Lesson')
  async create(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    return this.lessonsService.create(parseWithSchema(lessonSchema, body), user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('courses:update')
  @AuditLog(AuditAction.Update, 'Lesson')
  async update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() body: unknown) {
    return this.lessonsService.update(parseWithSchema(uuidSchema, id), parseWithSchema(updateLessonSchema, body), user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('courses:delete')
  @AuditLog(AuditAction.Delete, 'Lesson')
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.lessonsService.remove(parseWithSchema(uuidSchema, id), user);
  }
}
