import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async usersReport() {
    const [total, byRole, byStatus, recent] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.groupBy({ by: ['roleId'], _count: { id: true } }),
      this.prisma.user.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
    ]);

    const roles = await this.prisma.role.findMany({
      where: { id: { in: byRole.map((r) => r.roleId) } },
      select: { id: true, name: true },
    });
    const roleMap = new Map(roles.map((r) => [r.id, r.name]));

    return {
      summary: { total, recent },
      byRole: byRole.map((r) => ({ role: roleMap.get(r.roleId) ?? r.roleId, count: r._count.id })),
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
    };
  }

  async registrationsReport(eventId?: string) {
    const where = eventId ? { eventId } : {};
    const [total, byStatus, byEvent] = await Promise.all([
      this.prisma.eventRegistration.count({ where }),
      this.prisma.eventRegistration.groupBy({ by: ['status'], where, _count: { id: true } }),
      this.prisma.eventRegistration.groupBy({ by: ['eventId'], where, _count: { id: true } }),
    ]);

    const events = await this.prisma.event.findMany({
      where: { id: { in: byEvent.map((e) => e.eventId) } },
      select: { id: true, title: true },
    });
    const eventMap = new Map(events.map((e) => [e.id, e.title]));

    return {
      summary: { total },
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
      byEvent: byEvent.map((e) => ({ eventId: e.eventId, eventTitle: eventMap.get(e.eventId) ?? e.eventId, count: e._count.id })),
    };
  }

  async attendanceReport(eventId?: string) {
    const where = eventId ? { eventId } : {};
    const [total, byStatus, byEvent] = await Promise.all([
      this.prisma.attendanceCheckIn.count({ where }),
      this.prisma.attendanceCheckIn.groupBy({ by: ['status'], where, _count: { id: true } }),
      this.prisma.attendanceCheckIn.groupBy({ by: ['eventId'], where, _count: { id: true } }),
    ]);

    const events = await this.prisma.event.findMany({
      where: { id: { in: byEvent.map((e) => e.eventId) } },
      select: { id: true, title: true },
    });
    const eventMap = new Map(events.map((e) => [e.id, e.title]));

    return {
      summary: { total },
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
      byEvent: byEvent.map((e) => ({ eventId: e.eventId, eventTitle: eventMap.get(e.eventId) ?? e.eventId, count: e._count.id })),
    };
  }

  async revenueReport() {
    const [totalRevenue, byStatus, byProvider] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { status: { in: ['SUCCESSFUL', 'MANUALLY_VERIFIED'] } },
        _sum: { amount: true },
      }),
      this.prisma.payment.groupBy({ by: ['status'], _count: { id: true }, _sum: { amount: true } }),
      this.prisma.payment.groupBy({ by: ['provider'], _count: { id: true }, _sum: { amount: true } }),
    ]);

    return {
      summary: { totalRevenue: Number(totalRevenue._sum.amount ?? 0) },
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id, amount: Number(s._sum.amount ?? 0) })),
      byProvider: byProvider.map((p) => ({ provider: p.provider, count: p._count.id, amount: Number(p._sum.amount ?? 0) })),
    };
  }

  async paymentsReport() {
    const [total, pending, successful, failed] = await Promise.all([
      this.prisma.payment.count(),
      this.prisma.payment.count({ where: { status: 'PENDING' } }),
      this.prisma.payment.count({ where: { status: { in: ['SUCCESSFUL', 'MANUALLY_VERIFIED'] } } }),
      this.prisma.payment.count({ where: { status: 'FAILED' } }),
    ]);

    return {
      summary: { total, pending, successful, failed },
    };
  }

  async coursesReport() {
    const [total, byStatus, enrollmentsTotal, topCourses] = await Promise.all([
      this.prisma.course.count(),
      this.prisma.course.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.courseEnrollment.count(),
      this.prisma.course.findMany({
        take: 5,
        orderBy: { enrollments: { _count: 'desc' } },
        include: { _count: { select: { enrollments: true } } },
      }),
    ]);

    return {
      summary: { total, enrollmentsTotal },
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
      topCourses: topCourses.map((c) => ({ id: c.id, title: c.title, enrollments: c._count.enrollments })),
    };
  }

  async qrScansReport(eventId?: string) {
    const where = eventId ? { eventId } : {};
    const [total, byStatus, byEvent] = await Promise.all([
      this.prisma.attendanceCheckIn.count({ where }),
      this.prisma.attendanceCheckIn.groupBy({ by: ['status'], where, _count: { id: true } }),
      this.prisma.attendanceCheckIn.groupBy({ by: ['eventId'], where, _count: { id: true } }),
    ]);

    const events = await this.prisma.event.findMany({
      where: { id: { in: byEvent.map((e) => e.eventId) } },
      select: { id: true, title: true },
    });
    const eventMap = new Map(events.map((e) => [e.id, e.title]));

    return {
      summary: { total },
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
      byEvent: byEvent.map((e) => ({ eventId: e.eventId, eventTitle: eventMap.get(e.eventId) ?? e.eventId, count: e._count.id })),
    };
  }
}
