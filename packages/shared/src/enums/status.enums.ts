export enum UserStatus {
  Active = 'active',
  Disabled = 'disabled',
  Deleted = 'deleted',
}

export enum RegistrationStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  Cancelled = 'cancelled',
}

export enum PaymentStatus {
  NotRequired = 'not_required',
  Pending = 'pending',
  Successful = 'successful',
  Failed = 'failed',
  RefundPending = 'refund_pending',
  Refunded = 'refunded',
  ManuallyVerified = 'manually_verified',
  Cancelled = 'cancelled',
}

export enum QRTicketStatus {
  NotIssued = 'not_issued',
  Active = 'active',
  Used = 'used',
  Expired = 'expired',
  Revoked = 'revoked',
}

export enum AttendanceStatus {
  Validated = 'validated',
  Rejected = 'rejected',
}

export enum CourseStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}

export enum EnrollmentStatus {
  Active = 'active',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export enum AnnouncementStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}

export enum ContentPageStatus {
  Draft = 'draft',
  Published = 'published',
}

export enum CertificateStatus {
  PendingReview = 'pending_review',
  Released = 'released',
  Revoked = 'revoked',
  Voided = 'voided',
}

export enum CertificateSourceType {
  Event = 'event',
  Course = 'course',
}
