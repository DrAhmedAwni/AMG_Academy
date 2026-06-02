import {
  AttendanceStatus,
  PaymentStatus,
  qrScanSchema,
  RegistrationStatus,
  attendanceFiltersSchema,
} from '@amg/shared';
import { apiRequest } from '../../lib/api';
import type { PaginationMeta } from '../../types/api';
import type { MobileEvent } from '../events/events.api';
import { normalizeEvent } from '../events/events.api';

export type ScannerResultReason =
  | 'success'
  | 'duplicate'
  | 'wrong_event'
  | 'unpaid'
  | 'unapproved'
  | 'expired'
  | 'revoked'
  | 'cancelled_event'
  | 'not_found'
  | 'invalid';

export interface ApiPage<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ScannerEventFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ScanQrInput {
  token: string;
  eventId: string;
}

export interface BackendScannerResult {
  valid: boolean;
  reason?: string;
  attendeeName?: string;
  eventName?: string;
  registrationStatus?: RegistrationStatus | string;
  paymentStatus?: PaymentStatus | string;
  attendanceStatus?: AttendanceStatus | string;
  checkInTime?: string;
  previousCheckInTime?: string;
  scannerName?: string;
}

export interface ScannerValidationResult {
  valid: boolean;
  reason: ScannerResultReason;
  title: string;
  message: string;
  attendeeName?: string;
  eventName?: string;
  registrationStatus?: RegistrationStatus;
  paymentStatus?: PaymentStatus;
  attendanceStatus?: AttendanceStatus;
  checkInTime?: string;
  previousCheckInTime?: string;
  scannerName?: string;
}

export interface AttendanceRecord {
  id: string;
  event: {
    id: string;
    title: string;
  };
  attendee: {
    id: string;
    name: string;
  } | null;
  status: AttendanceStatus;
  scanTime: string;
  notes: string | null;
  scanner?: {
    id: string;
    name: string;
  } | null;
}

export interface RecentScanFilters {
  page?: number;
  limit?: number;
  eventId?: string;
}

const reasonMap: Record<string, ScannerResultReason> = {
  ALREADY_CHECKED_IN: 'duplicate',
  DUPLICATE: 'duplicate',
  WRONG_EVENT: 'wrong_event',
  PAYMENT_PENDING: 'unpaid',
  UNPAID: 'unpaid',
  NOT_APPROVED: 'unapproved',
  UNAPPROVED: 'unapproved',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
  EVENT_CANCELLED: 'cancelled_event',
  EVENT_ARCHIVED: 'cancelled_event',
  NOT_FOUND: 'not_found',
  INVALID: 'invalid',
};

const resultCopy: Record<ScannerResultReason, { title: string; message: string }> = {
  success: {
    title: 'Valid check-in',
    message: 'Attendance was recorded successfully.',
  },
  duplicate: {
    title: 'Already checked in',
    message: 'This ticket has already been used for this event.',
  },
  wrong_event: {
    title: 'Wrong event',
    message: 'This ticket belongs to another event.',
  },
  unpaid: {
    title: 'Payment required',
    message: 'Payment is not complete for this ticket.',
  },
  unapproved: {
    title: 'Not approved',
    message: 'The registration is not approved yet.',
  },
  expired: {
    title: 'Expired ticket',
    message: 'This ticket is expired and cannot be checked in.',
  },
  revoked: {
    title: 'Revoked ticket',
    message: 'This ticket was revoked and cannot be used.',
  },
  cancelled_event: {
    title: 'Event cancelled',
    message: 'This event is cancelled, so this QR ticket cannot be checked in.',
  },
  not_found: {
    title: 'Ticket not found',
    message: 'This QR code was not found.',
  },
  invalid: {
    title: 'Invalid QR',
    message: 'This QR code is not a valid ticket for check-in.',
  },
};

function normalizeReason(reason: string | undefined, valid: boolean): ScannerResultReason {
  if (valid) {
    return 'success';
  }

  if (!reason) {
    return 'invalid';
  }

  return reasonMap[reason.toUpperCase()] ?? 'invalid';
}

function normalizeRegistrationStatus(value: unknown): RegistrationStatus | undefined {
  return typeof value === 'string' ? (value.toLowerCase() as RegistrationStatus) : undefined;
}

function normalizePaymentStatus(value: unknown): PaymentStatus | undefined {
  return typeof value === 'string' ? (value.toLowerCase() as PaymentStatus) : undefined;
}

function normalizeAttendanceStatus(value: unknown): AttendanceStatus | undefined {
  return typeof value === 'string' ? (value.toLowerCase() as AttendanceStatus) : undefined;
}

export function normalizeScannerResult(raw: BackendScannerResult): ScannerValidationResult {
  const reason = normalizeReason(raw.reason, raw.valid);
  const copy = resultCopy[reason];

  return {
    valid: raw.valid,
    reason,
    title: copy.title,
    message: copy.message,
    attendeeName: raw.attendeeName,
    eventName: raw.eventName,
    registrationStatus: normalizeRegistrationStatus(raw.registrationStatus),
    paymentStatus: normalizePaymentStatus(raw.paymentStatus),
    attendanceStatus: normalizeAttendanceStatus(raw.attendanceStatus),
    checkInTime: raw.checkInTime,
    previousCheckInTime: raw.previousCheckInTime,
    scannerName: raw.scannerName,
  };
}

export function buildRecentScanResult(record: AttendanceRecord): ScannerValidationResult {
  return {
    valid: true,
    reason: 'success',
    title: 'Validated check-in',
    message: 'This recent scan was recorded successfully.',
    attendeeName: record.attendee?.name,
    eventName: record.event.title,
    attendanceStatus: record.status,
    checkInTime: record.scanTime,
    scannerName: record.scanner?.name,
  };
}

export function serializeScannerResult(result: ScannerValidationResult) {
  return {
    valid: String(result.valid),
    reason: result.reason,
    title: result.title,
    message: result.message,
    attendeeName: result.attendeeName ?? '',
    eventName: result.eventName ?? '',
    registrationStatus: result.registrationStatus ?? '',
    paymentStatus: result.paymentStatus ?? '',
    attendanceStatus: result.attendanceStatus ?? '',
    checkInTime: result.checkInTime ?? '',
    previousCheckInTime: result.previousCheckInTime ?? '',
    scannerName: result.scannerName ?? '',
  };
}

export function deserializeScannerResult(params: Record<string, string | string[] | undefined>) {
  const value = (key: string) => {
    const param = params[key];
    return Array.isArray(param) ? param[0] : param;
  };
  const valid = value('valid') === 'true';
  const reason = normalizeReason(value('reason'), valid);

  const result = normalizeScannerResult({
    valid,
    reason,
    attendeeName: value('attendeeName') || undefined,
    eventName: value('eventName') || undefined,
    registrationStatus: value('registrationStatus') || undefined,
    paymentStatus: value('paymentStatus') || undefined,
    attendanceStatus: value('attendanceStatus') || undefined,
    checkInTime: value('checkInTime') || undefined,
    previousCheckInTime: value('previousCheckInTime') || undefined,
    scannerName: value('scannerName') || undefined,
  });

  return {
    ...result,
    title: value('title') || result.title,
    message: value('message') || result.message,
  };
}

export async function listScannerEvents(filters: ScannerEventFilters = {}) {
  const response = await apiRequest<ApiPage<MobileEvent>>('/events', {
    method: 'GET',
    query: {
      page: filters.page ?? 1,
      limit: filters.limit ?? 50,
      search: filters.search,
    },
  });

  return {
    ...response,
    data: response.data.map(normalizeEvent),
  };
}

export async function scanQrTicket(input: ScanQrInput) {
  const body = qrScanSchema.parse(input);
  const response = await apiRequest<BackendScannerResult>('/qr/scan', {
    method: 'POST',
    body,
  });

  return normalizeScannerResult(response);
}

export async function listRecentScans(filters: RecentScanFilters = {}) {
  const query = attendanceFiltersSchema.parse(filters);
  const response = await apiRequest<ApiPage<AttendanceRecord>>('/attendance/scanner/recent', {
    method: 'GET',
    query,
  });

  return {
    ...response,
    data: response.data.map((record) => ({
      ...record,
      status: record.status as AttendanceStatus,
      notes: record.notes ?? null,
    })),
  };
}

export const scannerResultCopy = resultCopy;
