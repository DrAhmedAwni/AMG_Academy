import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AttendanceStatus,
  PaymentStatus,
  QRTicketStatus,
  RegistrationStatus,
} from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { QrScanDto } from './dto/qr-tickets.dto';

@Injectable()
export class QrTicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMine(userId: string, query: { page?: number; limit?: number; status?: string }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.QRTicketWhereInput = { userId };
    if (query.status) where.status = this.toPrismaQRTicketStatus(query.status);

    const [tickets, total] = await Promise.all([
      this.prisma.qRTicket.findMany({
        where,
        include: { event: true, registration: { include: { payment: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.qRTicket.count({ where }),
    ]);

    return {
      data: tickets.map((t) => this.mapTicket(t)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAllAdmin(query: { page?: number; limit?: number; status?: string; eventId?: string }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.QRTicketWhereInput = {};
    if (query.status) where.status = this.toPrismaQRTicketStatus(query.status);
    if (query.eventId) where.eventId = query.eventId;

    const [tickets, total] = await Promise.all([
      this.prisma.qRTicket.findMany({
        where,
        include: { event: true, user: true, registration: { include: { payment: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.qRTicket.count({ where }),
    ]);

    return {
      data: tickets.map((t) => this.mapTicket(t, true)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async regenerate(id: string) {
    const ticket = await this.prisma.qRTicket.findUnique({
      where: { id },
      include: { registration: true },
    });

    if (!ticket) throw new NotFoundException('QR ticket not found');

    const { randomBytes, createHash } = await import('crypto');
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const updated = await this.prisma.qRTicket.update({
      where: { id },
      data: {
        tokenHash,
        status: QRTicketStatus.ACTIVE,
      },
      include: { event: true, registration: { include: { payment: true } } },
    });

    return {
      ...this.mapTicket(updated),
      rawToken,
    };
  }

  async revoke(id: string) {
    const ticket = await this.prisma.qRTicket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('QR ticket not found');

    const updated = await this.prisma.qRTicket.update({
      where: { id },
      data: { status: QRTicketStatus.REVOKED },
      include: { event: true, registration: { include: { payment: true } } },
    });

    return this.mapTicket(updated);
  }

  async scan(userId: string, data: QrScanDto) {
    const ticket = await this.resolveTicketFromScanToken(data.token);
    const hydratedTicket = ticket
      ? await this.prisma.qRTicket.findUnique({
        where: { id: ticket.id },
        include: {
          event: true,
          registration: { include: { payment: true } },
          user: true,
          attendance: true,
        },
      })
      : null;

    if (!hydratedTicket) {
      return { valid: false, reason: 'NOT_FOUND' };
    }

    if (hydratedTicket.status === QRTicketStatus.REVOKED) {
      return { valid: false, reason: 'REVOKED' };
    }

    if (hydratedTicket.eventId !== data.eventId) {
      return { valid: false, reason: 'WRONG_EVENT' };
    }

    if (hydratedTicket.registration.status !== 'APPROVED') {
      return { valid: false, reason: 'NOT_APPROVED' };
    }

    const priceNumber = Number(hydratedTicket.event.price);
    const paymentSatisfied =
      priceNumber === 0 ||
      hydratedTicket.registration.payment?.status === PaymentStatus.SUCCESSFUL ||
      hydratedTicket.registration.payment?.status === PaymentStatus.MANUALLY_VERIFIED;
    if (!paymentSatisfied) {
      return { valid: false, reason: 'PAYMENT_PENDING' };
    }

    if (hydratedTicket.status === QRTicketStatus.USED) {
      const previousCheckIn = await this.prisma.attendanceCheckIn.findFirst({
        where: { qrTicketId: hydratedTicket.id },
        orderBy: { scanTime: 'desc' },
      });
      return {
        valid: false,
        reason: 'ALREADY_CHECKED_IN',
        previousCheckInTime: previousCheckIn?.scanTime.toISOString(),
      };
    }

    if (hydratedTicket.status === QRTicketStatus.EXPIRED) {
      return { valid: false, reason: 'EXPIRED' };
    }

    if (hydratedTicket.status !== QRTicketStatus.ACTIVE) {
      return { valid: false, reason: 'INVALID' };
    }

    // Atomic update: only mark as USED if still ACTIVE
    const updateResult = await this.prisma.qRTicket.updateMany({
      where: { id: hydratedTicket.id, status: QRTicketStatus.ACTIVE },
      data: { status: QRTicketStatus.USED },
    });

    if (updateResult.count === 0) {
      // Another scan beat us to it
      const previousCheckIn = await this.prisma.attendanceCheckIn.findFirst({
        where: { qrTicketId: hydratedTicket.id },
        orderBy: { scanTime: 'desc' },
      });
      return {
        valid: false,
        reason: 'ALREADY_CHECKED_IN',
        previousCheckInTime: previousCheckIn?.scanTime.toISOString(),
      };
    }

    const checkIn = await this.prisma.attendanceCheckIn.create({
      data: {
        qrTicketId: hydratedTicket.id,
        eventId: hydratedTicket.eventId,
        scannerId: userId,
        status: AttendanceStatus.VALIDATED,
      },
    });

    return {
      valid: true,
      attendeeName: hydratedTicket.user.name,
      eventName: hydratedTicket.event.title,
      registrationStatus: 'approved',
      paymentStatus:
        priceNumber === 0 || !hydratedTicket.registration.payment
          ? 'not_required'
          : hydratedTicket.registration.payment.status.toLowerCase(),
      checkInTime: checkIn.scanTime.toISOString(),
      scannerName: '',
    };
  }

  private async resolveTicketFromScanToken(token: string) {
    const formattedToken = token.trim();
    const fallbackMatch = /^([0-9a-f-]{36}):([A-Z0-9]{8})$/i.exec(formattedToken);

    if (fallbackMatch?.[1] && fallbackMatch[2]) {
      const ticket = await this.prisma.qRTicket.findUnique({
        where: { id: fallbackMatch[1] },
        select: {
          id: true,
          tokenHash: true,
        },
      });

      if (ticket && ticket.tokenHash.slice(0, 8).toUpperCase() === fallbackMatch[2].toUpperCase()) {
        return ticket;
      }
    }

    const { createHash } = await import('crypto');
    const tokenHash = createHash('sha256').update(formattedToken).digest('hex');
    return this.prisma.qRTicket.findUnique({
      where: { tokenHash },
      select: { id: true, tokenHash: true },
    });
  }

  private toPrismaQRTicketStatus(status: string): QRTicketStatus {
    const map: Record<string, QRTicketStatus> = {
      not_issued: QRTicketStatus.NOT_ISSUED,
      active: QRTicketStatus.ACTIVE,
      used: QRTicketStatus.USED,
      expired: QRTicketStatus.EXPIRED,
      revoked: QRTicketStatus.REVOKED,
    };
    return map[status.toLowerCase()] ?? QRTicketStatus.ACTIVE;
  }

  private mapRegistrationStatus(status: RegistrationStatus): string {
    const map: Record<RegistrationStatus, string> = {
      [RegistrationStatus.PENDING]: 'pending',
      [RegistrationStatus.APPROVED]: 'approved',
      [RegistrationStatus.REJECTED]: 'rejected',
      [RegistrationStatus.CANCELLED]: 'cancelled',
    };
    return map[status];
  }

  private mapPaymentStatus(status: PaymentStatus): string {
    const map: Record<PaymentStatus, string> = {
      [PaymentStatus.NOT_REQUIRED]: 'not_required',
      [PaymentStatus.PENDING]: 'pending',
      [PaymentStatus.SUCCESSFUL]: 'successful',
      [PaymentStatus.FAILED]: 'failed',
      [PaymentStatus.REFUNDED]: 'refunded',
      [PaymentStatus.MANUALLY_VERIFIED]: 'manually_verified',
      [PaymentStatus.CANCELLED]: 'cancelled',
    };
    return map[status];
  }

  private mapTicket(
    ticket: {
      id: string;
      tokenHash: string;
      status: QRTicketStatus;
      issuedAt: Date | null;
      createdAt: Date;
      event: { id: string; title: string; startDate: Date };
      user?: { id: string; name: string };
      registration?: {
        id: string;
        status: RegistrationStatus;
        payment?: { status: PaymentStatus } | null;
      } | null;
    },
    includeUser = false,
  ) {
    const fallbackCode = ticket.tokenHash.slice(0, 8).toUpperCase();
    const result: Record<string, unknown> = {
      id: ticket.id,
      event: {
        id: ticket.event.id,
        title: ticket.event.title,
        startDate: ticket.event.startDate.toISOString(),
      },
      status: ticket.status.toLowerCase(),
      registrationStatus: ticket.registration
        ? this.mapRegistrationStatus(ticket.registration.status)
        : null,
      paymentStatus: ticket.registration?.payment
        ? this.mapPaymentStatus(ticket.registration.payment.status)
        : 'not_required',
      qrPayload: ticket.status === QRTicketStatus.ACTIVE ? `${ticket.id}:${fallbackCode}` : null,
      fallbackCode,
      issuedAt: ticket.issuedAt?.toISOString() ?? null,
    };

    if (includeUser && ticket.user) {
      result.user = {
        id: ticket.user.id,
        name: ticket.user.name,
      };
    }

    return result;
  }
}
