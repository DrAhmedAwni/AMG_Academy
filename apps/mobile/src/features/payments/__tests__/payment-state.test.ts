import { PaymentStatus } from '@amg/shared';
import { apiRequest } from '../../../lib/api';
import {
  getPaymentActionEndpoint,
  getPaymentDisplayState,
  getPaymentItemTitle,
  getPaymentItemType,
  mockPaymentAction,
  normalizePayment,
  type MobilePayment,
} from '../payments.api';

jest.mock('../../../lib/api', () => ({
  apiRequest: jest.fn(),
}));

const apiRequestMock = apiRequest as jest.MockedFunction<typeof apiRequest>;
const originalMockPaymentsFlag = process.env.EXPO_PUBLIC_ENABLE_MOCK_PAYMENTS;

function payment(overrides: Partial<MobilePayment> = {}): MobilePayment {
  return {
    id: 'payment-1',
    amount: 2500,
    currency: 'EGP',
    status: PaymentStatus.Pending,
    provider: 'mock',
    providerRef: null,
    receiptRef: null,
    verifiedAt: null,
    createdAt: '2026-05-30T10:00:00.000Z',
    registration: {
      id: 'registration-1',
      event: { id: 'event-1', title: 'AMG Implant Masterclass' },
    },
    enrollment: null,
    itemType: 'event',
    itemTitle: 'AMG Implant Masterclass',
    mockMode: true,
    ...overrides,
  };
}

describe('payment state helpers', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
    if (originalMockPaymentsFlag === undefined) {
      delete process.env.EXPO_PUBLIC_ENABLE_MOCK_PAYMENTS;
    } else {
      process.env.EXPO_PUBLIC_ENABLE_MOCK_PAYMENTS = originalMockPaymentsFlag;
    }
  });

  it('maps event and course payment titles without local access rules', () => {
    expect(getPaymentItemType(payment())).toBe('event');
    expect(getPaymentItemTitle(payment())).toBe('AMG Implant Masterclass');

    expect(
      normalizePayment(
        payment({
          registration: null,
          enrollment: {
            id: 'enrollment-1',
            course: { id: 'course-1', title: 'Advanced Dental Photography' },
          },
        }),
      ),
    ).toMatchObject({
      itemType: 'course',
      itemTitle: 'Advanced Dental Photography',
      mockMode: true,
    });
  });

  it('allows mock actions only while the backend payment is pending', () => {
    expect(getPaymentDisplayState(payment()).canMockSuccess).toBe(true);
    expect(
      getPaymentDisplayState(payment({ status: PaymentStatus.Successful })),
    ).toMatchObject({
      canMockSuccess: false,
      isSuccessful: true,
    });
    expect(
      getPaymentDisplayState(payment({ status: PaymentStatus.Cancelled })),
    ).toMatchObject({
      canMockCancel: false,
      isPending: false,
    });
  });

  it('blocks mock actions for non-mock payments and production mock-payment config', () => {
    expect(
      getPaymentDisplayState(payment({ provider: 'paymob', mockMode: false })),
    ).toMatchObject({
      canMockSuccess: false,
      canMockFail: false,
      canMockCancel: false,
      isPending: true,
    });

    process.env.EXPO_PUBLIC_ENABLE_MOCK_PAYMENTS = 'false';

    expect(
      getPaymentDisplayState(payment()),
    ).toMatchObject({
      canMockSuccess: false,
      canMockFail: false,
      canMockCancel: false,
      isPending: true,
    });
  });

  it('uses the existing backend mock endpoint names', async () => {
    apiRequestMock.mockResolvedValueOnce(payment({ status: PaymentStatus.Cancelled }));

    await mockPaymentAction('payment-1', 'cancel');

    expect(getPaymentActionEndpoint('success')).toBe('mock-success');
    expect(getPaymentActionEndpoint('fail')).toBe('mock-fail');
    expect(getPaymentActionEndpoint('cancel')).toBe('mock-cancel');
    expect(apiRequestMock).toHaveBeenCalledWith('/payments/payment-1/mock-cancel', {
      method: 'POST',
    });
  });
});
