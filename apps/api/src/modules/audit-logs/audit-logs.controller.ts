import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { parseWithSchema } from '../../common/utils/zod.utils';
import { auditLogFiltersSchema } from './dto/audit-logs.dto';
import { AuditLogsService } from './audit-logs.service';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @RequirePermission('audit_logs:read')
  async findAll(@Query() query: Record<string, string | undefined>) {
    const input = parseWithSchema(auditLogFiltersSchema, query);
    return this.auditLogsService.findAll({
      page: input.page ?? 1,
      limit: input.limit ?? 25,
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
    });
  }
}
