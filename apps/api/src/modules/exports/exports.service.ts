import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Response } from 'express';

@Injectable()
export class ExportsService {
  constructor(private readonly prisma: PrismaService) {}

  private toCsv(rows: Record<string, unknown>[]): string {
    if (rows.length === 0) return '';
    const firstRow = rows[0];
    if (!firstRow) {
      return '';
    }
    const headers = Object.keys(firstRow);
    const lines = [
      headers.join(','),
      ...rows.map((row) =>
        headers
          .map((h) => {
            const val = String(row[h] ?? '');
            if (val.includes(',') || val.includes('"') || val.includes('\n')) {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
          })
          .join(','),
      ),
    ];
    return lines.join('\n');
  }

  private sendCsv(res: Response, filename: string, data: Record<string, unknown>[]) {
    const csv = this.toCsv(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  async exportUsers(_filters: Record<string, string>, res: Response) {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        specialty: true,
        clinic: true,
        city: true,
        status: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return this.sendCsv(res, 'users.csv', users.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    })));
  }

  async exportRegistrations(filters: Record<string, string>, res: Response) {
    const where = filters.eventId ? { eventId: filters.eventId } : {};
    const registrations = await this.prisma.eventRegistration.findMany({
      where,
      include: { event: true, user: true, payment: true },
      orderBy: { createdAt: 'desc' },
    });
    return this.sendCsv(res, 'registrations.csv', registrations.map((r) => ({
      id: r.id,
      userName: r.user.name,
      userEmail: r.user.email,
      eventTitle: r.event.title,
      status: r.status,
      paymentStatus: r.payment?.status ?? 'not_required',
      createdAt: r.createdAt.toISOString(),
    })));
  }

  async exportAttendance(filters: Record<string, string>, res: Response) {
    const where = filters.eventId ? { eventId: filters.eventId } : {};
    const records = await this.prisma.attendanceCheckIn.findMany({
      where,
      include: { event: true, scanner: true, qrTicket: { include: { user: true } } },
      orderBy: { scanTime: 'desc' },
    });
    return this.sendCsv(res, 'attendance.csv', records.map((r) => ({
      id: r.id,
      eventTitle: r.event.title,
      attendeeName: r.qrTicket.user.name,
      scannerName: r.scanner.name,
      status: r.status,
      scanTime: r.scanTime.toISOString(),
    })));
  }

  async exportPayments(_filters: Record<string, string>, res: Response) {
    const payments = await this.prisma.payment.findMany({
      include: { registration: { include: { event: true, user: true } }, enrollment: { include: { course: true, user: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return this.sendCsv(res, 'payments.csv', payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      currency: p.currency,
      status: p.status,
      provider: p.provider,
      userName: p.registration?.user?.name ?? p.enrollment?.user?.name ?? '',
      eventOrCourse: p.registration?.event?.title ?? p.enrollment?.course?.title ?? '',
      createdAt: p.createdAt.toISOString(),
    })));
  }

  async exportEnrollments(filters: Record<string, string>, res: Response) {
    const where = filters.courseId ? { courseId: filters.courseId } : {};
    const enrollments = await this.prisma.courseEnrollment.findMany({
      where,
      include: { course: true, user: true, payment: true },
      orderBy: { enrolledAt: 'desc' },
    });
    return this.sendCsv(res, 'enrollments.csv', enrollments.map((e) => ({
      id: e.id,
      userName: e.user.name,
      userEmail: e.user.email,
      courseTitle: e.course.title,
      status: e.status,
      paymentStatus: e.payment?.status ?? 'not_required',
      enrolledAt: e.enrolledAt.toISOString(),
    })));
  }
}
