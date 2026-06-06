import { PaymentStatus, QRTicketStatus, RegistrationStatus } from '@amg/shared';
import {
  canDeleteTicket,
  getTicketWalletState,
  isTicketDisplayable,
  normalizeTicket,
  type MobileTicket,
} from '../tickets.api';

function ticket(overrides: Partial<MobileTicket> = {}): MobileTicket {
  return {
    id: 'ticket-1',
    event: {
      id: 'event-1',
      title: 'AMG Implant Masterclass',
      startDate: '2026-06-10T10:00:00.000Z',
    },
    status: QRTicketStatus.Active,
    registrationStatus: RegistrationStatus.Approved,
    paymentStatus: PaymentStatus.Successful,
    qrPayload: 'ticket-1:ABC12345',
    fallbackCode: 'ABC12345',
    issuedAt: '2026-05-30T10:00:00.000Z',
    ...overrides,
  };
}

describe('QR ticket wallet state', () => {
  it('displays active QR only when backend registration and payment state allow it', () => {
    expect(isTicketDisplayable(ticket())).toBe(true);
    expect(getTicketWalletState(ticket())).toMatchObject({
      state: 'active',
      canDisplayQr: true,
    });
  });

  it('blocks active-looking tickets when payment is not satisfied', () => {
    expect(
      getTicketWalletState(
        ticket({
          paymentStatus: PaymentStatus.Pending,
        }),
      ),
    ).toMatchObject({
      state: 'unpaid',
      canDisplayQr: false,
    });
  });

  it('blocks QR display until registration is approved', () => {
    expect(
      getTicketWalletState(
        ticket({
          registrationStatus: RegistrationStatus.Pending,
          paymentStatus: PaymentStatus.Successful,
        }),
      ),
    ).toMatchObject({
      state: 'unapproved',
      canDisplayQr: false,
    });
  });

  it('preserves terminal backend ticket states', () => {
    expect(getTicketWalletState(ticket({ status: QRTicketStatus.Used })).state).toBe('used');
    expect(getTicketWalletState(ticket({ status: QRTicketStatus.Expired })).state).toBe('expired');
    expect(getTicketWalletState(ticket({ status: QRTicketStatus.Revoked })).state).toBe('revoked');
  });

  it('normalizes missing display payloads as not issued', () => {
    expect(
      getTicketWalletState(
        normalizeTicket({
          ...ticket(),
          qrPayload: null,
        }),
      ),
    ).toMatchObject({
      state: 'not_issued',
      canDisplayQr: false,
    });
  });

  it('only allows users to remove revoked, expired, ended, or cancelled tickets', () => {
    expect(canDeleteTicket(ticket())).toBe(false);
    expect(canDeleteTicket(ticket({ status: QRTicketStatus.Revoked }))).toBe(true);
    expect(canDeleteTicket(ticket({ status: QRTicketStatus.Expired }))).toBe(true);
    expect(canDeleteTicket(ticket({ event: { ...ticket().event, status: 'finished' } }))).toBe(true);
    expect(canDeleteTicket(ticket({ event: { ...ticket().event, status: 'cancelled' } }))).toBe(true);
  });
});
