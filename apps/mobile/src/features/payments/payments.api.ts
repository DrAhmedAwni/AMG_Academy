import { PaymentStatus } from '@amg/shared';
import { apiRequest } from '../../lib/api';

export type PaymentAction = 'success' | 'fail' | 'cancel';
export type PaymentItemType = 'event' | 'course' | 'unknown';

export interface PaymentSummaryEntity {
  id: string;
  title: string;
}

export interface PaymentRegistrationSummary {
  id: string;
  event: PaymentSummaryEntity | null;
}

export interface PaymentEnrollmentSummary {
  id: string;
  course: PaymentSummaryEntity | null;
}

export interface MobilePayment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  providerRef: string | null;
  receiptRef: string | null;
  verifiedAt: string | null;
  createdAt: string;
  registration?: PaymentRegistrationSummary | null;
  enrollment?: PaymentEnrollmentSummary | null;
  itemType: PaymentItemType;
  itemTitle: string;
  mockMode: boolean;
}

export interface PaymentDisplayState {
  label: string;
  helper: string;
  canMockSuccess: boolean;
  canMockFail: boolean;
  canMockCancel: boolean;
  isSuccessful: boolean;
  isPending: boolean;
}

const actionEndpoint: Record<PaymentAction, string> = {
  success: 'mock-success',
  fail: 'mock-fail',
  cancel: 'mock-cancel',
};

export function getPaymentItemType(payment: Pick<MobilePayment, 'registration' | 'enrollment'>): PaymentItemType {
  if (payment.registration) {
    return 'event';
  }

  if (payment.enrollment) {
    return 'course';
  }

  return 'unknown';
}

export function getPaymentItemTitle(payment: Pick<MobilePayment, 'registration' | 'enrollment'>) {
  return (
    payment.registration?.event?.title ??
    payment.enrollment?.course?.title ??
    'AMG Academy payment'
  );
}

export function normalizePayment(raw: MobilePayment): MobilePayment {
  return {
    ...raw,
    amount: Number(raw.amount),
    status: raw.status as PaymentStatus,
    providerRef: raw.providerRef ?? null,
    receiptRef: raw.receiptRef ?? null,
    verifiedAt: raw.verifiedAt ?? null,
    itemType: getPaymentItemType(raw),
    itemTitle: getPaymentItemTitle(raw),
    mockMode: raw.provider === 'mock',
  };
}

export function isSuccessfulPaymentStatus(status: PaymentStatus) {
  return status === PaymentStatus.Successful || status === PaymentStatus.ManuallyVerified;
}

export function isTerminalPaymentStatus(status: PaymentStatus) {
  return [
    PaymentStatus.Successful,
    PaymentStatus.ManuallyVerified,
    PaymentStatus.Failed,
    PaymentStatus.RefundPending,
    PaymentStatus.Refunded,
    PaymentStatus.Cancelled,
  ].includes(status);
}

export function areMockPaymentsEnabled() {
  return process.env.EXPO_PUBLIC_ENABLE_MOCK_PAYMENTS !== 'false';
}

export function canUseMockPaymentActions(
  payment: Pick<MobilePayment, 'status'> & Partial<Pick<MobilePayment, 'mockMode'>>,
) {
  return payment.status === PaymentStatus.Pending && payment.mockMode === true && areMockPaymentsEnabled();
}

export function getPaymentDisplayState(
  payment: Pick<MobilePayment, 'status'> & Partial<Pick<MobilePayment, 'mockMode'>>,
): PaymentDisplayState {
  if (payment.status === PaymentStatus.Pending) {
    const canUseMockActions = canUseMockPaymentActions(payment);
    return {
      label: 'Payment pending',
      helper: canUseMockActions
        ? 'Choose a checkout result to continue.'
        : 'Complete this payment with the selected provider.',
      canMockSuccess: canUseMockActions,
      canMockFail: canUseMockActions,
      canMockCancel: canUseMockActions,
      isSuccessful: false,
      isPending: true,
    };
  }

  if (isSuccessfulPaymentStatus(payment.status)) {
    return {
      label: 'Payment complete',
      helper: 'Your related ticket or course access can now continue.',
      canMockSuccess: false,
      canMockFail: false,
      canMockCancel: false,
      isSuccessful: true,
      isPending: false,
    };
  }

  if (payment.status === PaymentStatus.Failed) {
    return {
      label: 'Payment failed',
      helper: 'This payment attempt was not completed.',
      canMockSuccess: false,
      canMockFail: false,
      canMockCancel: false,
      isSuccessful: false,
      isPending: false,
    };
  }

  if (payment.status === PaymentStatus.RefundPending) {
    return {
      label: 'Refund review',
      helper: 'An admin needs to approve and mark the refund as completed.',
      canMockSuccess: false,
      canMockFail: false,
      canMockCancel: false,
      isSuccessful: false,
      isPending: false,
    };
  }

  if (payment.status === PaymentStatus.Cancelled) {
    return {
      label: 'Payment cancelled',
      helper: 'This payment was cancelled.',
      canMockSuccess: false,
      canMockFail: false,
      canMockCancel: false,
      isSuccessful: false,
      isPending: false,
    };
  }

  return {
    label: 'Payment recorded',
    helper: 'This payment status has been recorded.',
    canMockSuccess: false,
    canMockFail: false,
    canMockCancel: false,
    isSuccessful: false,
    isPending: false,
  };
}

export function getPaymentActionEndpoint(action: PaymentAction) {
  return actionEndpoint[action];
}

export async function getPayment(paymentId: string) {
  return normalizePayment(
    await apiRequest<MobilePayment>(`/payments/${encodeURIComponent(paymentId)}`, {
      method: 'GET',
    }),
  );
}

export async function mockPaymentAction(paymentId: string, action: PaymentAction) {
  return normalizePayment(
    await apiRequest<MobilePayment>(
      `/payments/${encodeURIComponent(paymentId)}/${getPaymentActionEndpoint(action)}`,
      {
        method: 'POST',
      },
    ),
  );
}
