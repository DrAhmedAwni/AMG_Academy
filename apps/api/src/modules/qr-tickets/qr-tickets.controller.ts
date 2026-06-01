import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { JwtPayload } from '@amg/shared';
import {
  AuditAction,
  qrScanSchema,
  qrTicketFiltersSchema,
  uuidSchema,
} from '@amg/shared';
import { Throttle } from '@nestjs/throttler';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { adminThrottle, qrThrottle } from '../../common/guards/throttler.config';
import { parseWithSchema } from '../../common/utils/zod.utils';
import { QrTicketsService } from './qr-tickets.service';

@Controller('qr-tickets')
@UseGuards(JwtAuthGuard)
export class QrTicketsController {
  constructor(private readonly qrTicketsService: QrTicketsService) {}

  @Get()
  async findMine(@CurrentUser() user: JwtPayload, @Query() query: Record<string, string | undefined>) {
    return this.qrTicketsService.findMine(user.sub, parseWithSchema(qrTicketFiltersSchema, query));
  }

  @Get('admin')
  @UseGuards(PermissionGuard)
  @RequirePermission('qr-tickets:read')
  @Throttle(adminThrottle)
  async findAllAdmin(@Query() query: Record<string, string | undefined>) {
    return this.qrTicketsService.findAllAdmin(parseWithSchema(qrTicketFiltersSchema, query));
  }

  @Post(':id/regenerate')
  @UseGuards(PermissionGuard)
  @RequirePermission('qr-tickets:update')
  @AuditLog(AuditAction.Update, 'QRTicket')
  async regenerate(@Param('id') id: string) {
    return this.qrTicketsService.regenerate(parseWithSchema(uuidSchema, id));
  }

  @Post(':id/revoke')
  @UseGuards(PermissionGuard)
  @RequirePermission('qr-tickets:update')
  @AuditLog(AuditAction.Revoke, 'QRTicket')
  async revoke(@Param('id') id: string) {
    return this.qrTicketsService.revoke(parseWithSchema(uuidSchema, id));
  }
}

@Controller('qr')
export class QrScanController {
  constructor(private readonly qrTicketsService: QrTicketsService) {}

  @Post('scan')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('scanner:use')
  @AuditLog(AuditAction.Scan, 'AttendanceCheckIn')
  @Throttle(qrThrottle)
  async scan(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    return this.qrTicketsService.scan(user.sub, parseWithSchema(qrScanSchema, body));
  }
}
