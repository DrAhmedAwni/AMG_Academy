import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { PermissionGuard } from '../../common/guards/permission.guard';
import { parseWithSchema } from '../../common/utils/zod.utils';
import {
  createSessionSchema,
  createStudyGroupSchema,
  sendMessageSchema,
  updateStudyGroupSchema,
  uploadFileSchema,
} from './dto/study-groups.dto';
import { StudyGroupsService } from './study-groups.service';

@Controller('study-groups')
export class StudyGroupsController {
  constructor(private readonly studyGroupsService: StudyGroupsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @CurrentUser() _user: JwtPayload,
    @Query() query: Record<string, string | undefined>,
  ) {
    const pagination = parseWithSchema(paginationQuerySchema, query);
    return this.studyGroupsService.findAll({
      ...pagination,
      type: query.type,
      search: query.search,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('study-groups:create')
  @AuditLog(AuditAction.Create, 'StudyGroup')
  async create(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    return this.studyGroupsService.create(
      user.sub,
      parseWithSchema(createStudyGroupSchema, body),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.studyGroupsService.findOne(parseWithSchema(uuidSchema, id), user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @AuditLog(AuditAction.Update, 'StudyGroup')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: unknown,
  ) {
    return this.studyGroupsService.update(
      parseWithSchema(uuidSchema, id),
      user.sub,
      parseWithSchema(updateStudyGroupSchema, body),
    );
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @AuditLog(AuditAction.Create, 'StudyGroupMember')
  async join(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.studyGroupsService.join(parseWithSchema(uuidSchema, id), user.sub);
  }

  @Post(':id/members/:memberId/approve')
  @UseGuards(JwtAuthGuard)
  @AuditLog(AuditAction.Approve, 'StudyGroupMember')
  async approveMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.studyGroupsService.approveMember(
      parseWithSchema(uuidSchema, id),
      parseWithSchema(uuidSchema, memberId),
      user.sub,
    );
  }

  @Delete(':id/members/:memberId')
  @UseGuards(JwtAuthGuard)
  @AuditLog(AuditAction.Delete, 'StudyGroupMember')
  async removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.studyGroupsService.removeMember(
      parseWithSchema(uuidSchema, id),
      parseWithSchema(uuidSchema, memberId),
      user.sub,
    );
  }

  @Get(':id/messages')
  @UseGuards(JwtAuthGuard)
  async getMessages(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Query() query: Record<string, string | undefined>,
  ) {
    const pagination = parseWithSchema(paginationQuerySchema, query);
    return this.studyGroupsService.getMessages(
      parseWithSchema(uuidSchema, id),
      user.sub,
      pagination,
    );
  }

  @Post(':id/messages')
  @UseGuards(JwtAuthGuard)
  @AuditLog(AuditAction.Create, 'StudyGroupMessage')
  async sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: unknown,
  ) {
    return this.studyGroupsService.sendMessage(
      parseWithSchema(uuidSchema, id),
      user.sub,
      parseWithSchema(sendMessageSchema, body),
    );
  }

  @Get(':id/files')
  @UseGuards(JwtAuthGuard)
  async getFiles(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.studyGroupsService.getFiles(parseWithSchema(uuidSchema, id), user.sub);
  }

  @Post(':id/files')
  @UseGuards(JwtAuthGuard)
  @AuditLog(AuditAction.Create, 'StudyGroupFile')
  async uploadFile(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: unknown,
  ) {
    return this.studyGroupsService.uploadFile(
      parseWithSchema(uuidSchema, id),
      user.sub,
      parseWithSchema(uploadFileSchema, body),
    );
  }

  @Get(':id/sessions')
  @UseGuards(JwtAuthGuard)
  async getSessions(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.studyGroupsService.getSessions(parseWithSchema(uuidSchema, id), user.sub);
  }

  @Post(':id/sessions')
  @UseGuards(JwtAuthGuard)
  @AuditLog(AuditAction.Create, 'StudyGroupSession')
  async createSession(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: unknown,
  ) {
    return this.studyGroupsService.createSession(
      parseWithSchema(uuidSchema, id),
      user.sub,
      parseWithSchema(createSessionSchema, body),
    );
  }
}
