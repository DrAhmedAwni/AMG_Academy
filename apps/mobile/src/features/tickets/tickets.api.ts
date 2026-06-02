import { PaymentStatus, QRTicketStatus, RegistrationStatus } from '@amg/shared';
import { apiRequest } from '../../lib/api';
import type { PaginationMeta } from '../../types/api';

export interface ApiPage<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface TicketEventSummary {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  status?: string;
}

export interface MobileTicket {
  id: string;
  event: TicketEventSummary;
  status: QRTicketStatus;
  registrationStatus: RegistrationStatus | null;
  paymentStatus: PaymentStatus;
  qrPayload: string | null;
  fallbackCode: string;
  issuedAt: string | null;
}

export interface TicketFilters {
  page?: number;
  limit?: number;
  status?: QRTicketStatus;
  eventId?: string;
}

export type TicketWalletStateName =
  | 'active'
  | 'not_issued'
  | 'used'
  | 'expired'
  | 'revoked'
  | 'unpaid'
  | 'unapproved';

export interface TicketWalletState {
  state: TicketWalletStateName;
  label: string;
  message: string;
  canDisplayQr: boolean;
}

const paymentSatisfiedStatuses = [
  PaymentStatus.NotRequired,
  PaymentStatus.Successful,
  PaymentStatus.ManuallyVerified,
] as const;

export function normalizeTicket(raw: MobileTicket): MobileTicket {
  return {
    ...raw,
    status: raw.status as QRTicketStatus,
    registrationStatus: raw.registrationStatus
      ? (raw.registrationStatus as RegistrationStatus)
      : null,
    paymentStatus: raw.paymentStatus as PaymentStatus,
    qrPayload: raw.qrPayload ?? null,
    issuedAt: raw.issuedAt ?? null,
  };
}

export function isTicketPaymentSatisfied(paymentStatus: PaymentStatus) {
  return paymentSatisfiedStatuses.includes(
    paymentStatus as (typeof paymentSatisfiedStatuses)[number],
  );
}

export function getTicketWalletState(ticket: Pick<MobileTicket,
'status' | 'registrationStatus' | 'paymentStatus' | 'qrPayload'>): TicketWalletState {
  if (ticket.status === QRTicketStatus.Revoked) {
    return {
      state: 'revoked',
      label: 'Revoked',
      message: 'This QR ticket is no longer valid.',
      canDisplayQr: false,
    };
  }

  if (ticket.status === QRTicketStatus.Expired) {
    return {
      state: 'expired',
      label: 'Expired',
      message: 'This QR ticket is no longer valid.',
      canDisplayQr: false,
    };
  }

  if (ticket.status === QRTicketStatus.Used) {
    return {
      state: 'used',
      label: 'Used',
      message: 'This ticket was already checked in.',
      canDisplayQr: false,
    };
  }

  if (ticket.registrationStatus !== RegistrationStatus.Approved) {
    return {
      state: 'unapproved',
      label: 'Awaiting approval',
      message: 'Your registration must be approved before a QR can be used.',
      canDisplayQr: false,
    };
  }

  if (!isTicketPaymentSatisfied(ticket.paymentStatus)) {
    return {
      state: 'unpaid',
      label: 'Payment required',
      message: 'Payment must be successful before this QR ticket can be used.',
      canDisplayQr: false,
    };
  }

  if (ticket.status === QRTicketStatus.NotIssued || !ticket.qrPayload) {
    return {
      state: 'not_issued',
      label: 'Not issued',
      message: 'Your QR ticket is not ready yet.',
      canDisplayQr: false,
    };
  }

  return {
    state: 'active',
    label: 'Active QR',
    message: 'Show this QR at event check-in.',
    canDisplayQr: true,
  };
}

export function isTicketDisplayable(ticket: MobileTicket) {
  return getTicketWalletState(ticket).canDisplayQr;
}

export async function listTickets(filters: TicketFilters = {}) {
  const response = await apiRequest<ApiPage<MobileTicket>>('/qr-tickets', {
    method: 'GET',
    query: { ...filters },
  });

  return {
    ...response,
    data: response.data.map(normalizeTicket),
  };
}
