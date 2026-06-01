import { Controller, Get, UseGuards } from '@nestjs/common';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @RequirePermission('roles:read')
  async findAll() {
    return this.permissionsService.findAll();
  }
}
