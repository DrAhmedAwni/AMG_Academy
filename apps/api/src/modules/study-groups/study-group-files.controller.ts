import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import type { JwtPayload } from '@amg/shared';
import { uuidSchema } from '@amg/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { parseWithSchema } from '../../common/utils/zod.utils';
import { StudyGroupsService } from './study-groups.service';

@Controller('study-group-files')
export class StudyGroupFilesController {
  constructor(private readonly studyGroupsService: StudyGroupsService) {}

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  async download(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Res() response: Response,
  ) {
    return this.studyGroupsService.downloadFile(parseWithSchema(uuidSchema, id), user.sub, response);
  }
}
