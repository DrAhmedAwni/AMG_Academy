import type { AuthUser } from '@amg/shared';
import { AttendanceStatus, PaymentStatus, RegistrationStatus } from '@amg/shared';
import { canAccessScanner } from '../../auth/auth.types';
import { apiRequest } from '../../../lib/api';
import {
  deserializeScannerResult,
  listRecentScans,
  normalizeScannerResult,
  scanQrTicket,
  serializeScannerResult,
} from '../scanner.api';

jest.mock('../../../lib/api', () => ({
  apiRequest: jest.fn(),
}));

const apiRequestMock = apiRequest as jest.MockedFunction<typeof apiRequest>;
const eventId = '00000000-0000-4000-8000-000000000000';

function user(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 'user-1',
    email: 'scanner@example.com',
    name: 'Scanner Staff',
    role: 'user',
    avatarUrl: null,
    emailVerified: true,
    permissions: [],
    ...overrides,
  };
}

describe('scanner state and permission helpers', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
  });

  it('keeps scanner mode hidden from normal users and available to staff permissions', () => {
    expect(canAccessScanner(user())).toBe(false);
    expect(canAccessScanner(user({ permissions: ['scanner:use'] }))).toBe(true);
    expect(canAccessScanner(user({ role: 'admin', permissions: [] }))).toBe(true);
  });

  it.each([
    ['ALREADY_CHECKED_IN', 'duplicate'],
    ['WRONG_EVENT', 'wrong_event'],
    ['PAYMENT_PENDING', 'unpaid'],
    ['NOT_APPROVED', 'unapproved'],
    ['EXPIRED', 'expired'],
    ['REVOKED', 'revoked'],
    ['NOT_FOUND', 'not_found'],
    ['INVALID', 'invalid'],
  ] as const)('maps backend reason %s to mobile scanner state %s', (backendReason, mobileReason) => {
    expect(
      normalizeScannerResult({
        valid: false,
        reason: backendReason,
      }),
    ).toMatchObject({
      reason: mobileReason,
      valid: false,
    });
  });

  it('normalizes successful backend scan context', () => {
    expect(
      normalizeScannerResult({
        valid: true,
        attendeeName: 'Dr. Ahmed',
        eventName: 'AMG Congress',
        registrationStatus: 'approved',
        paymentStatus: 'successful',
        attendanceStatus: 'validated',
        checkInTime: '2026-06-10T10:00:00.000Z',
      }),
    ).toMatchObject({
      reason: 'success',
      attendeeName: 'Dr. Ahmed',
      registrationStatus: RegistrationStatus.Approved,
      paymentStatus: PaymentStatus.Successful,
      attendanceStatus: AttendanceStatus.Validated,
    });
  });

  it('round-trips scanner results through route params without losing custom copy', () => {
    const params = serializeScannerResult({
      valid: false,
      reason: 'invalid',
      title: 'Camera failed',
      message: 'Please retry.',
    });

    expect(deserializeScannerResult(params)).toMatchObject({
      valid: false,
      reason: 'invalid',
      title: 'Camera failed',
      message: 'Please retry.',
    });
  });

  it('validates QR payloads through the backend scanner endpoint', async () => {
    apiRequestMock.mockResolvedValueOnce({
      valid: false,
      reason: 'PAYMENT_PENDING',
    });

    await scanQrTicket({ eventId, token: 'ticket-token' });

    expect(apiRequestMock).toHaveBeenCalledWith('/qr/scan', {
      method: 'POST',
      body: { eventId, token: 'ticket-token' },
    });
  });

  it('loads recent scans from the scanner-specific attendance endpoint', async () => {
    apiRequestMock.mockResolvedValueOnce({
      data: [],
      meta: { page: 1, limit: 25, total: 0, totalPages: 0 },
    });

    await listRecentScans({ eventId, page: 1, limit: 25 });

    expect(apiRequestMock).toHaveBeenCalledWith('/attendance/scanner/recent', {
      method: 'GET',
      query: { eventId, page: 1, limit: 25 },
    });
  });
});
