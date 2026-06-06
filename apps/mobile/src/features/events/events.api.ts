import {
  eventFiltersSchema,
  PaymentStatus,
  QRTicketStatus,
  registerForEventSchema,
  RegistrationStatus,
  registrationFiltersSchema,
} from '@amg/shared';
import { apiRequest } from '../../lib/api';
import type { PaginationMeta } from '../../types/api';

export interface ApiPage<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface EventCategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface MobileEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  price: number;
  currency: string;
  isFree: boolean;
  capacity: number;
  registrationDeadline: string | null;
  category: EventCategorySummary;
  thumbnailUrl: string | null;
  registrationsCount: number;
  remainingSpots: number;
  isRegistered: boolean;
  registrationStatus: RegistrationStatus | null;
  paymentStatus?: PaymentStatus | null;
  qrTicketStatus?: QRTicketStatus | null;
  paymentId: string | null;
  status: string;
  createdAt: string;
}

export interface EventFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isFree?: boolean;
  startDateFrom?: string;
  startDateTo?: string;
}

export interface RegistrationFilters {
  page?: number;
  limit?: number;
  status?: RegistrationStatus;
  eventId?: string;
}

export interface EventRegistration {
  id: string;
  event: {
    id: string;
    title: string;
    startDate: string;
    slug?: string;
  };
  status: RegistrationStatus;
  paymentStatus: PaymentStatus;
  paymentId: string | null;
  qrTicketStatus: QRTicketStatus;
  adminNotes: string | null;
  createdAt: string;
}

export type EventActionKind =
  | 'register'
  | 'continue_payment'
  | 'registered'
  | 'pending'
  | 'closed'
  | 'cancelled'
  | 'rejected';

export interface EventActionState {
  kind: EventActionKind;
  label: string;
  disabled: boolean;
  paymentId: string | null;
  helper: string;
}

export interface RegistrationRedirect {
  pathname: '/payments/[paymentId]';
  paymentId: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asNullableString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function normalizeRegistrationStatus(value: unknown): RegistrationStatus | null {
  return typeof value === 'string' ? (value as RegistrationStatus) : null;
}

function normalizePaymentStatus(value: unknown): PaymentStatus | null {
  return typeof value === 'string' ? (value as PaymentStatus) : null;
}

function normalizeQrStatus(value: unknown): QRTicketStatus | null {
  return typeof value === 'string' ? (value as QRTicketStatus) : null;
}

export function normalizeEvent(raw: MobileEvent): MobileEvent {
  return {
    ...raw,
    price: Number(raw.price),
    isFree: Boolean(raw.isFree ?? Number(raw.price) === 0),
    thumbnailUrl: raw.thumbnailUrl ?? null,
    registrationStatus: normalizeRegistrationStatus(raw.registrationStatus),
    paymentStatus: normalizePaymentStatus(raw.paymentStatus),
    qrTicketStatus: normalizeQrStatus(raw.qrTicketStatus),
    paymentId: asNullableString(raw.paymentId),
  };
}

export function normalizeRegistration(raw: EventRegistration): EventRegistration {
  return {
    ...raw,
    status: raw.status as RegistrationStatus,
    paymentStatus: raw.paymentStatus as PaymentStatus,
    paymentId: raw.paymentId ?? null,
    qrTicketStatus: raw.qrTicketStatus as QRTicketStatus,
    adminNotes: raw.adminNotes ?? null,
  };
}

export function getRegistrationPaymentRedirect(
  registration: EventRegistration,
): RegistrationRedirect | null {
  if (registration.paymentId && registration.paymentStatus === PaymentStatus.Pending) {
    return {
      pathname: '/payments/[paymentId]',
      paymentId: registration.paymentId,
    };
  }

  return null;
}

export function getEventActionState(event: MobileEvent): EventActionState {
  if (event.status === 'cancelled') {
    return {
      kind: 'cancelled',
      label: 'Event cancelled',
      disabled: true,
      paymentId: null,
      helper: 'This event is no longer accepting registrations.',
    };
  }

  if (event.registrationStatus === RegistrationStatus.Rejected) {
    return {
      kind: 'rejected',
      label: 'Registration rejected',
      disabled: true,
      paymentId: null,
      helper: 'This registration was not approved.',
    };
  }

  if (event.paymentId && event.paymentStatus === PaymentStatus.Pending) {
    return {
      kind: 'continue_payment',
      label: 'Continue payment',
      disabled: false,
      paymentId: event.paymentId,
      helper: 'Complete payment to confirm your seat.',
    };
  }

  if (event.registrationStatus === RegistrationStatus.Pending) {
    return {
      kind: 'pending',
      label: 'Pending approval',
      disabled: true,
      paymentId: null,
      helper: 'Your reservation is waiting for approval.',
    };
  }

  if (event.registrationStatus === RegistrationStatus.Approved || event.isRegistered) {
    return {
      kind: 'registered',
      label: 'Registered',
      disabled: true,
      paymentId: null,
      helper: 'Your registration is confirmed.',
    };
  }

  if (event.remainingSpots <= 0) {
    return {
      kind: 'closed',
      label: 'Fully booked',
      disabled: true,
      paymentId: null,
      helper: 'This event has reached capacity.',
    };
  }

  return {
    kind: 'register',
    label: event.isFree ? 'Register' : 'Reserve seat',
    disabled: false,
    paymentId: null,
    helper: event.isFree
      ? 'Reserve your seat for this free event.'
      : 'Reserve your seat and continue to payment.',
  };
}

export async function listEvents(filters: EventFilters = {}) {
  const query = eventFiltersSchema.parse(filters);
  const response = await apiRequest<ApiPage<MobileEvent>>('/events', {
    method: 'GET',
    query,
  });

  return {
    ...response,
    data: response.data.map(normalizeEvent),
  };
}

export async function getEvent(eventSlug: string) {
  return normalizeEvent(
    await apiRequest<MobileEvent>(`/events/${encodeURIComponent(eventSlug)}`, {
      method: 'GET',
    }),
  );
}

export async function listReservations(filters: RegistrationFilters = {}) {
  const query = registrationFiltersSchema.parse(filters);
  const response = await apiRequest<ApiPage<EventRegistration>>('/registrations', {
    method: 'GET',
    query,
  });

  return {
    ...response,
    data: response.data.map(normalizeRegistration),
  };
}

export async function registerForEvent(eventId: string) {
  const body = registerForEventSchema.parse({ eventId });
  return normalizeRegistration(
    await apiRequest<EventRegistration>('/registrations', {
      method: 'POST',
      body,
    }),
  );
}

export function hasPageData<T>(value: unknown): value is ApiPage<T> {
  return isRecord(value) && Array.isArray(value.data) && isRecord(value.meta);
}
