import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { ExportsService } from './exports.service';

@Controller('exports')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Post('users')
  @RequirePermission('exports:create')
  async exportUsers(@Body() body: unknown, @Res() res: Response) {
    await this.exportsService.exportUsers(body as Record<string, string>, res);
  }

  @Post('registrations')
  @RequirePermission('exports:create')
  async exportRegistrations(@Body() body: unknown, @Res() res: Response) {
    await this.exportsService.exportRegistrations(body as Record<string, string>, res);
  }

  @Post('attendance')
  @RequirePermission('exports:create')
  async exportAttendance(@Body() body: unknown, @Res() res: Response) {
    await this.exportsService.exportAttendance(body as Record<string, string>, res);
  }

  @Post('payments')
  @RequirePermission('exports:create')
  async exportPayments(@Body() body: unknown, @Res() res: Response) {
    await this.exportsService.exportPayments(body as Record<string, string>, res);
  }

  @Post('enrollments')
  @RequirePermission('exports:create')
  async exportEnrollments(@Body() body: unknown, @Res() res: Response) {
    await this.exportsService.exportEnrollments(body as Record<string, string>, res);
  }
}
