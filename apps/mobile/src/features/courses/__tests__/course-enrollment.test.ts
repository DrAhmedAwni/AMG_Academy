import { EnrollmentStatus, PaymentStatus } from '@amg/shared';
import { isLessonLocked, getEnrollmentPaymentRedirect } from '../courses.api';

describe('course enrollment logic', () => {
  describe('isLessonLocked', () => {
    it('returns false for free courses', () => {
      expect(
        isLessonLocked({ isFree: true, isEnrolled: false, paymentStatus: null }),
      ).toBe(false);
    });

    it('returns true for paid courses when not enrolled', () => {
      expect(
        isLessonLocked({ isFree: false, isEnrolled: false, paymentStatus: null }),
      ).toBe(true);
    });

    it('returns true for paid courses when enrolled but payment is pending', () => {
      expect(
        isLessonLocked({
          isFree: false,
          isEnrolled: true,
          paymentStatus: PaymentStatus.Pending,
        }),
      ).toBe(true);
    });

    it('returns false for paid courses when payment is successful', () => {
      expect(
        isLessonLocked({
          isFree: false,
          isEnrolled: true,
          paymentStatus: PaymentStatus.Successful,
        }),
      ).toBe(false);
    });

    it('returns false for paid courses when manually verified', () => {
      expect(
        isLessonLocked({
          isFree: false,
          isEnrolled: true,
          paymentStatus: PaymentStatus.ManuallyVerified,
        }),
      ).toBe(false);
    });
  });

  describe('getEnrollmentPaymentRedirect', () => {
    it('returns redirect when payment is pending with paymentId', () => {
      const result = getEnrollmentPaymentRedirect({
        id: 'enr-1',
        courseId: 'c-1',
        status: EnrollmentStatus.Active,
        enrolledAt: '2026-01-01T00:00:00Z',
        completedAt: null,
        progressPercent: 0,
        paymentStatus: PaymentStatus.Pending,
        paymentId: 'pay-1',
        course: {
          id: 'c-1',
          title: 'Test Course',
          slug: 'test-course',
          description: '',
          thumbnailUrl: null,
          instructor: { id: 'i-1', name: 'Instructor', avatarUrl: null },
          category: { id: 'cat-1', name: 'Category', slug: 'category' },
          totalDuration: 0,
          lessonCount: 0,
        },
      });

      expect(result).toEqual({
        pathname: '/payments/[paymentId]',
        paymentId: 'pay-1',
      });
    });

    it('returns null when payment is successful', () => {
      const result = getEnrollmentPaymentRedirect({
        id: 'enr-1',
        courseId: 'c-1',
        status: EnrollmentStatus.Active,
        enrolledAt: '2026-01-01T00:00:00Z',
        completedAt: null,
        progressPercent: 0,
        paymentStatus: PaymentStatus.Successful,
        paymentId: null,
        course: {
          id: 'c-1',
          title: 'Test Course',
          slug: 'test-course',
          description: '',
          thumbnailUrl: null,
          instructor: { id: 'i-1', name: 'Instructor', avatarUrl: null },
          category: { id: 'cat-1', name: 'Category', slug: 'category' },
          totalDuration: 0,
          lessonCount: 0,
        },
      });

      expect(result).toBeNull();
    });

    it('returns null when there is no paymentId', () => {
      const result = getEnrollmentPaymentRedirect({
        id: 'enr-1',
        courseId: 'c-1',
        status: EnrollmentStatus.Active,
        enrolledAt: '2026-01-01T00:00:00Z',
        completedAt: null,
        progressPercent: 0,
        paymentStatus: PaymentStatus.Pending,
        paymentId: null,
        course: {
          id: 'c-1',
          title: 'Test Course',
          slug: 'test-course',
          description: '',
          thumbnailUrl: null,
          instructor: { id: 'i-1', name: 'Instructor', avatarUrl: null },
          category: { id: 'cat-1', name: 'Category', slug: 'category' },
          totalDuration: 0,
          lessonCount: 0,
        },
      });

      expect(result).toBeNull();
    });
  });
});
