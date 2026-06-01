import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@amg/shared';
import { PaymentStatus, Prisma, QRTicketStatus, RegistrationStatus } from '@prisma/client';
import { CacheStoreService } from '../../common/interceptors/cache.interceptor';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notifications/notification.service';
import type { CreateEventDto, UpdateEventDto } from './dto/events.dto';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheStore: CacheStoreService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(data: CreateEventDto) {
    const { categoryId, ...rest } = data;
    const event = await this.prisma.event.create({
      data: {
        ...rest,
        price: new Prisma.Decimal(data.price),
        category: { connect: { id: categoryId } },
      },
      include: { category: true, _count: { select: { registrations: true } } },
    });
    return this.mapEvent(event);
  }

  async findAllPublic(query: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    isFree?: boolean;
    startDateFrom?: string;
    startDateTo?: string;
  }, userId?: string) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.EventWhereInput = {
      status: 'published',
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.category) {
      where.category = { slug: query.category };
    }

    if (query.isFree !== undefined) {
      where.price = query.isFree ? { equals: 0 } : { gt: 0 };
    }

    if (query.startDateFrom || query.startDateTo) {
      where.startDate = {};
      if (query.startDateFrom) where.startDate.gte = new Date(query.startDateFrom);
      if (query.startDateTo) where.startDate.lte = new Date(query.startDateTo);
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        include: { category: true, _count: { select: { registrations: true } } },
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
      }),
      this.prisma.event.count({ where }),
    ]);

    let registrationStateByEventId = new Map<
      string,
      {
        status: RegistrationStatus;
        paymentId: string | null;
        paymentStatus: PaymentStatus | null;
        qrTicketStatus: QRTicketStatus | null;
      }
    >();
    if (userId && events.length > 0) {
      const registrations = await this.prisma.eventRegistration.findMany({
        where: {
          userId,
          eventId: { in: events.map((event) => event.id) },
        },
        include: {
          payment: { select: { id: true, status: true } },
          qrTicket: { select: { status: true } },
        },
      });
      registrationStateByEventId = new Map(
        registrations.map((registration) => [
          registration.eventId,
          {
            status: registration.status,
            paymentId: registration.payment?.id ?? null,
            paymentStatus: registration.payment?.status ?? null,
            qrTicketStatus: registration.qrTicket?.status ?? null,
          },
        ]),
      );
    }

    return {
      data: events.map((event) => this.mapEvent(event, registrationStateByEventId.get(event.id))),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAllAdmin(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.EventWhereInput = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        include: { category: true, _count: { select: { registrations: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events.map((event) => this.mapEvent(event)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findBySlug(slug: string, userId?: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      include: { category: true, _count: { select: { registrations: true } } },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    let registrationState: {
      status: RegistrationStatus;
      paymentId: string | null;
      paymentStatus: PaymentStatus | null;
      qrTicketStatus: QRTicketStatus | null;
    } | undefined;
    if (userId) {
      const reg = await this.prisma.eventRegistration.findUnique({
        where: { userId_eventId: { userId, eventId: event.id } },
        include: {
          payment: { select: { id: true, status: true } },
          qrTicket: { select: { status: true } },
        },
      });
      registrationState = reg
        ? {
            status: reg.status,
            paymentId: reg.payment?.id ?? null,
            paymentStatus: reg.payment?.status ?? null,
            qrTicketStatus: reg.qrTicket?.status ?? null,
          }
        : undefined;
    }

    return this.mapEvent(event, registrationState);
  }

  async findById(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { category: true, _count: { select: { registrations: true } } },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.mapEvent(event);
  }

  async update(id: string, data: UpdateEventDto) {
    const event = await this.prisma.event.update({
      where: { id },
      data: {
        ...data,
        ...(data.price !== undefined && { price: new Prisma.Decimal(data.price) }),
      } as Prisma.EventUpdateInput,
      include: { category: true, _count: { select: { registrations: true } } },
    });
    await this.cacheStore.invalidatePrefix('events:public');
    return this.mapEvent(event);
  }

  async publish(id: string) {
    const event = await this.prisma.event.update({
      where: { id },
      data: { status: 'published' },
      include: { category: true, _count: { select: { registrations: true } } },
    });
    await this.cacheStore.invalidatePrefix('events:public');
    return this.mapEvent(event);
  }

  async cancel(id: string) {
    const existingEvent = await this.prisma.event.findUnique({
      where: { id },
      include: { category: true, _count: { select: { registrations: true } } },
    });

    if (!existingEvent) {
      throw new NotFoundException('Event not found');
    }

    const registrationsToNotify =
      existingEvent.status === 'cancelled'
        ? []
        : await this.prisma.eventRegistration.findMany({
            where: {
              eventId: id,
              status: { in: [RegistrationStatus.PENDING, RegistrationStatus.APPROVED] },
            },
            select: { userId: true },
          });

    const now = new Date();
    const event = await this.prisma.$transaction(async (tx) => {
      await tx.qRTicket.updateMany({
        where: {
          eventId: id,
          status: { in: [QRTicketStatus.NOT_ISSUED, QRTicketStatus.ACTIVE] },
        },
        data: { status: QRTicketStatus.REVOKED },
      });

      await tx.payment.updateMany({
        where: {
          registration: { is: { eventId: id } },
          status: { in: [PaymentStatus.SUCCESSFUL, PaymentStatus.MANUALLY_VERIFIED] },
        },
        data: {
          status: PaymentStatus.REFUND_PENDING,
          adminNotes: 'Event cancelled. Refund review required.',
        },
      });

      await tx.payment.updateMany({
        where: {
          registration: { is: { eventId: id } },
          status: PaymentStatus.PENDING,
        },
        data: {
          status: PaymentStatus.CANCELLED,
          cancelledAt: now,
          adminNotes: 'Event cancelled before payment completed.',
        },
      });

      await tx.eventRegistration.updateMany({
        where: {
          eventId: id,
          status: { in: [RegistrationStatus.PENDING, RegistrationStatus.APPROVED] },
        },
        data: {
          status: RegistrationStatus.CANCELLED,
          adminNotes: 'Event cancelled by AMG Academy.',
        },
      });

      return tx.event.update({
        where: { id },
        data: { status: 'cancelled' },
        include: { category: true, _count: { select: { registrations: true } } },
      });
    });

    await this.cacheStore.invalidatePrefix('events:public');

    await Promise.all(
      registrationsToNotify.map((registration) =>
        this.notificationService.send(
          {
            userId: registration.userId,
            type: NotificationType.EventCancelled,
            title: `Event cancelled: ${existingEvent.title}`,
            message:
              'This event was cancelled. If you already paid, your payment is now waiting for admin refund review.',
            entityType: 'Event',
            entityId: id,
          },
          ['in_app', 'push'],
        ),
      ),
    );

    return this.mapEvent(event);
  }

  async end(id: string) {
    const event = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.event.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException('Event not found');
      }

      await tx.qRTicket.updateMany({
        where: {
          eventId: id,
          status: { in: [QRTicketStatus.NOT_ISSUED, QRTicketStatus.ACTIVE] },
        },
        data: { status: QRTicketStatus.EXPIRED },
      });

      return tx.event.update({
        where: { id },
        data: { status: 'ended' },
        include: { category: true, _count: { select: { registrations: true } } },
      });
    });
    await this.cacheStore.invalidatePrefix('events:public');
    return this.mapEvent(event);
  }

  async archive(id: string) {
    const event = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.event.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException('Event not found');
      }

      await tx.qRTicket.updateMany({
        where: {
          eventId: id,
          status: { in: [QRTicketStatus.NOT_ISSUED, QRTicketStatus.ACTIVE] },
        },
        data: { status: QRTicketStatus.REVOKED },
      });

      return tx.event.update({
        where: { id },
        data: { status: 'archived' },
        include: { category: true, _count: { select: { registrations: true } } },
      });
    });
    await this.cacheStore.invalidatePrefix('events:public');
    return this.mapEvent(event);
  }

  async remove(id: string) {
    await this.archive(id);
    return { id, archived: true };
  }

  private mapEvent(
    event: Prisma.EventGetPayload<{
      include: { category: true; _count: { select: { registrations: true } } };
    }>,
    registrationState?: {
      status: RegistrationStatus;
      paymentId: string | null;
      paymentStatus: PaymentStatus | null;
      qrTicketStatus: QRTicketStatus | null;
    },
  ) {
    const registrationsCount = event._count.registrations;
    const priceNumber = Number(event.price);
    const registrationStatus = registrationState?.status;
    const paymentStatus = registrationState
      ? registrationState.paymentStatus
        ? this.mapPaymentStatus(registrationState.paymentStatus)
        : priceNumber > 0
          ? 'pending'
          : 'not_required'
      : null;
    const qrTicketStatus = registrationState
      ? registrationState.qrTicketStatus
        ? this.mapQRTicketStatus(registrationState.qrTicketStatus)
        : 'not_issued'
      : null;

    return {
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      location: event.location,
      price: priceNumber,
      currency: 'EGP',
      isFree: priceNumber === 0,
      capacity: event.capacity,
      registrationDeadline: event.registrationDeadline?.toISOString() ?? null,
      category: {
        id: event.category.id,
        name: event.category.name,
        slug: event.category.slug,
      },
      thumbnailUrl: event.thumbnailUrl,
      registrationsCount,
      remainingSpots: Math.max(0, event.capacity - registrationsCount),
      isRegistered: Boolean(registrationStatus),
      registrationStatus: registrationStatus ? this.mapRegistrationStatus(registrationStatus) : null,
      paymentStatus,
      paymentId: registrationState?.paymentId ?? null,
      qrTicketStatus,
      status: event.status,
      createdAt: event.createdAt.toISOString(),
    };
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
      [PaymentStatus.REFUND_PENDING]: 'refund_pending',
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
