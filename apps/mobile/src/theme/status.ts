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
    background: 'rgba(34, 197, 94, 0.14)',
    border: 'rgba(34, 197, 94, 0.34)',
  },
  warning: {
    foreground: colors.status.warning,
    background: 'rgba(245, 158, 11, 0.14)',
    border: 'rgba(245, 158, 11, 0.34)',
  },
  error: {
    foreground: colors.status.error,
    background: 'rgba(239, 68, 68, 0.14)',
    border: 'rgba(239, 68, 68, 0.34)',
  },
  info: {
    foreground: colors.status.info,
    background: 'rgba(56, 189, 248, 0.14)',
    border: 'rgba(56, 189, 248, 0.34)',
  },
  neutral: {
    foreground: colors.status.neutral,
    background: 'rgba(148, 163, 184, 0.14)',
    border: 'rgba(148, 163, 184, 0.3)',
  },
  accent: {
    foreground: colors.accent.primary,
    background: 'rgba(84, 217, 232, 0.14)',
    border: 'rgba(84, 217, 232, 0.34)',
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
