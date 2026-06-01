import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatus, QRTicketStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { ManualPaymentVerificationDto } from './dto/payments.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMine(userId: string, query: { page?: number; limit?: number; status?: string }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {
      OR: [
        { registration: { userId } },
        { enrollment: { userId } },
      ],
    };

    if (query.status) {
      where.status = this.toPrismaPaymentStatus(query.status);
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: { registration: { include: { event: true } }, enrollment: { include: { course: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments.map((p) => this.mapPayment(p)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAllAdmin(query: {
    page?: number;
    limit?: number;
    status?: string;
    provider?: string;
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {};
    if (query.status) where.status = this.toPrismaPaymentStatus(query.status);
    if (query.provider) where.provider = query.provider;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          registration: { include: { event: true, user: true } },
          enrollment: { include: { course: true, user: true } },
          verifiedBy: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments.map((p) => this.mapPayment(p, true)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(paymentId: string, userId?: string, includeUser = false) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        registration: {
          include: {
            event: { select: { id: true, title: true } },
            user: { select: { id: true, name: true } },
          },
        },
        enrollment: {
          include: {
            course: { select: { id: true, title: true } },
            user: { select: { id: true, name: true } },
          },
        },
        verifiedBy: { select: { id: true, name: true } },
      },
    });

    if (!payment) throw new NotFoundException('Payment not found');

    if (userId) {
      const ownsViaRegistration = payment.registration?.userId === userId;
      const ownsViaEnrollment = payment.enrollment?.userId === userId;
      if (!ownsViaRegistration && !ownsViaEnrollment) {
        throw new NotFoundException('Payment not found');
      }
    }

    return this.mapPayment(payment, includeUser);
  }

  async mockSuccess(paymentId: string, userId?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        registration: { include: { event: true } },
        enrollment: { include: { course: true } },
      },
    });

    if (!payment) throw new NotFoundException('Payment not found');
    this.assertPaymentOwner(payment, userId);
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not in pending status');
    }

    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.SUCCESSFUL,
        providerRef: `mock-${Date.now()}`,
        paidAt: new Date(),
      },
      include: {
        registration: { include: { event: { select: { id: true, title: true } } } },
        enrollment: { include: { course: { select: { id: true, title: true } } } },
      },
    });

    if (updated.registration) {
      const registration = await this.prisma.eventRegistration.findUnique({
        where: { id: updated.registration.id },
        include: { qrTicket: true },
      });

      if (registration && registration.status === 'APPROVED' && !registration.qrTicket) {
        const { randomBytes, createHash } = await import('crypto');
        const rawToken = randomBytes(32).toString('hex');
        const tokenHash = createHash('sha256').update(rawToken).digest('hex');

        await this.prisma.qRTicket.create({
          data: {
            registrationId: registration.id,
            userId: registration.userId,
            eventId: registration.eventId,
            tokenHash,
            status: QRTicketStatus.ACTIVE,
            issuedAt: new Date(),
          },
        });
      }
    }

    return this.mapPayment(updated);
  }

  async mockFail(paymentId: string, userId?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        registration: { select: { userId: true } },
        enrollment: { select: { userId: true } },
      },
    });

    if (!payment) throw new NotFoundException('Payment not found');
    this.assertPaymentOwner(payment, userId);
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not in pending status');
    }

    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.FAILED,
        providerRef: `mock-${Date.now()}`,
        failedAt: new Date(),
      },
      include: {
        registration: { include: { event: { select: { id: true, title: true } } } },
        enrollment: { include: { course: { select: { id: true, title: true } } } },
      },
    });

    return this.mapPayment(updated);
  }

  async mockCancel(paymentId: string, userId?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        registration: { select: { userId: true } },
        enrollment: { select: { userId: true } },
      },
    });

    if (!payment) throw new NotFoundException('Payment not found');
    this.assertPaymentOwner(payment, userId);
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not in pending status');
    }

    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.CANCELLED,
        cancelledAt: new Date(),
      },
      include: {
        registration: { include: { event: { select: { id: true, title: true } } } },
        enrollment: { include: { course: { select: { id: true, title: true } } } },
      },
    });

    return this.mapPayment(updated);
  }

  async manualVerify(paymentId: string, adminId: string, data: ManualPaymentVerificationDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { registration: true },
    });

    if (!payment) throw new NotFoundException('Payment not found');

    const prismaStatus = this.toPrismaPaymentStatus(data.status);

    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: prismaStatus,
        verifiedById: adminId,
        verifiedAt: new Date(),
        receiptRef: data.receiptRef ?? null,
      },
      include: { registration: { include: { event: true, user: true } } },
    });

    if (
      updated.registration &&
      (prismaStatus === PaymentStatus.SUCCESSFUL || prismaStatus === PaymentStatus.MANUALLY_VERIFIED)
    ) {
      const registration = await this.prisma.eventRegistration.findUnique({
        where: { id: updated.registration.id },
        include: { qrTicket: true },
      });

      if (registration && registration.status === 'APPROVED' && !registration.qrTicket) {
        const { randomBytes, createHash } = await import('crypto');
        const rawToken = randomBytes(32).toString('hex');
        const tokenHash = createHash('sha256').update(rawToken).digest('hex');

        await this.prisma.qRTicket.create({
          data: {
            registrationId: registration.id,
            userId: registration.userId,
            eventId: registration.eventId,
            tokenHash,
            status: QRTicketStatus.ACTIVE,
            issuedAt: new Date(),
          },
        });
      }
    }

    return this.mapPayment(updated, true);
  }

  async markRefunded(paymentId: string, adminId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        registration: { include: { event: { select: { id: true, title: true } }, user: true } },
        enrollment: { include: { course: { select: { id: true, title: true } }, user: true } },
      },
    });

    if (!payment) throw new NotFoundException('Payment not found');

    if (
      payment.status !== PaymentStatus.REFUND_PENDING &&
      payment.status !== PaymentStatus.SUCCESSFUL &&
      payment.status !== PaymentStatus.MANUALLY_VERIFIED
    ) {
      throw new BadRequestException('Payment is not eligible to be marked refunded');
    }

    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.REFUNDED,
        refundedAt: new Date(),
        verifiedById: adminId,
        verifiedAt: new Date(),
        adminNotes: 'Refund completed by admin.',
      },
      include: {
        registration: {
          include: {
            event: { select: { id: true, title: true } },
            user: { select: { id: true, name: true } },
          },
        },
        enrollment: {
          include: {
            course: { select: { id: true, title: true } },
            user: { select: { id: true, name: true } },
          },
        },
        verifiedBy: { select: { id: true, name: true } },
      },
    });

    return this.mapPayment(updated, true);
  }

  private toPrismaPaymentStatus(status: string): PaymentStatus {
    const map: Record<string, PaymentStatus> = {
      'not_required': PaymentStatus.NOT_REQUIRED,
      'pending': PaymentStatus.PENDING,
      'successful': PaymentStatus.SUCCESSFUL,
      'failed': PaymentStatus.FAILED,
      'refund_pending': PaymentStatus.REFUND_PENDING,
      'refunded': PaymentStatus.REFUNDED,
      'manually_verified': PaymentStatus.MANUALLY_VERIFIED,
      'cancelled': PaymentStatus.CANCELLED,
    };
    return map[status.toLowerCase()] ?? PaymentStatus.PENDING;
  }

  private assertPaymentOwner(
    payment: {
      registration?: { userId: string } | null;
      enrollment?: { userId: string } | null;
    },
    userId?: string,
  ) {
    if (!userId) {
      return;
    }

    const ownsViaRegistration = payment.registration?.userId === userId;
    const ownsViaEnrollment = payment.enrollment?.userId === userId;
    if (!ownsViaRegistration && !ownsViaEnrollment) {
      throw new NotFoundException('Payment not found');
    }
  }

  private mapPayment(
    payment: {
      id: string;
      amount: Prisma.Decimal;
      currency: string;
      status: PaymentStatus;
      provider: string;
      providerRef: string | null;
      receiptRef: string | null;
      verifiedAt: Date | null;
      createdAt: Date;
      registration?: {
        id: string;
        event?: { id: string; title: string } | null;
        user?: { id: string; name: string } | null;
      } | null;
      enrollment?: {
        id: string;
        course?: { id: string; title: string } | null;
        user?: { id: string; name: string } | null;
      } | null;
      verifiedBy?: { id: string; name: string } | null;
    },
    includeUser = false,
  ) {
    const result: Record<string, unknown> = {
      id: payment.id,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status.toLowerCase(),
      provider: payment.provider,
      providerRef: payment.providerRef,
      receiptRef: payment.receiptRef,
      verifiedAt: payment.verifiedAt?.toISOString() ?? null,
      createdAt: payment.createdAt.toISOString(),
    };

    if (payment.registration) {
      result.registration = {
        id: payment.registration.id,
        event: payment.registration.event
          ? {
              id: payment.registration.event.id,
              title: payment.registration.event.title,
            }
          : null,
      };
      if (includeUser && payment.registration.user) {
        (result.registration as Record<string, unknown>).user = {
          id: payment.registration.user.id,
          name: payment.registration.user.name,
        };
      }
    }

    if (payment.enrollment) {
      result.enrollment = {
        id: payment.enrollment.id,
        course: payment.enrollment.course
          ? {
              id: payment.enrollment.course.id,
              title: payment.enrollment.course.title,
            }
          : null,
      };
      if (includeUser && payment.enrollment.user) {
        (result.enrollment as Record<string, unknown>).user = {
          id: payment.enrollment.user.id,
          name: payment.enrollment.user.name,
        };
      }
    }

    if (includeUser && payment.verifiedBy) {
      result.verifiedBy = {
        id: payment.verifiedBy.id,
        name: payment.verifiedBy.name,
      };
    }

    return result;
  }
}
