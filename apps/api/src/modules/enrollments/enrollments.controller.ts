import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import type { JwtPayload } from '@amg/shared';
import { enrollmentSchema, progressUpdateSchema, uuidSchema } from '@amg/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { parseWithSchema } from '../../common/utils/zod.utils';
import { EnrollmentsService } from './enrollments.service';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findMine(
    @CurrentUser() user: JwtPayload,
    @Query() query: Record<string, string | undefined>,
  ) {
    return this.enrollmentsService.findMine(user.sub, query);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('enrollments:read')
  async findAllAdmin(@Query() query: Record<string, string | undefined>) {
    return this.enrollmentsService.findAllAdmin(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async enroll(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    return this.enrollmentsService.enroll(user.sub, parseWithSchema(enrollmentSchema, body));
  }

  @Patch(':id/progress')
  @UseGuards(JwtAuthGuard)
  async updateProgress(
    @CurrentUser() user: JwtPayload,
    @Param('id') enrollmentId: string,
    @Body() body: unknown,
  ) {
    return this.enrollmentsService.updateProgress(
      user.sub,
      parseWithSchema(uuidSchema, enrollmentId),
      parseWithSchema(progressUpdateSchema, body),
    );
  }
}
