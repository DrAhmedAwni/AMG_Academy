import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { createReadStream, existsSync, mkdirSync, statSync } from 'fs';
import { join, normalize, sep } from 'path';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VideosService {
  private readonly uploadDir: string;

  constructor(private readonly prisma: PrismaService) {
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
    const resolved = normalize(join(this.uploadDir, fileName));
    if (!resolved.startsWith(normalize(this.uploadDir) + sep) && resolved !== normalize(this.uploadDir)) {
      throw new ForbiddenException('Invalid file path');
    }
    return resolved;
  }

  async upload(file: Express.Multer.File, _userId: string) {
    const safeName = this.sanitizeFileName(file.originalname);
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
      originalName: video.originalName,
      duration: video.duration,
      sizeBytes: video.sizeBytes,
      mimeType: video.mimeType,
      createdAt: video.createdAt.toISOString(),
    };
  }

  async stream(id: string, range: string | undefined, res: Response) {
    const video = await this.prisma.video.findUnique({ where: { id } });

    if (!video || !video.filePath) {
      throw new NotFoundException('Video not found');
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
      });

      const stream = createReadStream(video.filePath, { start, end });
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': video.mimeType || 'video/mp4',
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

    // Delete file from disk
    if (video.filePath && existsSync(video.filePath)) {
      const fs = await import('fs/promises');
      await fs.unlink(video.filePath).catch(() => {});
    }

    await this.prisma.video.delete({ where: { id } });
    return { id, deleted: true };
  }
}
