import type {
  Announcement,
  AuthUser,
  Category,
  Course,
  CourseEnrollment,
  Event,
  Lesson,
  Notification,
  PaymentRecord,
  QRTicket,
  Registration,
} from '@amg/shared';
import type {
  AttendanceStatus,
  CourseStatus,
  EnrollmentStatus,
  MobileAuthTokens,
  PaymentStatus,
  QRTicketStatus,
  RegistrationStatus,
} from './api';

export type SessionStatus = 'loading' | 'authenticated' | 'anonymous' | 'expired';

export interface MobileSession {
  status: SessionStatus;
  user: AuthUser | null;
  tokens?: MobileAuthTokens;
  lastValidatedAt: string | null;
}

export interface EventView extends Event {
  registrationStatus?: RegistrationStatus;
  paymentStatus?: PaymentStatus;
  qrTicketStatus?: QRTicketStatus;
  registration?: Registration;
}

export interface PaymentView extends PaymentRecord {
  itemType: 'event' | 'course' | 'unknown';
  itemTitle: string;
  mockMode: boolean;
  registrationId?: string;
  enrollmentId?: string;
}

export interface QRTicketView extends QRTicket {
  registrationStatus: RegistrationStatus;
  paymentStatus: PaymentStatus;
  qrPayload?: string;
}

export interface CourseView extends Course {
  enrollmentStatus?: EnrollmentStatus;
  paymentStatus?: PaymentStatus;
  progress?: number;
}

export interface LessonPlaybackView extends Lesson {
  courseId: string;
  isLocked: boolean;
  streamState: 'idle' | 'loading' | 'ready' | 'denied' | 'error';
}

export interface NotificationView extends Notification {
  announcement?: Pick<Announcement, 'id' | 'title' | 'publishedAt'>;
}

export interface ScannerValidationResult {
  valid: boolean;
  reason?:
    | 'success'
    | 'duplicate'
    | 'wrong_event'
    | 'unpaid'
    | 'unapproved'
    | 'expired'
    | 'revoked'
    | 'not_found'
    | 'invalid';
  attendeeName?: string;
  eventName?: string;
  registrationStatus?: RegistrationStatus;
  paymentStatus?: PaymentStatus;
  attendanceStatus?: AttendanceStatus;
  checkInTime?: string;
}

export interface ScannerSession {
  selectedEventId: string | null;
  cameraPermission: 'pending' | 'granted' | 'denied';
  lastScannedToken: string | null;
  currentResult: ScannerValidationResult | null;
  recentScans: ScannerValidationResult[];
}

export interface CourseAccessSummary {
  courseId: string;
  status: CourseStatus;
  enrollment?: CourseEnrollment;
  lessonsLocked: boolean;
}

export interface EntitySummary {
  id: string;
  title: string;
  category?: Category;
}
