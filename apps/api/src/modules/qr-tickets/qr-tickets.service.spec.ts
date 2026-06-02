import { BadRequestException } from '@nestjs/common';
import { PaymentStatus, QRTicketStatus, RegistrationStatus } from '@prisma/client';
import { QrTicketsService } from './qr-tickets.service';

jest.mock('@amg/shared', () => ({
  NotificationType: {
    QrIssued: 'QR_ISSUED',
  },
}), { virtual: true });

function createService() {
  const prisma = {
    qRTicket: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const service = new QrTicketsService(
    prisma as never,
    { ensureForEventAttendance: jest.fn() } as never,
    { send: jest.fn() } as never,
  );

  return { prisma, service };
}

function ticket(overrides: Record<string, unknown> = {}) {
  return {
    id: 'ticket-1',
    userId: 'user-1',
    registrationId: 'registration-1',
    eventId: 'event-1',
    tokenHash: 'abcdef1234567890',
    status: QRTicketStatus.ACTIVE,
    issuedAt: new Date(),
    deletedByUserAt: null,
    event: {
      id: 'event-1',
      title: 'AMG Event',
      status: 'published',
      startDate: new Date('2026-06-10T10:00:00.000Z'),
      endDate: new Date('2026-06-10T12:00:00.000Z'),
    },
    registration: {
      id: 'registration-1',
      status: RegistrationStatus.APPROVED,
      payment: { status: PaymentStatus.NOT_REQUIRED },
    },
    ...overrides,
  };
}

describe('QrTicketsService user wallet deletion', () => {
  it('hides user-deleted tickets from the wallet list', async () => {
    const { prisma, service } = createService();
    prisma.qRTicket.findMany.mockResolvedValue([]);
    prisma.qRTicket.count.mockResolvedValue(0);

    await service.findMine('user-1', {});

    expect(prisma.qRTicket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1', deletedByUserAt: null },
      }),
    );
    expect(prisma.qRTicket.count).toHaveBeenCalledWith({
      where: { userId: 'user-1', deletedByUserAt: null },
    });
  });

  it('blocks users from removing active tickets for active events', async () => {
    const { prisma, service } = createService();
    prisma.qRTicket.findUnique.mockResolvedValue(
      ticket({
        event: {
          ...ticket().event,
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      }),
    );

    await expect(service.deleteMine('user-1', 'ticket-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.qRTicket.update).not.toHaveBeenCalled();
  });

  it('lets users remove their own cancelled event tickets from the wallet', async () => {
    const { prisma, service } = createService();
    prisma.qRTicket.findUnique.mockResolvedValue(
      ticket({
        event: {
          ...ticket().event,
          status: 'cancelled',
        },
      }),
    );
    prisma.qRTicket.update.mockResolvedValue({ id: 'ticket-1' });

    await expect(service.deleteMine('user-1', 'ticket-1')).resolves.toEqual({
      id: 'ticket-1',
      deleted: true,
    });
    expect(prisma.qRTicket.update).toHaveBeenCalledWith({
      where: { id: 'ticket-1' },
      data: { deletedByUserAt: expect.any(Date) },
      select: { id: true },
    });
  });
});
