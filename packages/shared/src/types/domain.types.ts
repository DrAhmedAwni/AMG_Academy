import type {
  AnnouncementStatus,
  AttendanceStatus,
  CaseCommentStatus,
  CasePostStatus,
  CertificateSourceType,
  CertificateStatus,
  ContentPageStatus,
  CourseStatus,
  EnrollmentStatus,
  NotificationChannelType,
  NotificationType,
  PaymentStatus,
  QRTicketStatus,
  RegistrationStatus,
  StudyGroupJoinMode,
  StudyGroupMemberRole,
  StudyGroupMemberStatus,
  StudyGroupSessionStatus,
  StudyGroupType,
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
  event: Pick<Event, 'id' | 'title' | 'startDate' | 'endDate' | 'status'>;
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

export interface Certificate {
  id: string;
  certificateNumber: string;
  sourceType: CertificateSourceType;
  sourceTitle: string;
  learnerName: string;
  issuerName: string;
  status: CertificateStatus;
  issuedAt: string | null;
  releasedAt: string | null;
  hours: number | null;
  credits: number | null;
  verificationUrl: string;
  downloadUrl: string;
  publicDownloadUrl: string;
}

export interface CertificateVerification {
  valid: boolean;
  status: CertificateStatus | 'not_found';
  certificateNumber: string | null;
  learnerName: string | null;
  sourceType: CertificateSourceType | null;
  sourceTitle: string | null;
  issuerName: string;
  issuedAt: string | null;
  hours: number | null;
  credits: number | null;
}

export interface CaseCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
}

export interface CasePost {
  id: string;
  authorId: string;
  authorName: string;
  categoryId: string;
  categoryName: string;
  title: string;
  description: string;
  tags: string[];
  status: CasePostStatus;
  imageCount: number;
  commentCount: number;
  upvoteCount: number;
  isUpvoted: boolean;
  isBookmarked: boolean;
  createdAt: string;
}

export interface CasePostDetail extends CasePost {
  images: CaseImageRef[];
  comments: CaseComment[];
}

export interface CaseImageRef {
  id: string;
  storageKey: string;
  caption: string | null;
  orderIndex: number;
}

export interface CaseComment {
  id: string;
  casePostId: string;
  authorId: string;
  authorName: string;
  parentCommentId: string | null;
  body: string;
  status: string;
  createdAt: string;
  replyCount: number;
}

export interface StudyGroup {
  id: string;
  title: string;
  description: string | null;
  type: StudyGroupType;
  joinMode: StudyGroupJoinMode;
  ownerId: string;
  ownerName: string;
  courseId: string | null;
  courseTitle: string | null;
  memberCount: number;
  isMember: boolean;
  memberStatus: string | null;
  status: string;
  createdAt: string;
}

export interface StudyGroupMember {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  role: StudyGroupMemberRole;
  status: StudyGroupMemberStatus;
  joinedAt: string | null;
}

export interface StudyGroupMessage {
  id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface StudyGroupFile {
  id: string;
  groupId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedById: string;
  uploadedByName: string;
  createdAt: string;
}

export interface StudyGroupSession {
  id: string;
  groupId: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  onlineUrlNote: string | null;
  status: StudyGroupSessionStatus;
  createdById: string;
  createdByName: string;
}
