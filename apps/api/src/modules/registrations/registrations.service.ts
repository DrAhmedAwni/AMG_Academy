import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RegistrationStatus, PaymentStatus, QRTicketStatus } from '@prisma/client';
import { CacheStoreService } from '../../common/interceptors/cache.interceptor';
import { PrismaService } from '../prisma/prisma.service';
import type { RegisterForEventDto, RegistrationActionDto } from './dto/registrations.dto';

@Injectable()
export class RegistrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheStore: CacheStoreService,
  ) {}

  async register(userId: string, data: RegisterForEventDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: data.eventId },
      });

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      if (event.status !== 'published') {
        throw new BadRequestException('Event is not open for registration');
      }

      if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
        throw new BadRequestException('Registration deadline has passed');
      }

      const activeRegistrationsCount = await tx.eventRegistration.count({
        where: { eventId: data.eventId, status: { not: RegistrationStatus.CANCELLED } },
      });

      if (activeRegistrationsCount >= event.capacity) {
        throw new BadRequestException('Event is at full capacity');
      }

      const existing = await tx.eventRegistration.findUnique({
        where: { userId_eventId: { userId, eventId: data.eventId } },
      });

      if (existing) {
        throw new ConflictException('You are already registered for this event');
      }

      const registration = await tx.eventRegistration.create({
        data: {
          userId,
          eventId: data.eventId,
          status: RegistrationStatus.PENDING,
        },
        include: { event: true },
      });

      // Atomic post-check: if another transaction slipped in, rollback
      const finalCount = await tx.eventRegistration.count({
        where: { eventId: data.eventId, status: { not: RegistrationStatus.CANCELLED } },
      });

      if (finalCount > event.capacity) {
        throw new BadRequestException('Event is at full capacity');
      }

      const priceNumber = Number(event.price);
      if (priceNumber > 0) {
        await tx.payment.create({
          data: {
            registrationId: registration.id,
            amount: event.price,
            currency: 'EGP',
            status: PaymentStatus.PENDING,
            provider: 'mock',
          },
        });
      }

      const fullRegistration = await tx.eventRegistration.findUnique({
        where: { id: registration.id },
        include: { event: true, payment: true },
      });

      return this.mapRegistration(fullRegistration!);
    });
    await this.invalidatePublicEventCache();
    return result;
  }

  async findMine(userId: string, query: { page?: number; limit?: number; status?: string }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.EventRegistrationWhereInput = { userId };
    if (query.status) {
      where.status = this.toPrismaRegistrationStatus(query.status);
    }

    const [registrations, total] = await Promise.all([
      this.prisma.eventRegistration.findMany({
        where,
        include: { event: true, payment: true, qrTicket: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.eventRegistration.count({ where }),
    ]);

    return {
      data: registrations.map((r) => this.mapRegistration(r)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAllAdmin(query: {
    page?: number;
    limit?: number;
    status?: string;
    eventId?: string;
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.EventRegistrationWhereInput = {};
    if (query.status) where.status = this.toPrismaRegistrationStatus(query.status);
    if (query.eventId) where.eventId = query.eventId;

    const [registrations, total] = await Promise.all([
      this.prisma.eventRegistration.findMany({
        where,
        include: { event: true, user: true, payment: true, qrTicket: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.eventRegistration.count({ where }),
    ]);

    return {
      data: registrations.map((r) => this.mapRegistration(r, true)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async approve(id: string, data: RegistrationActionDto) {
    const registration = await this.prisma.eventRegistration.findUnique({
      where: { id },
      include: { event: true, payment: true },
    });

    if (!registration) throw new NotFoundException('Registration not found');
    if (registration.status !== RegistrationStatus.PENDING) {
      throw new BadRequestException('Registration is not pending');
    }

    const updated = await this.prisma.eventRegistration.update({
      where: { id },
      data: {
        status: RegistrationStatus.APPROVED,
        adminNotes: data.adminNotes ?? null,
      },
      include: { event: true, payment: true, qrTicket: true },
    });

    const priceNumber = Number(updated.event.price);
    const paymentSatisfied =
      priceNumber === 0 ||
      updated.payment?.status === PaymentStatus.SUCCESSFUL ||
      updated.payment?.status === PaymentStatus.MANUALLY_VERIFIED;

    if (paymentSatisfied && !updated.qrTicket) {
      await this.issueQRTicket(updated.id, updated.userId, updated.eventId);
    }

    await this.invalidatePublicEventCache();
    return this.mapRegistration(updated, true);
  }

  async reject(id: string, data: RegistrationActionDto) {
    const registration = await this.prisma.eventRegistration.findUnique({
      where: { id },
    });

    if (!registration) throw new NotFoundException('Registration not found');
    if (registration.status !== RegistrationStatus.PENDING) {
      throw new BadRequestException('Registration is not pending');
    }

    const updated = await this.prisma.eventRegistration.update({
      where: { id },
      data: {
        status: RegistrationStatus.REJECTED,
        adminNotes: data.adminNotes ?? null,
      },
      include: { event: true, payment: true, qrTicket: true },
    });

    await this.invalidatePublicEventCache();
    return this.mapRegistration(updated, true);
  }

  async cancel(id: string, userId: string, isAdmin: boolean) {
    const registration = await this.prisma.eventRegistration.findUnique({
      where: { id },
    });

    if (!registration) throw new NotFoundException('Registration not found');
    if (!isAdmin && registration.userId !== userId) {
      throw new BadRequestException('You can only cancel your own registration');
    }

    if (registration.status === RegistrationStatus.CANCELLED) {
      throw new BadRequestException('Registration is already cancelled');
    }

    const updated = await this.prisma.eventRegistration.update({
      where: { id },
      data: { status: RegistrationStatus.CANCELLED },
      include: { event: true, payment: true, qrTicket: true },
    });

    if (updated.qrTicket) {
      await this.prisma.qRTicket.update({
        where: { id: updated.qrTicket.id },
        data: { status: QRTicketStatus.REVOKED },
      });
    }

    await this.invalidatePublicEventCache();
    return this.mapRegistration(updated, true);
  }

  private async invalidatePublicEventCache() {
    await this.cacheStore.invalidatePrefix('events:public');
  }

  private async issueQRTicket(registrationId: string, userId: string, eventId: string) {
    const { randomBytes, createHash } = await import('crypto');
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const fallbackCode = rawToken.slice(0, 8).toUpperCase();

    await this.prisma.qRTicket.create({
      data: {
        registrationId,
        userId,
        eventId,
        tokenHash,
        status: QRTicketStatus.ACTIVE,
        issuedAt: new Date(),
      },
    });

    return rawToken;
  }

  private mapRegistration(
    registration: {
      id: string;
      status: RegistrationStatus;
      adminNotes: string | null;
      createdAt: Date;
      updatedAt: Date;
      event: { id: string; title: string; startDate: Date; slug: string; price: Prisma.Decimal };
      user?: { id: string; name: string; email: string };
      payment?: { id: string; status: PaymentStatus } | null;
      qrTicket?: { id: string; status: QRTicketStatus } | null;
    },
    includeUser = false,
  ) {
    const paymentStatus = registration.payment
      ? this.mapPaymentStatus(registration.payment.status)
      : registration.event.price && Number(registration.event.price) > 0
        ? 'pending'
        : 'not_required';

    const qrTicketStatus = registration.qrTicket
      ? this.mapQRTicketStatus(registration.qrTicket.status)
      : 'not_issued';

    const result: Record<string, unknown> = {
      id: registration.id,
      event: {
        id: registration.event.id,
        title: registration.event.title,
        startDate: registration.event.startDate.toISOString(),
        slug: registration.event.slug,
      },
      status: this.mapRegistrationStatus(registration.status),
      paymentStatus,
      paymentId: registration.payment?.id ?? null,
      qrTicketStatus,
      adminNotes: registration.adminNotes,
      createdAt: registration.createdAt.toISOString(),
    };

    if (includeUser && registration.user) {
      result.user = {
        id: registration.user.id,
        name: registration.user.name,
        email: registration.user.email,
      };
    }

    return result;
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

  private toPrismaRegistrationStatus(status: string): RegistrationStatus {
    const map: Record<string, RegistrationStatus> = {
      pending: RegistrationStatus.PENDING,
      approved: RegistrationStatus.APPROVED,
      rejected: RegistrationStatus.REJECTED,
      cancelled: RegistrationStatus.CANCELLED,
    };

    return map[status.toLowerCase()] ?? RegistrationStatus.PENDING;
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

  private mapQRTicketStatus(status: QRTicketStatus): string {
    const map: Record<QRTicketStatus, string> = {
      [QRTicketStatus.NOT_ISSUED]: 'not_issued',
      [QRTicketStatus.ACTIVE]: 'active',
      [QRTicketStatus.USED]: 'used',
      [QRTicketStatus.EXPIRED]: 'expired',
      [QRTicketStatus.REVOKED]: 'revoked',
    };
    return map[status];
  }
}
