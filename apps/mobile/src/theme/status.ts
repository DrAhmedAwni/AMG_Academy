import {
  AttendanceStatus,
  CourseStatus,
  EnrollmentStatus,
  PaymentStatus,
  QRTicketStatus,
  RegistrationStatus,
} from '@amg/shared';
import { colors } from './colors';

export type StatusTone = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'accent';

export interface StatusBadgeConfig {
  label: string;
  tone: StatusTone;
  foreground: string;
  background: string;
  border: string;
}

const toneColors: Record<StatusTone, Omit<StatusBadgeConfig, 'label' | 'tone'>> = {
  success: {
    foreground: colors.status.success,
    background: 'rgba(94, 211, 138, 0.14)',
    border: 'rgba(94, 211, 138, 0.34)',
  },
  warning: {
    foreground: colors.status.warning,
    background: colors.accent.goldMuted,
    border: 'rgba(212, 175, 55, 0.36)',
  },
  error: {
    foreground: colors.status.error,
    background: 'rgba(255, 107, 122, 0.14)',
    border: 'rgba(255, 107, 122, 0.34)',
  },
  info: {
    foreground: colors.status.info,
    background: 'rgba(11, 58, 83, 0.58)',
    border: 'rgba(121, 184, 216, 0.28)',
  },
  neutral: {
    foreground: colors.status.neutral,
    background: 'rgba(209, 213, 219, 0.10)',
    border: 'rgba(209, 213, 219, 0.20)',
  },
  accent: {
    foreground: colors.accent.primary,
    background: colors.accent.goldMuted,
    border: 'rgba(212, 175, 55, 0.36)',
  },
};

const makeStatus = (label: string, tone: StatusTone): StatusBadgeConfig => ({
  label,
  tone,
  ...toneColors[tone],
});

export const registrationStatusMap: Record<RegistrationStatus, StatusBadgeConfig> = {
  [RegistrationStatus.Pending]: makeStatus('Pending approval', 'warning'),
  [RegistrationStatus.Approved]: makeStatus('Approved', 'success'),
  [RegistrationStatus.Rejected]: makeStatus('Rejected', 'error'),
  [RegistrationStatus.Cancelled]: makeStatus('Cancelled', 'neutral'),
};

export const paymentStatusMap: Record<PaymentStatus, StatusBadgeConfig> = {
  [PaymentStatus.NotRequired]: makeStatus('No payment required', 'neutral'),
  [PaymentStatus.Pending]: makeStatus('Payment pending', 'warning'),
  [PaymentStatus.Successful]: makeStatus('Paid', 'success'),
  [PaymentStatus.Failed]: makeStatus('Payment failed', 'error'),
  [PaymentStatus.RefundPending]: makeStatus('Refund review', 'warning'),
  [PaymentStatus.Refunded]: makeStatus('Refunded', 'neutral'),
  [PaymentStatus.ManuallyVerified]: makeStatus('Manually verified', 'success'),
  [PaymentStatus.Cancelled]: makeStatus('Payment cancelled', 'neutral'),
};

export const qrTicketStatusMap: Record<QRTicketStatus, StatusBadgeConfig> = {
  [QRTicketStatus.NotIssued]: makeStatus('Not issued', 'neutral'),
  [QRTicketStatus.Active]: makeStatus('Active QR', 'success'),
  [QRTicketStatus.Used]: makeStatus('Used', 'info'),
  [QRTicketStatus.Expired]: makeStatus('Expired', 'warning'),
  [QRTicketStatus.Revoked]: makeStatus('Revoked', 'error'),
};

export const attendanceStatusMap: Record<AttendanceStatus, StatusBadgeConfig> = {
  [AttendanceStatus.Validated]: makeStatus('Validated', 'success'),
  [AttendanceStatus.Rejected]: makeStatus('Rejected', 'error'),
};

export const courseStatusMap: Record<CourseStatus, StatusBadgeConfig> = {
  [CourseStatus.Draft]: makeStatus('Draft', 'neutral'),
  [CourseStatus.Published]: makeStatus('Published', 'success'),
  [CourseStatus.Archived]: makeStatus('Archived', 'neutral'),
};

export const enrollmentStatusMap: Record<EnrollmentStatus, StatusBadgeConfig> = {
  [EnrollmentStatus.Active]: makeStatus('Enrolled', 'success'),
  [EnrollmentStatus.Completed]: makeStatus('Completed', 'accent'),
  [EnrollmentStatus.Cancelled]: makeStatus('Cancelled', 'neutral'),
};

export const scannerResultStatusMap = {
  success: makeStatus('Success', 'success'),
  duplicate: makeStatus('Already checked in', 'warning'),
  wrong_event: makeStatus('Wrong event', 'error'),
  unpaid: makeStatus('Unpaid', 'warning'),
  unapproved: makeStatus('Unapproved', 'warning'),
  expired: makeStatus('Expired', 'warning'),
  revoked: makeStatus('Revoked', 'error'),
  not_found: makeStatus('Not found', 'error'),
  invalid: makeStatus('Invalid QR', 'error'),
} as const;

export const statusBadgeMaps = {
  registration: registrationStatusMap,
  payment: paymentStatusMap,
  qrTicket: qrTicketStatusMap,
  attendance: attendanceStatusMap,
  course: courseStatusMap,
  enrollment: enrollmentStatusMap,
  scanner: scannerResultStatusMap,
} as const;

export type StatusDomain = keyof typeof statusBadgeMaps;

export function getStatusBadgeConfig(domain: StatusDomain, status: string): StatusBadgeConfig {
  const map = statusBadgeMaps[domain] as Record<string, StatusBadgeConfig>;
  return map[status] ?? makeStatus(status.replace(/_/g, ' '), 'neutral');
}
