# Data Model: AMG Academy Mobile App V2

**Date**: 2026-05-29
**Feature**: AMG Academy Mobile App V2
**Plan**: [plan.md](plan.md)

---

## Model Ownership

Mobile V2 does not introduce new PostgreSQL entities in this plan. Backend
Prisma entities remain the source of truth. The models below are mobile view
models, cache shapes, and session states derived from existing backend API
responses and `packages/shared` contracts.

---

## Entity Relationships

```text
MobileSession --> AuthUser
AuthUser --> RolePermission[]
AuthUser --> EventRegistration[]
EventRegistration --> Payment?
EventRegistration --> QRTicket?
QRTicket --> ScannerValidationResult
AuthUser --> CourseEnrollment[]
CourseEnrollment --> Payment?
CourseEnrollment --> LessonProgress[]
Course --> Lesson[]
Lesson --> VideoStreamAccess
AuthUser --> Notification[]
ScannerSession --> Event
ScannerSession --> ScannerValidationResult[]
```

---

## MobileSession

Represents the locally stored authenticated session material and bootstrap state.

| Field | Type | Source | Notes |
|---|---|---|---|
| accessTokenOrCookie | string | SecureStore | Stored only if mobile transport exposes it |
| refreshTokenOrCookie | string | SecureStore | Stored only if supported |
| user | AuthUser? | `/auth/me` | Cached only in memory/query cache |
| status | string | mobile | `loading`, `authenticated`, `anonymous`, `expired` |
| lastValidatedAt | string? | mobile | ISO timestamp of last `/auth/me` success |

**Rules**:
- SecureStore is the only persistent store for session material.
- Logout clears secure storage and private query cache.
- `/auth/me` is required before protected navigation is trusted.

---

## AuthUser

Existing shared backend user identity used by mobile navigation.

| Field | Type | Source | Notes |
|---|---|---|---|
| id | string | backend | User id |
| email | string | backend | Display/account identity |
| name | string | backend | Dashboard/profile |
| role | string | backend | Role slug |
| permissions | string[] | backend | Route visibility and UI actions |
| avatarUrl | string? | backend | Optional profile image |
| emailVerified | boolean | backend | Login eligibility |

**Rules**:
- Role/permission data is read-only on mobile.
- Scanner/admin visibility is derived from role/permissions but enforced again by backend.

---

## EventView

Mobile event card/detail data derived from existing event APIs.

| Field | Type | Source | Notes |
|---|---|---|---|
| id | string | backend | Event id |
| slug | string | backend | URL/API lookup where supported |
| title | string | backend | Display |
| description | string | backend | Detail screen |
| startDate/endDate | string | backend | Date display |
| location | string | backend | Event info |
| price | number | backend | Payment CTA |
| currency | string | backend | Default EGP |
| isFree | boolean | backend | Display only |
| status | string | backend | Published/cancelled |
| registrationStatus | RegistrationStatus? | backend | User-specific state |
| paymentStatus | PaymentStatus? | backend | User-specific state |
| qrTicketStatus | QRTicketStatus? | backend | User-specific state |

**Rules**:
- Registration button state is disabled/hidden from backend state, not local guesswork.
- Duplicate registration is prevented by backend and reflected in UI.

---

## PaymentView

Payment screen state for paid event registration or paid course enrollment.

| Field | Type | Source | Notes |
|---|---|---|---|
| id | string | backend | Payment id |
| itemType | string | backend/mobile mapping | `event` or `course` |
| itemTitle | string | backend | Event/course title |
| amount | number | backend | Never client-authored |
| currency | string | backend | Display |
| status | PaymentStatus | backend | Pending/successful/failed/etc. |
| provider | string | backend | `manual`, `mock`, future Paymob |
| mockMode | boolean | config/backend | Must be visible when true |

**State transitions**:
- Pending -> Successful/Failed/Cancelled/ManuallyVerified/Refunded from backend.
- Mobile mock actions call backend and then refetch payment state.

---

## QRTicketView

Ticket wallet entry derived from existing QR ticket APIs.

| Field | Type | Source | Notes |
|---|---|---|---|
| id | string | backend | Ticket id |
| event | EventSummary | backend | Event display |
| status | QRTicketStatus | backend | Active/used/expired/revoked/not issued |
| fallbackCode | string | backend | Text fallback |
| issuedAt | string? | backend | Display |
| registrationStatus | RegistrationStatus | backend | Eligibility context |
| paymentStatus | PaymentStatus | backend | Eligibility context |

**Rules**:
- Active QR is displayed only when backend says ticket is active.
- Pending/unpaid/unapproved tickets display locked/not issued states.

---

## ScannerSession

Camera-first staff flow for validating QR tickets.

| Field | Type | Source | Notes |
|---|---|---|---|
| selectedEventId | string | backend/mobile state | Required before scan |
| cameraPermission | string | platform | Granted/denied/pending |
| lastScannedToken | string? | camera | Sent to backend only |
| currentResult | ScannerValidationResult? | backend | Result screen |
| recentScans | ScannerValidationResult[] | backend/mobile cache | Recent scan list |

**Rules**:
- Scanner route requires backend role/permission.
- Every scan calls backend validation.
- Re-scan is available after result acknowledgement.

---

## ScannerValidationResult

Backend-owned scan result state.

| Field | Type | Source | Notes |
|---|---|---|---|
| valid | boolean | backend | Success or rejection |
| reason | string? | backend | Not found, duplicate, wrong-event, unpaid, unapproved, expired, revoked |
| attendeeName | string? | backend | Success context |
| eventName | string? | backend | Success context |
| registrationStatus | RegistrationStatus? | backend | Context |
| paymentStatus | PaymentStatus? | backend | Context |
| checkInTime | string? | backend | Success/duplicate context |

---

## CourseView

Mobile course card/detail data.

| Field | Type | Source | Notes |
|---|---|---|---|
| id | string | backend | Course id |
| slug | string | backend | Lookup |
| title | string | backend | Display |
| description | string | backend | Detail |
| instructor | UserSummary | backend | Display |
| category | Category | backend | Filters |
| price | number | backend | Paid/free state |
| isFree | boolean | backend | Display |
| lessonCount | number | backend | Display |
| enrollmentStatus | EnrollmentStatus? | backend | User-specific |
| paymentStatus | PaymentStatus? | backend | User-specific |
| progress | number? | backend | Completion display |

**Rules**:
- Enrollment and lesson unlock state come from backend.
- Paid course CTA leads to payment and then refetches course/enrollment state.

---

## LessonPlaybackView

Authorized lesson player state.

| Field | Type | Source | Notes |
|---|---|---|---|
| lessonId | string | backend | Lesson id |
| courseId | string | backend | Course relation |
| title | string | backend | Display |
| orderIndex | number | backend | Playlist |
| videoId | string? | backend | Authorization lookup |
| isLocked | boolean | backend | Display and guard |
| isCompleted | boolean | backend | Progress |
| streamState | string | backend/mobile | Loading/ready/denied/error |

**Rules**:
- Direct links re-check authorization.
- Durable public video URLs are not stored.

---

## NotificationView

Notification inbox and announcement cards.

| Field | Type | Source | Notes |
|---|---|---|---|
| id | string | backend | Notification id |
| type | string | backend | Status/icon mapping |
| title | string | backend | Display |
| message | string | backend | Display |
| read | boolean | backend | Read/unread |
| entityType | string? | backend | Deep link target |
| entityId | string? | backend | Deep link target |
| createdAt | string | backend | Sorting |

**Rules**:
- Read/unread mutations refetch notification counts.
- Push token registration is separate from notification display.

---

## Status Mapping

Mobile status badges must use shared enums where available:

- `RegistrationStatus`: pending, approved, rejected, cancelled
- `PaymentStatus`: not_required, pending, successful, failed, refunded, manually_verified, cancelled
- `QRTicketStatus`: not_issued, active, used, expired, revoked
- `EnrollmentStatus`: active, completed, cancelled
- `AttendanceStatus`: validated, rejected

Each status has a text label and color token; color alone is insufficient.
