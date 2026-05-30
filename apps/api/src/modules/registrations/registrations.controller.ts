import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { JwtPayload } from '@amg/shared';
import {
  AuditAction,
  registrationActionSchema,
  registrationFiltersSchema,
  registerForEventSchema,
  uuidSchema,
} from '@amg/shared';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { parseWithSchema } from '../../common/utils/zod.utils';
import { RegistrationsService } from './registrations.service';

@Controller('registrations')
@UseGuards(JwtAuthGuard)
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Get()
  async findMine(@CurrentUser() user: JwtPayload, @Query() query: Record<string, string | undefined>) {
    return this.registrationsService.findMine(user.sub, parseWithSchema(registrationFiltersSchema, query));
  }

  @Get('admin')
  @UseGuards(PermissionGuard)
  @RequirePermission('registrations:read')
  async findAllAdmin(@Query() query: Record<string, string | undefined>) {
    return this.registrationsService.findAllAdmin(parseWithSchema(registrationFiltersSchema, query));
  }

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    return this.registrationsService.register(user.sub, parseWithSchema(registerForEventSchema, body));
  }

  @Patch(':id/approve')
  @UseGuards(PermissionGuard)
  @RequirePermission('registrations:update')
  @AuditLog(AuditAction.Approve, 'EventRegistration')
  async approve(@Param('id') id: string, @Body() body: unknown) {
    return this.registrationsService.approve(parseWithSchema(uuidSchema, id), parseWithSchema(registrationActionSchema, body));
  }

  @Patch(':id/reject')
  @UseGuards(PermissionGuard)
  @RequirePermission('registrations:update')
  @AuditLog(AuditAction.Reject, 'EventRegistration')
  async reject(@Param('id') id: string, @Body() body: unknown) {
    return this.registrationsService.reject(parseWithSchema(uuidSchema, id), parseWithSchema(registrationActionSchema, body));
  }

  @Patch(':id/cancel')
  async cancel(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const isAdmin = user.permissions.includes('*:*') || user.permissions.includes('registrations:update');
    return this.registrationsService.cancel(parseWithSchema(uuidSchema, id), user.sub, isAdmin);
  }
}
