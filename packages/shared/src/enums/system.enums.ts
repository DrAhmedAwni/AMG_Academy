export enum NotificationType {
  RegistrationSubmitted = 'REGISTRATION_SUBMITTED',
  RegistrationApproved = 'REGISTRATION_APPROVED',
  RegistrationRejected = 'REGISTRATION_REJECTED',
  PaymentSuccessful = 'PAYMENT_SUCCESSFUL',
  PaymentFailed = 'PAYMENT_FAILED',
  QrIssued = 'QR_ISSUED',
  EventReminder = 'EVENT_REMINDER',
  EventCancelled = 'EVENT_CANCELLED',
  NewAnnouncement = 'NEW_ANNOUNCEMENT',
  NewCoursePublished = 'NEW_COURSE_PUBLISHED',
  NewEnrollment = 'NEW_ENROLLMENT',
  CourseCompleted = 'COURSE_COMPLETED',
}

export enum NotificationChannelType {
  InApp = 'IN_APP',
  Email = 'EMAIL',
  Push = 'PUSH',
}

export enum AuditAction {
  Create = 'CREATE',
  Update = 'UPDATE',
  Delete = 'DELETE',
  Publish = 'PUBLISH',
  Archive = 'ARCHIVE',
  Approve = 'APPROVE',
  Reject = 'REJECT',
  Verify = 'VERIFY',
  Scan = 'SCAN',
  Assign = 'ASSIGN',
  Revoke = 'REVOKE',
}
