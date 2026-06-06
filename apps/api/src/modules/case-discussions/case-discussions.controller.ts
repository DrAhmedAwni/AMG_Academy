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
import { AuditAction, paginationQuerySchema, uuidSchema } from '@amg/shared';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { parseWithSchema } from '../../common/utils/zod.utils';
import {
  caseModerationSchema,
  createCaseCategorySchema,
  casePostFiltersSchema,
  createCaseCommentSchema,
  createCasePostSchema,
} from './dto/case-discussions.dto';
import { CaseDiscussionsService } from './case-discussions.service';

@Controller()
export class CaseDiscussionsController {
  constructor(private readonly caseDiscussionsService: CaseDiscussionsService) {}

  /* ── Public endpoints ─────────────────────────────────── */

  @Get('cases')
  @UseGuards(OptionalJwtAuthGuard)
  async findAllPublic(
    @Query() query: Record<string, string | undefined>,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.caseDiscussionsService.findAllPublic(
      parseWithSchema(casePostFiltersSchema, query),
      user?.sub,
    );
  }

  @Get('cases/:id')
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(@Param('id') id: string, @CurrentUser() user?: JwtPayload) {
    return this.caseDiscussionsService.findOne(
      parseWithSchema(uuidSchema, id),
      user?.sub,
    );
  }

  @Get('cases/:id/comments')
  async findComments(@Param('id') id: string) {
    return this.caseDiscussionsService.findComments(
      parseWithSchema(uuidSchema, id),
    );
  }

  @Get('case-categories')
  async findCategories() {
    return this.caseDiscussionsService.findCategories();
  }

  /* ── Authenticated endpoints ──────────────────────────── */

  @Post('cases')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('cases:create')
  @AuditLog(AuditAction.Create, 'CasePost')
  async create(
    @Body() body: unknown,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.caseDiscussionsService.create(
      parseWithSchema(createCasePostSchema, body),
      user.sub,
    );
  }

  @Post('case-categories')
  @UseGuards(JwtAuthGuard)
  @AuditLog(AuditAction.Create, 'CaseCategory')
  async createCategory(
    @Body() body: unknown,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.caseDiscussionsService.createCategory(
      parseWithSchema(createCaseCategorySchema, body),
      user.sub,
    );
  }

  @Post('cases/:id/upvote')
  @UseGuards(JwtAuthGuard)
  async toggleUpvote(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.caseDiscussionsService.toggleUpvote(
      parseWithSchema(uuidSchema, id),
      user.sub,
    );
  }

  @Post('cases/:id/bookmark')
  @UseGuards(JwtAuthGuard)
  async toggleBookmark(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.caseDiscussionsService.toggleBookmark(
      parseWithSchema(uuidSchema, id),
      user.sub,
    );
  }

  @Post('cases/:id/comments')
  @UseGuards(JwtAuthGuard)
  @AuditLog(AuditAction.Create, 'CaseComment')
  async addComment(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.caseDiscussionsService.addComment(
      parseWithSchema(uuidSchema, id),
      parseWithSchema(createCaseCommentSchema, body),
      user.sub,
    );
  }

  @Post('case-comments/:id/report')
  @UseGuards(JwtAuthGuard)
  @AuditLog('REPORT', 'CaseComment')
  async reportComment(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.caseDiscussionsService.reportComment(
      parseWithSchema(uuidSchema, id),
      user.sub,
    );
  }

  /* ── Admin endpoints ──────────────────────────────────── */

  @Get('cases/admin/review')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('cases:moderate')
  async findAdminQueue(@Query() query: Record<string, string | undefined>) {
    return this.caseDiscussionsService.findAdminQueue(
      parseWithSchema(casePostFiltersSchema, query),
    );
  }

  @Post('cases/admin/:id/approve')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('cases:moderate')
  @AuditLog(AuditAction.Approve, 'CasePost')
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.caseDiscussionsService.approve(
      parseWithSchema(uuidSchema, id),
      user.sub,
    );
  }

  @Post('cases/admin/:id/reject')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('cases:moderate')
  @AuditLog(AuditAction.Reject, 'CasePost')
  async reject(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.caseDiscussionsService.reject(
      parseWithSchema(uuidSchema, id),
      user.sub,
      parseWithSchema(caseModerationSchema, body),
    );
  }

  @Post('case-comments/admin/:id/hide')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('cases:moderate')
  @AuditLog('HIDE', 'CaseComment')
  async hideComment(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.caseDiscussionsService.hideComment(
      parseWithSchema(uuidSchema, id),
      user.sub,
    );
  }
}
