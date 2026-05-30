import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { JwtPayload } from '@amg/shared';
import { attendanceFiltersSchema } from '@amg/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { parseWithSchema } from '../../common/utils/zod.utils';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  async findMine(@CurrentUser() user: JwtPayload, @Query() query: Record<string, string | undefined>) {
    return this.attendanceService.findMine(user.sub, parseWithSchema(attendanceFiltersSchema, query));
  }

  @Get('scanner/recent')
  @UseGuards(PermissionGuard)
  @RequirePermission('scanner:use')
  async findScannerRecent(
    @CurrentUser() user: JwtPayload,
    @Query() query: Record<string, string | undefined>,
  ) {
    return this.attendanceService.findMine(user.sub, parseWithSchema(attendanceFiltersSchema, query));
  }

  @Get('admin')
  @UseGuards(PermissionGuard)
  @RequirePermission('attendance:read')
  async findAllAdmin(@Query() query: Record<string, string | undefined>) {
    return this.attendanceService.findAllAdmin(parseWithSchema(attendanceFiltersSchema, query));
  }
}
