import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findMine(userId: string, query: { page?: number; limit?: number; eventId?: string }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;
    const where: Prisma.AttendanceCheckInWhereInput = { scannerId: userId };
    if (query.eventId) {
      where.eventId = query.eventId;
    }

    const [records, total] = await Promise.all([
      this.prisma.attendanceCheckIn.findMany({
        where,
        include: { event: true, qrTicket: { include: { user: true } } },
        skip,
        take: limit,
        orderBy: { scanTime: 'desc' },
      }),
      this.prisma.attendanceCheckIn.count({ where }),
    ]);

    return {
      data: records.map((r) => this.mapRecord(r)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAllAdmin(query: {
    page?: number;
    limit?: number;
    eventId?: string;
    scannerId?: string;
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.AttendanceCheckInWhereInput = {};
    if (query.eventId) where.eventId = query.eventId;
    if (query.scannerId) where.scannerId = query.scannerId;

    const [records, total] = await Promise.all([
      this.prisma.attendanceCheckIn.findMany({
        where,
        include: { event: true, qrTicket: { include: { user: true } }, scanner: true },
        skip,
        take: limit,
        orderBy: { scanTime: 'desc' },
      }),
      this.prisma.attendanceCheckIn.count({ where }),
    ]);

    return {
      data: records.map((r) => this.mapRecord(r, true)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  private mapRecord(
    record: {
      id: string;
      status: import('@prisma/client').AttendanceStatus;
      scanTime: Date;
      notes: string | null;
      event: { id: string; title: string };
      qrTicket: { user?: { id: string; name: string } | null };
      scanner?: { id: string; name: string } | null;
    },
    includeScanner = false,
  ) {
    const result: Record<string, unknown> = {
      id: record.id,
      event: {
        id: record.event.id,
        title: record.event.title,
      },
      attendee: record.qrTicket.user
        ? {
            id: record.qrTicket.user.id,
            name: record.qrTicket.user.name,
          }
        : null,
      status: record.status.toLowerCase(),
      scanTime: record.scanTime.toISOString(),
      notes: record.notes,
    };

    if (includeScanner && record.scanner) {
      result.scanner = {
        id: record.scanner.id,
        name: record.scanner.name,
      };
    }

    return result;
  }
}
