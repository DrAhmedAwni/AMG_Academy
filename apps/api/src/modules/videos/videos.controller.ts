import {
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { AuditAction, uuidSchema } from '@amg/shared';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { VideosGuard } from './videos.guard';
import { parseWithSchema } from '../../common/utils/zod.utils';
import { VideosService } from './videos.service';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get(':id/stream')
  @UseGuards(JwtAuthGuard, VideosGuard)
  async stream(
    @Param('id') id: string,
    @Headers('range') range: string | undefined,
    @Res() res: Response,
  ) {
    return this.videosService.stream(parseWithSchema(uuidSchema, id), range, res);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('courses:create')
  @AuditLog(AuditAction.Create, 'Video')
  @UseInterceptors(FileInterceptor('video', {
    limits: { fileSize: 500 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowed = ['video/mp4', 'video/webm', 'video/mov'];
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only MP4, WebM, and MOV videos are allowed'), false);
      }
    },
  }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { sub: string },
  ) {
    return this.videosService.upload(file, user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('courses:delete')
  @AuditLog(AuditAction.Delete, 'Video')
  async remove(@Param('id') id: string) {
    return this.videosService.remove(parseWithSchema(uuidSchema, id));
  }
}
