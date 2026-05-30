import type {
  AnnouncementStatus,
  AttendanceStatus,
  ContentPageStatus,
  CourseStatus,
  EnrollmentStatus,
  NotificationChannelType,
  NotificationType,
  PaymentStatus,
  QRTicketStatus,
  RegistrationStatus,
  UserStatus,
} from '../enums/index';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  status: UserStatus;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  price: number;
  currency: string;
  isFree: boolean;
  capacity: number;
  registrationDeadline: string | null;
  category: Category;
  thumbnailUrl: string | null;
  registrationsCount: number;
  remainingSpots: number;
  isRegistered: boolean;
  status: string;
}

export interface Registration {
  id: string;
  event: Pick<Event, 'id' | 'title' | 'startDate' | 'slug'>;
  status: RegistrationStatus;
  paymentStatus: PaymentStatus;
  qrTicketStatus: QRTicketStatus;
  adminNotes: string | null;
  createdAt: string;
}

export interface QRTicket {
  id: string;
  event: Pick<Event, 'id' | 'title' | 'startDate'>;
  status: QRTicketStatus;
  fallbackCode: string;
  issuedAt: string | null;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  instructor: Pick<User, 'id' | 'name'>;
  category: Category;
  thumbnailUrl: string | null;
  price: number;
  isFree: boolean;
  lessonCount: number;
  totalDuration: number;
  enrollmentsCount: number;
  isEnrolled: boolean;
  status: CourseStatus;
}

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  orderIndex: number;
  videoId: string | null;
  isCompleted: boolean;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  entityType: string | null;
  entityId: string | null;
  channels: NotificationChannelType[];
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: string | null;
  newValue: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  providerRef: string | null;
}

export interface AttendanceRecord {
  id: string;
  status: AttendanceStatus;
  scanTime: string;
  notes: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  status: AnnouncementStatus;
  publishedAt: string | null;
}

export interface StaticContentPage {
  id: string;
  title: string;
  slug: string;
  body: string;
  status: ContentPageStatus;
  publishedAt: string | null;
}

export interface CourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
}
