import { PaymentStatus } from '@amg/shared';
import { isLessonLocked } from '../courses.api';

describe('lesson access state', () => {
  it('allows free courses regardless of enrollment', () => {
    expect(isLessonLocked({ isFree: true, isEnrolled: false, paymentStatus: null })).toBe(false);
    expect(isLessonLocked({ isFree: true, isEnrolled: true, paymentStatus: null })).toBe(false);
  });

  it('blocks paid courses when not enrolled', () => {
    expect(isLessonLocked({ isFree: false, isEnrolled: false, paymentStatus: null })).toBe(true);
  });

  it('blocks paid courses when payment is pending', () => {
    expect(
      isLessonLocked({ isFree: false, isEnrolled: true, paymentStatus: PaymentStatus.Pending }),
    ).toBe(true);
  });

  it('blocks paid courses when payment failed', () => {
    expect(
      isLessonLocked({ isFree: false, isEnrolled: true, paymentStatus: PaymentStatus.Failed }),
    ).toBe(true);
  });

  it('blocks paid courses when payment cancelled', () => {
    expect(
      isLessonLocked({ isFree: false, isEnrolled: true, paymentStatus: PaymentStatus.Cancelled }),
    ).toBe(true);
  });

  it('unlocks paid courses when payment is successful', () => {
    expect(
      isLessonLocked({ isFree: false, isEnrolled: true, paymentStatus: PaymentStatus.Successful }),
    ).toBe(false);
  });

  it('unlocks paid courses when payment is manually verified', () => {
    expect(
      isLessonLocked({
        isFree: false,
        isEnrolled: true,
        paymentStatus: PaymentStatus.ManuallyVerified,
      }),
    ).toBe(false);
  });

  it('unlocks paid courses when payment is not required', () => {
    expect(
      isLessonLocked({
        isFree: false,
        isEnrolled: true,
        paymentStatus: PaymentStatus.NotRequired,
      }),
    ).toBe(false);
  });
});
