import { PaymentStatus, QRTicketStatus, RegistrationStatus } from '@amg/shared';
import { apiRequest } from '../../../lib/api';
import {
  getEventActionState,
  getRegistrationPaymentRedirect,
  registerForEvent,
  type EventRegistration,
  type MobileEvent,
} from '../events.api';

jest.mock('../../../lib/api', () => ({
  apiRequest: jest.fn(),
}));

const apiRequestMock = apiRequest as jest.MockedFunction<typeof apiRequest>;
const eventId = '00000000-0000-4000-8000-000000000000';

function registration(overrides: Partial<EventRegistration> = {}): EventRegistration {
  return {
    id: 'registration-1',
    event: {
      id: eventId,
      title: 'AMG Implant Masterclass',
      startDate: '2026-06-10T10:00:00.000Z',
      slug: 'amg-implant-masterclass',
    },
    status: RegistrationStatus.Pending,
    paymentStatus: PaymentStatus.Pending,
    paymentId: 'payment-1',
    qrTicketStatus: QRTicketStatus.NotIssued,
    adminNotes: null,
    createdAt: '2026-05-30T10:00:00.000Z',
    ...overrides,
  };
}

function mobileEvent(overrides: Partial<MobileEvent> = {}): MobileEvent {
  return {
    id: eventId,
    title: 'AMG Implant Masterclass',
    slug: 'amg-implant-masterclass',
    description: 'A hands-on clinical academy event for implant workflows.',
    startDate: '2026-06-10T10:00:00.000Z',
    endDate: '2026-06-10T16:00:00.000Z',
    location: 'Cairo',
    price: 2500,
    currency: 'EGP',
    isFree: false,
    capacity: 40,
    registrationDeadline: null,
    category: { id: 'category-1', name: 'Implants', slug: 'implants' },
    thumbnailUrl: null,
    registrationsCount: 12,
    remainingSpots: 28,
    isRegistered: false,
    registrationStatus: null,
    paymentStatus: null,
    qrTicketStatus: null,
    paymentId: null,
    status: 'published',
    createdAt: '2026-05-30T10:00:00.000Z',
    ...overrides,
  };
}

describe('event registration flow helpers', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
  });

  it('registers for events through the backend registrations endpoint', async () => {
    apiRequestMock.mockResolvedValueOnce(registration());

    await registerForEvent(eventId);

    expect(apiRequestMock).toHaveBeenCalledWith('/registrations', {
      method: 'POST',
      body: { eventId },
    });
  });

  it('redirects paid pending registrations to the backend payment record', () => {
    expect(getRegistrationPaymentRedirect(registration())).toEqual({
      pathname: '/payments/[paymentId]',
      paymentId: 'payment-1',
    });
  });

  it('does not redirect free or already-paid registrations', () => {
    expect(
      getRegistrationPaymentRedirect(
        registration({
          paymentStatus: PaymentStatus.NotRequired,
          paymentId: null,
        }),
      ),
    ).toBeNull();

    expect(
      getRegistrationPaymentRedirect(
        registration({
          paymentStatus: PaymentStatus.Successful,
        }),
      ),
    ).toBeNull();
  });

  it('uses backend event payment and registration state for CTA labels', () => {
    expect(getEventActionState(mobileEvent()).kind).toBe('register');
    expect(
      getEventActionState(
        mobileEvent({
          isRegistered: true,
          registrationStatus: RegistrationStatus.Pending,
        }),
      ).kind,
    ).toBe('pending');
    expect(
      getEventActionState(
        mobileEvent({
          isRegistered: true,
          registrationStatus: RegistrationStatus.Pending,
          paymentStatus: PaymentStatus.Pending,
          paymentId: 'payment-1',
        }),
      ),
    ).toMatchObject({
      kind: 'continue_payment',
      paymentId: 'payment-1',
    });
  });
});
