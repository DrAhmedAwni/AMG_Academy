# Data Model: AMG Academy Platform V1

**Date**: 2026-05-27
**Feature**: AMG Academy Platform V1
**Plan**: [plan.md](plan.md)

---

## Entity Relationship Diagram (Text)

```
User ||--o{ EventRegistration : registers
User ||--o{ CourseEnrollment : enrolls
User ||--o{ Notification : receives
User ||--o{ AuditLog : acts
User ||--o{ QRTicket : owns
User ||--o{ AttendanceCheckIn : scans
User ||--o{ Course : instructs

Role ||--o{ User : assigned_to
Role ||--o{ RolePermission : has
Permission ||--o{ RolePermission : granted_to

Event ||--o{ EventRegistration : has
Event ||--o{ QRTicket : has
Event ||--o{ AttendanceCheckIn : has
EventCategory ||--o{ Event : categorizes

EventRegistration ||--o| Payment : has
EventRegistration ||--o| QRTicket : generates

Course ||--o{ Lesson : contains
Course ||--o{ CourseEnrollment : has
CourseCategory ||--o{ Course : categorizes

Lesson ||--o| Video : uses
Lesson ||--o{ LessonProgress : tracked_by

CourseEnrollment ||--o| Payment : has
CourseEnrollment ||--o{ LessonProgress : tracks

QRTicket ||--o{ AttendanceCheckIn : validated_by

Announcement ||--o{ Notification : triggers
```

---

## Entity Definitions

### User

The central identity entity. Every person using the platform is a User.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | Auto-generated |
| email | String | UNIQUE, indexed | Case-insensitive, validated format |
| password | String | — | bcrypt hash, never plain text |
| name | String | — | Full name |
| phone | String? | — | Optional contact number |
| specialty | String? | — | Dental specialty or profession |
| clinic | String? | — | Clinic or hospital name |
| city | String? | — | City |
| avatarUrl | String? | — | Profile image URL |
| emailVerified | Boolean | DEFAULT false | Must be true to log in |
| emailVerifiedAt | DateTime? | — | Timestamp of verification |
| status | UserStatus | DEFAULT ACTIVE | ACTIVE, DISABLED, DELETED |
| roleId | UUID | FK → Role | Required |
| createdAt | DateTime | DEFAULT now | — |
| updatedAt | DateTime | Auto-update | — |

**Validation Rules**:
- Email must be unique and valid format.
- Password minimum 8 characters, 1 uppercase, 1 lowercase, 1 number.
- Name minimum 2 characters.
- Phone must be valid if provided.

**State Transitions**:
- ACTIVE → DISABLED (admin action, audit logged)
- ACTIVE → DELETED (soft delete, audit logged)
- DISABLED → ACTIVE (admin action)

---

### Role

Defines a named set of permissions.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | Auto-generated |
| name | String | UNIQUE | Display name (e.g., "AMG Admin") |
| slug | String | UNIQUE, indexed | Machine name (e.g., "amg_admin") |
| description | String? | — | Optional explanation |
| createdAt | DateTime | DEFAULT now | — |
| updatedAt | DateTime | Auto-update | — |

**Validation Rules**:
- Slug must be URL-friendly (lowercase, hyphens, no spaces).
- Name and slug must be unique.

---

### Permission

A granular permission for a module action.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | Auto-generated |
| module | String | — | Module name (e.g., "events", "users") |
| action | String | — | Action name (e.g., "create", "read") |
| description | String? | — | Human-readable explanation |
| createdAt | DateTime | DEFAULT now | — |

**Validation Rules**:
- Combination of (module, action) must be UNIQUE.
- Module and action names are lowercase, no spaces.

---

### RolePermission

Join table linking roles to permissions.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | Auto-generated |
| roleId | UUID | FK → Role, indexed | — |
| permissionId | UUID | FK → Permission, indexed | — |

**Validation Rules**:
- Combination of (roleId, permissionId) must be UNIQUE.

---

### Event

A publishable academy offering.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | Auto-generated |
| title | String | — | Event title |
| slug | String | UNIQUE, indexed | URL-friendly identifier |
| description | Text | — | Full description (rich text) |
| startDate | DateTime | — | Event start |
| endDate | DateTime | — | Event end |
| location | String | — | Physical or virtual location |
| price | Decimal | DEFAULT 0 | 0 = free |
| capacity | Int | — | Max registrations |
| registrationDeadline | DateTime? | — | Optional cutoff |
| status | String | DEFAULT "draft" | draft, published, cancelled |
| categoryId | UUID | FK → EventCategory, indexed | Required |
| thumbnailUrl | String? | — | Event image |
| createdAt | DateTime | DEFAULT now | — |
| updatedAt | DateTime | Auto-update | — |

**Validation Rules**:
- endDate must be after startDate.
- registrationDeadline must be before startDate.
- capacity must be > 0.
- price must be ≥ 0.
- Slug must be unique and URL-friendly.

**State Transitions**:
- draft → published
- published → draft
- published → cancelled

---

### EventCategory

Classification for events.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | Auto-generated |
| name | String | UNIQUE | Display name |
| slug | String | UNIQUE, indexed | URL-friendly |
| description | String? | — | Optional |
| createdAt | DateTime | DEFAULT now | — |

---

### EventRegistration

Links a user to an event.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | Auto-generated |
| userId | UUID | FK → User, indexed | — |
| eventId | UUID | FK → Event, indexed | — |
| status | RegistrationStatus | DEFAULT PENDING | PENDING, APPROVED, REJECTED, CANCELLED |
| adminNotes | Text? | — | Rejection reason or notes |
| createdAt | DateTime | DEFAULT now | — |
| updatedAt | DateTime | Auto-update | — |

**Validation Rules**:
- UNIQUE on (userId, eventId) — prevents duplicate registrations.
- Event must be published and before deadline.
- Event must not be at capacity (unless waiting list enabled).

**State Transitions**:
- PENDING → APPROVED (admin action, triggers QR generation if paid)
- PENDING → REJECTED (admin action, requires notes)
- PENDING → CANCELLED (user or admin)
- APPROVED → CANCELLED

---

### Payment

Financial record for paid events or courses.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | Auto-generated |
| registrationId | UUID? | FK → EventRegistration, UNIQUE | Optional |
| enrollmentId | UUID? | FK → CourseEnrollment, UNIQUE | Optional |
| amount | Decimal | — | Payment amount |
| currency | String | DEFAULT "EGP" | ISO currency code |
| status | PaymentStatus | DEFAULT PENDING | See enum |
| provider | String | DEFAULT "manual" | manual, paymob, fawry, stripe, paypal |
| providerRef | String? | indexed | External reference |
| receiptRef | String? | — | Receipt/invoice number |
| verifiedById | UUID? | FK → User | Admin who verified |
| verifiedAt | DateTime? | — | Verification timestamp |
| createdAt | DateTime | DEFAULT now | — |
| updatedAt | DateTime | Auto-update | — |

**Validation Rules**:
- Either registrationId or enrollmentId must be set (not both null).
- amount must be > 0 for paid items.
- Manual verification requires admin permission.

**State Transitions**:
- PENDING → SUCCESSFUL (webhook or manual)
- PENDING → FAILED (webhook or timeout)
- PENDING → MANUALLY_VERIFIED (admin action)
- SUCCESSFUL → REFUNDED (admin action)
- PENDING → CANCELLED

---

### QRTicket

Unique ticket for event attendance.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | Auto-generated |
| registrationId | UUID | FK → EventRegistration, UNIQUE | One ticket per registration |
| userId | UUID | FK → User | Denormalized for quick lookup |
| eventId | UUID | FK → Event, indexed | Denormalized for quick lookup |
| tokenHash | String | UNIQUE, indexed | SHA-256 hash of raw token |
| status | QRTicketStatus | DEFAULT NOT_ISSUED | See enum |
| issuedAt | DateTime? | — | When ticket became active |
| createdAt | DateTime | DEFAULT now | — |
| updatedAt | DateTime | Auto-update | — |

**Validation Rules**:
- tokenHash must be unique.
- Raw token is never stored — only hash.
- Generated only when registration is APPROVED and payment is satisfied.

**State Transitions**:
- NOT_ISSUED → ACTIVE (upon approval + payment)
- ACTIVE → USED (after first successful scan)
- ACTIVE → EXPIRED (after event ends + grace period)
- ACTIVE → REVOKED (admin action)

---

### AttendanceCheckIn

Records a successful QR validation.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | Auto-generated |
| qrTicketId | UUID | FK → QRTicket | — |
| eventId | UUID | FK → Event, indexed | Denormalized |
| scannerId | UUID | FK → User, indexed | Who performed the scan |
| status | AttendanceStatus | — | VALIDATED, REJECTED |
| scanTime | DateTime | DEFAULT now | — |
| notes | String? | — | Optional notes |

**Validation Rules**:
- scannerId must have scanner role or appropriate permission.
- Rejected scans still create a record for audit purposes.

---

### Course

Recorded educational offering.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | Auto-generated |
| title | String | — | Course title |
| slug | String | UNIQUE, indexed | URL-friendly |
| description | Text | — | Full description |
| instructorId | UUID | FK → User, indexed | Must be instructor role |
| categoryId | UUID | FK → CourseCategory, indexed | Required |
| thumbnailUrl | String? | — | Course image |
| price | Decimal | DEFAULT 0 | 0 = free |
| isFree | Boolean | DEFAULT true | Derived from price |
| status | CourseStatus | DEFAULT DRAFT | DRAFT, PUBLISHED, ARCHIVED |
| totalDuration | Int | DEFAULT 0 | Sum of lesson durations (minutes) |
| createdAt | DateTime | DEFAULT now | — |
| updatedAt | DateTime | Auto-update | — |

**Validation Rules**:
- Slug must be unique and URL-friendly.
- instructorId must belong to a user with instructor role (or admin).
- price must be ≥ 0.

**State Transitions**:
- DRAFT → PUBLISHED
- PUBLISHED → ARCHIVED
- PUBLISHED → DRAFT

---

### CourseCategory

Classification for courses.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | Auto-generated |
| name | String | UNIQUE | Display name |
| slug | String | UNIQUE, indexed | URL-friendly |
| description | String? | — | Optional |
| createdAt | DateTime | DEFAULT now | — |

---

### Lesson

A single video unit within a course.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | Auto-generated |
| title | String | — | Lesson title |
| description | Text? | — | Optional |
| courseId | UUID | FK → Course, indexed | Required |
| orderIndex | Int | indexed | Display order |
| duration | Int | DEFAULT 0 | Minutes |
| videoId | UUID? | FK → Video | Optional |
| createdAt | DateTime | DEFAULT now | — |
| updatedAt | DateTime | Auto-update | — |

**Validation Rules**:
- orderIndex must be unique within a course (or handled by reordering logic).
- courseId must reference a published course (for public access).

---

### Video

A video file or streaming asset.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | Auto-generated |
| provider | String | DEFAULT "vps" | vps, cloudflare, bunny, vimeo, mux, s3 |
| providerVideoId | String? | — | External provider ID |
| originalName | String | — | Original filename |
| filePath | String? | — | VPS filesystem path |
| duration | Int | DEFAULT 0 | Seconds |
| sizeBytes | Int | DEFAULT 0 | File size |
| mimeType | String? | — | video/mp4, etc. |
| createdAt | DateTime | DEFAULT now | — |

**Validation Rules**:
- If provider is "vps", filePath is required.
- If provider is external, providerVideoId is required.

---

### CourseEnrollment

Links a user to a course.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | Auto-generated |
| userId | UUID | FK → User, indexed | — |
| courseId | UUID | FK → Course, indexed | — |
| status | EnrollmentStatus | DEFAULT ACTIVE | ACTIVE, COMPLETED, CANCELLED |
| enrolledAt | DateTime | DEFAULT now | — |
| completedAt | DateTime? | — | When all lessons completed |

**Validation Rules**:
- UNIQUE on (userId, courseId) — prevents duplicate enrollments.
- User must be authenticated.
- For paid courses, payment must be verified before lessons are accessible.

**State Transitions**:
- ACTIVE → COMPLETED (all lessons marked complete)
- ACTIVE → CANCELLED (user or admin)

---

### LessonProgress

Tracks completion of individual lessons.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | Auto-generated |
| enrollmentId | UUID | FK → CourseEnrollment, indexed | — |
| lessonId | UUID | FK → Lesson, indexed | — |
| isCompleted | Boolean | DEFAULT false | — |
| completedAt | DateTime? | — | Timestamp |

**Validation Rules**:
- UNIQUE on (enrollmentId, lessonId) — one progress record per lesson per enrollment.

---

### Announcement

Broadcast message from admins.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | Auto-generated |
| title | String | — | Announcement title |
| body | Text | — | Full content |
| targetRoles | String[] | — | Role slugs; empty = all users |
| status | AnnouncementStatus | DEFAULT DRAFT | DRAFT, PUBLISHED, ARCHIVED |
| publishedAt | DateTime? | — | Publish timestamp |
| createdAt | DateTime | DEFAULT now | — |
| updatedAt | DateTime | Auto-update | — |

**State Transitions**:
- DRAFT → PUBLISHED
- PUBLISHED → ARCHIVED

---

### Notification

Per-user message triggered by system events.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | Auto-generated |
| userId | UUID | FK → User, indexed | Recipient |
| type | NotificationType | — | See enum |
| title | String | — | Short title |
| message | Text | — | Full message |
| read | Boolean | DEFAULT false | — |
| readAt | DateTime? | — | When marked read |
| entityType | String? | — | Related entity type |
| entityId | String? | — | Related entity ID |
| channels | NotificationChannelType[] | — | IN_APP, EMAIL, PUSH |
| createdAt | DateTime | DEFAULT now | — |

---

### StaticContentPage

Admin-managed static pages.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | Auto-generated |
| title | String | — | Page title |
| slug | String | UNIQUE, indexed | URL path |
| body | Text | — | Rich text content |
| status | String | DEFAULT "draft" | draft, published |
| publishedAt | DateTime? | — | — |
| createdAt | DateTime | DEFAULT now | — |
| updatedAt | DateTime | Auto-update | — |

---

### AuditLog

Immutable record of sensitive admin actions.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | Auto-generated |
| actorId | UUID | FK → User, indexed | Who performed the action |
| action | AuditAction | — | See enum |
| entityType | String | indexed | Type of affected entity |
| entityId | String | — | ID of affected entity |
| oldValue | Text? | — | JSON string of previous state |
| newValue | Text? | — | JSON string of new state |
| ipAddress | String? | — | Client IP |
| userAgent | String? | — | Client user agent |
| createdAt | DateTime | DEFAULT now | — |

**Validation Rules**:
- Immutable after creation — no updates or deletes allowed.
- actorId must reference an existing user (or system user for automated actions).

---

## Indexes Summary

| Table | Indexed Fields | Purpose |
|---|---|---|
| User | email, roleId, status | Login lookup, role filtering, status filtering |
| Role | slug | Role lookup by slug |
| Permission | module, action | Permission lookup |
| RolePermission | roleId, permissionId | Role-permission joins |
| Event | status, categoryId, startDate, slug | Filtering, search, URL lookup |
| EventCategory | slug | URL lookup |
| EventRegistration | userId, eventId, status | Duplicate prevention, filtering |
| Payment | status, provider, providerRef | Status filtering, webhook lookup |
| QRTicket | tokenHash, eventId, status | Fast scan validation, filtering |
| AttendanceCheckIn | eventId, scannerId, scanTime | Event reports, scanner history |
| Course | status, categoryId, instructorId, slug | Filtering, search, URL lookup |
| Lesson | courseId, orderIndex | Course lesson ordering |
| CourseEnrollment | userId, courseId, status | Duplicate prevention, filtering |
| LessonProgress | enrollmentId, lessonId | Progress tracking |
| Announcement | status, publishedAt | Published listing |
| Notification | userId, read, createdAt | User inbox, unread count |
| StaticContentPage | slug, status | URL lookup, published filtering |
| AuditLog | actorId, entityType+entityId, createdAt, action | Audit queries |

---

## Constraints Summary

| Constraint | Tables | Rule |
|---|---|---|
| Unique email | User | One account per email |
| Unique slug | Event, Course, EventCategory, CourseCategory, StaticContentPage | URL-friendly identifiers must be unique |
| Unique registration | EventRegistration | One registration per user per event |
| Unique enrollment | CourseEnrollment | One enrollment per user per course |
| Unique QR ticket | QRTicket | One ticket per registration |
| Unique token hash | QRTicket | Token hashes must be globally unique |
| Unique payment per registration | Payment | One payment per registration |
| Unique payment per enrollment | Payment | One payment per enrollment |
| Unique role permission | RolePermission | One permission assignment per role |
| Unique module action | Permission | One permission per module-action pair |
| Unique lesson progress | LessonProgress | One progress record per enrollment-lesson |
| FK constraints | All relation tables | Referential integrity enforced |
