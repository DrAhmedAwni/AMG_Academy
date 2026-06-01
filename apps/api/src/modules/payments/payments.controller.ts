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
  manualPaymentVerificationSchema,
  paymentFiltersSchema,
  uuidSchema,
} from '@amg/shared';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { parseWithSchema } from '../../common/utils/zod.utils';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  async findMine(@CurrentUser() user: JwtPayload, @Query() query: Record<string, string | undefined>) {
    return this.paymentsService.findMine(user.sub, parseWithSchema(paymentFiltersSchema, query));
  }

  @Get('admin')
  @UseGuards(PermissionGuard)
  @RequirePermission('payments:read')
  async findAllAdmin(@Query() query: Record<string, string | undefined>) {
    return this.paymentsService.findAllAdmin(parseWithSchema(paymentFiltersSchema, query));
  }

  @Get(':id')
  async findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.paymentsService.findById(parseWithSchema(uuidSchema, id), user.sub);
  }

  @Get('admin/:id')
  @UseGuards(PermissionGuard)
  @RequirePermission('payments:read')
  async findOneAdmin(@Param('id') id: string) {
    return this.paymentsService.findById(parseWithSchema(uuidSchema, id), undefined, true);
  }

  @Post(':id/mock-success')
  async mockSuccess(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.paymentsService.mockSuccess(parseWithSchema(uuidSchema, id), user.sub);
  }

  @Post(':id/mock-fail')
  async mockFail(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.paymentsService.mockFail(parseWithSchema(uuidSchema, id), user.sub);
  }

  @Post(':id/mock-cancel')
  async mockCancel(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.paymentsService.mockCancel(parseWithSchema(uuidSchema, id), user.sub);
  }

  @Post(':id/verify-manual')
  @UseGuards(PermissionGuard)
  @RequirePermission('payments:update')
  @AuditLog(AuditAction.Verify, 'Payment')
  async manualVerify(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.paymentsService.manualVerify(
      parseWithSchema(uuidSchema, id),
      user.sub,
      parseWithSchema(manualPaymentVerificationSchema, body),
    );
  }

  @Post(':id/mark-refunded')
  @UseGuards(PermissionGuard)
  @RequirePermission('payments:update')
  @AuditLog(AuditAction.Verify, 'Payment')
  async markRefunded(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.paymentsService.markRefunded(parseWithSchema(uuidSchema, id), user.sub);
  }
}
