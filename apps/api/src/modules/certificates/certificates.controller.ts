import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import type { JwtPayload } from '@amg/shared';
import { AuditAction, paginationQuerySchema, uuidSchema } from '@amg/shared';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { parseWithSchema } from '../../common/utils/zod.utils';
import {
  certificateAdminFiltersSchema,
  certificateGenerateSchema,
  certificateInvalidationSchema,
  certificateReviewSchema,
} from './dto/certificates.dto';
import { CertificatesService } from './certificates.service';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get('verify/:code')
  async verify(@Param('code') code: string) {
    return this.certificatesService.verify(code);
  }

  @Get('verify/:code/download')
  async downloadPublic(@Param('code') code: string, @Res() response: Response) {
    return this.certificatesService.sendDownloadByVerificationCode(code, response);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findMine(
    @CurrentUser() user: JwtPayload,
    @Query() query: Record<string, string | undefined>,
  ) {
    return this.certificatesService.findMine(
      user.sub,
      parseWithSchema(paginationQuerySchema, query),
    );
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('certificates:read')
  async findAllAdmin(@Query() query: Record<string, string | undefined>) {
    return this.certificatesService.findAllAdmin(
      parseWithSchema(certificateAdminFiltersSchema, query),
    );
  }

  @Post('admin/generate')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('certificates:update')
  @AuditLog(AuditAction.Create, 'Certificate')
  async generate(@Body() body: unknown) {
    return this.certificatesService.generateForAdmin(
      parseWithSchema(certificateGenerateSchema, body),
    );
  }

  @Post('admin/:id/release')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('certificates:approve')
  @AuditLog(AuditAction.Approve, 'Certificate')
  async release(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.certificatesService.release(
      parseWithSchema(uuidSchema, id),
      user.sub,
      parseWithSchema(certificateReviewSchema, body),
    );
  }

  @Post('admin/:id/revoke')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('certificates:approve')
  @AuditLog(AuditAction.Revoke, 'Certificate')
  async revoke(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.certificatesService.revoke(
      parseWithSchema(uuidSchema, id),
      user.sub,
      parseWithSchema(certificateInvalidationSchema, body),
    );
  }

  @Post('admin/:id/void')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('certificates:approve')
  @AuditLog(AuditAction.Update, 'Certificate')
  async void(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.certificatesService.void(
      parseWithSchema(uuidSchema, id),
      user.sub,
      parseWithSchema(certificateInvalidationSchema, body),
    );
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  async downloadMine(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    return this.certificatesService.sendDownloadById(
      parseWithSchema(uuidSchema, id),
      user,
      response,
    );
  }
}
