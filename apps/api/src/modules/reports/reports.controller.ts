import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('users')
  @RequirePermission('reports:read')
  async usersReport() {
    return this.reportsService.usersReport();
  }

  @Get('registrations')
  @RequirePermission('reports:read')
  async registrationsReport(@Query('eventId') eventId?: string) {
    return this.reportsService.registrationsReport(eventId);
  }

  @Get('attendance')
  @RequirePermission('reports:read')
  async attendanceReport(@Query('eventId') eventId?: string) {
    return this.reportsService.attendanceReport(eventId);
  }

  @Get('revenue')
  @RequirePermission('reports:read')
  async revenueReport() {
    return this.reportsService.revenueReport();
  }

  @Get('payments')
  @RequirePermission('reports:read')
  async paymentsReport() {
    return this.reportsService.paymentsReport();
  }

  @Get('courses')
  @RequirePermission('reports:read')
  async coursesReport() {
    return this.reportsService.coursesReport();
  }

  @Get('qr-scans')
  @RequirePermission('reports:read')
  async qrScansReport(@Query('eventId') eventId?: string) {
    return this.reportsService.qrScansReport(eventId);
  }
}
