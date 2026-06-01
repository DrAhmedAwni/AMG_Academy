import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuditAction, uuidSchema } from '@amg/shared';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { parseWithSchema } from '../../common/utils/zod.utils';
import {
  assignPermissionsSchema,
  roleFiltersSchema,
  roleSchema,
  updateRoleSchema,
} from './dto/roles.dto';
import { RolesService } from './roles.service';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermission('roles:read')
  async findAll(@Query() query: Record<string, string | undefined>) {
    const input = parseWithSchema(roleFiltersSchema, query);
    return this.rolesService.findAll({
      page: input.page ?? 1,
      limit: input.limit ?? 25,
      search: input.search,
    });
  }

  @Get(':id')
  @RequirePermission('roles:read')
  async findOne(@Param('id') id: string) {
    return this.rolesService.findOne(parseWithSchema(uuidSchema, id));
  }

  @Post()
  @RequirePermission('roles:create')
  @AuditLog(AuditAction.Create, 'Role')
  async create(@Body() body: unknown) {
    return this.rolesService.create(parseWithSchema(roleSchema, body));
  }

  @Patch(':id')
  @RequirePermission('roles:update')
  @AuditLog(AuditAction.Update, 'Role')
  async update(@Param('id') id: string, @Body() body: unknown) {
    return this.rolesService.update(
      parseWithSchema(uuidSchema, id),
      parseWithSchema(updateRoleSchema, body),
    );
  }

  @Put(':id/permissions')
  @RequirePermission('roles:update')
  @AuditLog(AuditAction.Assign, 'RolePermission')
  async assignPermissions(@Param('id') id: string, @Body() body: unknown) {
    const input = parseWithSchema(assignPermissionsSchema, body);
    return this.rolesService.assignPermissions(
      parseWithSchema(uuidSchema, id),
      { permissionIds: input.permissionIds ?? [] },
    );
  }

  @Delete(':id')
  @RequirePermission('roles:delete')
  @AuditLog(AuditAction.Delete, 'Role')
  async remove(@Param('id') id: string) {
    return this.rolesService.remove(parseWithSchema(uuidSchema, id));
  }
}
