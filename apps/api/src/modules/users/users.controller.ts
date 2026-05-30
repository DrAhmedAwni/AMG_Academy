import { Controller, Get, Patch, Query, Body, UseGuards, Param, Delete } from '@nestjs/common';
import { AuditAction, assignRoleSchema, uuidSchema, type JwtPayload } from '@amg/shared';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { parseWithSchema } from '../../common/utils/zod.utils';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.getProfile(user.sub);
  }

  @Patch('profile')
  async updateProfile(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    return this.usersService.updateProfile(user.sub, body);
  }

  @Get()
  @UseGuards(PermissionGuard)
  @RequirePermission('users:read')
  async listUsers(@CurrentUser() user: JwtPayload, @Query() query: Record<string, string | undefined>) {
    return this.usersService.listUsers(query, user);
  }

  @Patch(':id/admin')
  @UseGuards(PermissionGuard)
  @RequirePermission('users:update')
  @AuditLog(AuditAction.Update, 'User')
  async updateAdminUser(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.usersService.updateAdminUser(
      parseWithSchema(uuidSchema, id),
      body,
      currentUser.sub,
    );
  }

  @Patch(':id/role')
  @UseGuards(PermissionGuard)
  @RequirePermission('users:update')
  @AuditLog(AuditAction.Assign, 'User')
  async assignRole(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    const input = parseWithSchema(assignRoleSchema, {
      userId: parseWithSchema(uuidSchema, id),
      ...(typeof body === 'object' && body ? body : {}),
    });
    return this.usersService.assignRole(input.userId, input.roleId, currentUser.sub);
  }

  @Delete(':id')
  @UseGuards(PermissionGuard)
  @RequirePermission('users:delete')
  @AuditLog(AuditAction.Delete, 'User')
  async disableUser(@Param('id') id: string, @CurrentUser() currentUser: JwtPayload) {
    return this.usersService.disableUser(parseWithSchema(uuidSchema, id), currentUser.sub);
  }
}
