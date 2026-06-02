import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { createReadStream, existsSync, mkdirSync, statSync } from 'fs';
import { isAbsolute, join, normalize, sep } from 'path';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VideosService {
  private readonly uploadDir: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads', 'videos');
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private sanitizeFileName(originalName: string): string {
    return originalName
      .replace(/\\/g, '-')
      .replace(/\//g, '-')
      .replace(/\.{2,}/g, '-')
      .replace(/[^a-zA-Z0-9._-]/g, '-');
  }

  private resolveSafeFilePath(fileName: string): string {
    const resolved = normalize(isAbsolute(fileName) ? fileName : join(this.uploadDir, fileName));
    if (!resolved.startsWith(normalize(this.uploadDir) + sep) && resolved !== normalize(this.uploadDir)) {
      throw new ForbiddenException('Invalid file path');
    }
    return resolved;
  }

  async upload(file: Express.Multer.File | undefined, _userId: string) {
    if (!file) {
      throw new BadRequestException('No video file provided. Use a field named "video".');
    }
    const allowedMime = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
    const allowedExt = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
    const ext = '.' + (file.originalname.split('.').pop()?.toLowerCase() ?? '');
    if (!allowedMime.includes(file.mimetype) && !allowedExt.includes(ext)) {
      throw new BadRequestException('Only video files (MP4, WebM, MOV, AVI, MKV) are allowed');
    }
    const safeName = this.sanitizeFileName(file.originalname);

    if (this.getStorageProvider() === 'google_drive') {
      const fileId = await this.uploadToGoogleDrive(file, safeName);
      const video = await this.prisma.video.create({
        data: {
          provider: 'google_drive',
          providerVideoId: fileId,
          originalName: safeName,
          sizeBytes: file.size,
          mimeType: file.mimetype,
        },
      });

      return {
        id: video.id,
        provider: video.provider,
        originalName: video.originalName,
        duration: video.duration,
        sizeBytes: video.sizeBytes,
        mimeType: video.mimeType,
        createdAt: video.createdAt.toISOString(),
      };
    }

    const fileName = `${Date.now()}-${safeName}`;
    const filePath = this.resolveSafeFilePath(fileName);

    // Write file to disk
    const fs = await import('fs/promises');
    await fs.writeFile(filePath, file.buffer);

    const video = await this.prisma.video.create({
      data: {
        provider: 'vps',
        originalName: safeName,
        filePath: filePath,
        sizeBytes: file.size,
        mimeType: file.mimetype,
      },
    });

    return {
      id: video.id,
      provider: video.provider,
      originalName: video.originalName,
      duration: video.duration,
      sizeBytes: video.sizeBytes,
      mimeType: video.mimeType,
      createdAt: video.createdAt.toISOString(),
    };
  }

  async createFromGoogleDriveUrl(url: string) {
    const fileId = this.extractGoogleDriveFileId(url);
    if (!fileId) {
      throw new BadRequestException('Invalid Google Drive URL. Use a shared link like https://drive.google.com/file/d/FILE_ID/view');
    }

    const existing = await this.prisma.video.findFirst({
      where: { provider: 'google_drive', providerVideoId: fileId },
    });

    if (existing) {
      return {
        id: existing.id,
        provider: existing.provider,
        originalName: existing.originalName,
        duration: existing.duration,
        createdAt: existing.createdAt.toISOString(),
      };
    }

    const video = await this.prisma.video.create({
      data: {
        provider: 'google_drive',
        providerVideoId: fileId,
        originalName: `google-drive-video-${fileId}`,
        mimeType: 'video/mp4',
      },
    });

    return {
      id: video.id,
      provider: video.provider,
      originalName: video.originalName,
      duration: video.duration,
      createdAt: video.createdAt.toISOString(),
    };
  }

  private extractGoogleDriveFileId(url: string): string | null {
    const fileMatch = url.match(/\/file\/d\/([^/]+)\//);
    if (fileMatch?.[1]) return fileMatch[1];

    const idMatch = url.match(/[?&]id=([^&]+)/);
    if (idMatch?.[1]) return idMatch[1];

    return null;
  }

  async stream(id: string, range: string | undefined, res: Response) {
    const video = await this.prisma.video.findUnique({ where: { id } });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    if (video.provider === 'google_drive') {
      await this.streamGoogleDrive(video, range, res);
      return;
    }

    if (!video.filePath) {
      throw new NotFoundException('Video file not found');
    }

    // Validate file path is within upload directory
    this.resolveSafeFilePath(video.filePath);

    if (!existsSync(video.filePath)) {
      throw new NotFoundException('Video file not found');
    }

    const stat = statSync(video.filePath);
    const fileSize = stat.size;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0] ?? '0', 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': video.mimeType || 'video/mp4',
        'Cache-Control': 'private, no-store',
      });

      const stream = createReadStream(video.filePath, { start, end });
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': video.mimeType || 'video/mp4',
        'Cache-Control': 'private, no-store',
      });

      const stream = createReadStream(video.filePath);
      stream.pipe(res);
    }
  }

  async remove(id: string) {
    const video = await this.prisma.video.findUnique({ where: { id } });
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    if (video.provider === 'google_drive' && video.providerVideoId) {
      await this.deleteFromGoogleDrive(video.providerVideoId).catch(() => {});
    }

    if (video.filePath && existsSync(video.filePath)) {
      const fs = await import('fs/promises');
      await fs.unlink(video.filePath).catch(() => {});
    }

    await this.prisma.video.delete({ where: { id } });
    return { id, deleted: true };
  }

  private getStorageProvider() {
    return this.configService.get<string>('VIDEO_STORAGE_PROVIDER', 'vps').toLowerCase();
  }

  private async getGoogleDriveClient() {
    const { google } = await import('googleapis');
    const scopes = ['https://www.googleapis.com/auth/drive.file'];
    const serviceAccountJson = this.configService.get<string>('GOOGLE_SERVICE_ACCOUNT_JSON');
    const keyFile = this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS');

    if (!serviceAccountJson && !keyFile) {
      throw new ForbiddenException('Google Drive storage is not configured');
    }

    const auth = serviceAccountJson
      ? new google.auth.GoogleAuth({
          credentials: JSON.parse(serviceAccountJson) as Record<string, unknown>,
          scopes,
        })
      : new google.auth.GoogleAuth({
          keyFile,
          scopes,
        });

    return google.drive({ version: 'v3', auth });
  }

  private async uploadToGoogleDrive(file: Express.Multer.File, safeName: string) {
    const drive = await this.getGoogleDriveClient();
    const folderId = this.configService.get<string>('GOOGLE_DRIVE_COURSE_VIDEOS_FOLDER_ID');
    const response = await drive.files.create({
      requestBody: {
        name: `${Date.now()}-${safeName}`,
        mimeType: file.mimetype,
        ...(folderId ? { parents: [folderId] } : {}),
      },
      media: {
        mimeType: file.mimetype,
        body: Readable.from(file.buffer),
      },
      fields: 'id',
    });

    if (!response.data.id) {
      throw new ForbiddenException('Google Drive did not return a file id');
    }

    return response.data.id;
  }

  private async streamGoogleDrive(
    video: { providerVideoId: string | null; mimeType: string | null },
    range: string | undefined,
    res: Response,
  ) {
    if (!video.providerVideoId) {
      throw new NotFoundException('Video file not found');
    }

    const drive = await this.getGoogleDriveClient();
    const response = await drive.files.get(
      { fileId: video.providerVideoId, alt: 'media' },
      {
        responseType: 'stream',
        headers: range ? { Range: range } : undefined,
      },
    );

    const headers = response.headers as Record<string, string | undefined>;
    const responseHeaders: Record<string, string> = {
      'Accept-Ranges': headers['accept-ranges'] ?? 'bytes',
      'Content-Type': video.mimeType ?? headers['content-type'] ?? 'video/mp4',
      'Cache-Control': 'private, no-store',
    };

    if (headers['content-length']) responseHeaders['Content-Length'] = headers['content-length'];
    if (headers['content-range']) responseHeaders['Content-Range'] = headers['content-range'];

    res.writeHead(response.status ?? (range ? 206 : 200), responseHeaders);
    response.data.pipe(res);
  }

  private async deleteFromGoogleDrive(fileId: string) {
    const drive = await this.getGoogleDriveClient();
    await drive.files.delete({ fileId });
  }
}
