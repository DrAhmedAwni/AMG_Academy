# Mobile API Contracts: AMG Academy Mobile App V2

**Date**: 2026-05-29
**Feature**: AMG Academy Mobile App V2
**Plan**: [../plan.md](../plan.md)

---

## Contract Policy

Mobile V2 consumes the existing NestJS API under `/api/v1`. This document maps
mobile screens to existing API contracts and highlights any compatibility gaps.

Rules:
- Backend remains source of truth.
- Mobile does not connect to PostgreSQL or Prisma directly.
- Mobile does not compute payment, QR, scanner, course access, or RBAC
  eligibility locally.
- API responses use the shared envelope:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

or:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  }
}
```

---

## Auth and Session

| Mobile screen/flow | Endpoint | Method | Source of truth |
|---|---|---|---|
| Register | `/auth/register` | POST | Backend user service |
| Login | `/auth/login` | POST | Backend auth service |
| Restore session | `/auth/me` | GET | Backend JWT guard/current user |
| Refresh session | `/auth/refresh` | POST | Backend refresh token validation |
| Logout | `/auth/logout` | POST | Backend auth service + local cleanup |
| Forgot password | `/auth/forgot-password` | POST | Backend auth/email service |

**Mobile transport note**: Current web auth writes httpOnly cookies. Mobile uses
SecureStore for session material. If native cookie persistence is not reliable,
extend the login/refresh response with token values for native clients while
preserving existing cookie behavior and backend auth logic.

---

## Events and Reservations

| Mobile screen/flow | Endpoint | Method | Notes |
|---|---|---|---|
| Events tab | `/events?page=&limit=&search=&category=&isFree=` | GET | Paginated/incremental list |
| Event detail | `/events/:slug` or `/events/:id` | GET | Use available backend lookup |
| Register for event | `/registrations` | POST | Backend prevents duplicate/deadline/capacity violations |
| My reservations | `/registrations?page=&limit=&status=` | GET | User-specific registration state |

**State ownership**:
- `registrationStatus`, `paymentStatus`, and `qrTicketStatus` are backend-owned.
- Mobile CTA states are display helpers only.

---

## Payments

| Mobile screen/flow | Endpoint | Method | Notes |
|---|---|---|---|
| Payment detail | `/payments/:paymentId` | GET | Required for payment screen refresh |
| Mock payment success | `/payments/:paymentId/mock-success` or existing equivalent | POST | Must update backend payment record |
| Mock payment failure | `/payments/:paymentId/mock-fail` or existing equivalent | POST | Must update backend payment record |
| Cancel payment | `/payments/:paymentId/cancel` or existing equivalent | POST | Must update backend payment record |

**Compatibility check required in implementation**: Confirm the current payment
module exposes mobile-usable payment detail and mock action endpoints. If not,
add small backwards-compatible endpoints that reuse `PaymentsService` and do not
duplicate payment business logic.

---

## QR Tickets

| Mobile screen/flow | Endpoint | Method | Notes |
|---|---|---|---|
| Ticket wallet | `/qr-tickets` | GET | User-specific wallet |
| Ticket detail | `/qr-tickets/:id` if available | GET | Optional detail screen |
| QR display data | `/qr-tickets` response | GET | Must include raw display token or backend-approved QR payload |

**Compatibility check required in implementation**: Confirm the wallet endpoint
returns a QR-display payload usable by the mobile app. If it only returns
metadata, add a protected display payload field without exposing token hashes.

---

## Scanner

| Mobile screen/flow | Endpoint | Method | Notes |
|---|---|---|---|
| Select event | `/events` or scanner-specific event list | GET | Filter to scannable events if backend supports it |
| Validate scan | `/qr/scan` | POST | Backend validates selected event + token |
| Recent scans | `/attendance` or scanner-specific recent scans | GET | Optional but planned |

`POST /qr/scan` request:

```json
{
  "token": "raw-qr-token-from-camera",
  "eventId": "uuid"
}
```

Required result states:
- Success
- Already checked in / duplicate
- Wrong event
- Payment pending/unpaid
- Registration not approved/unapproved
- Expired
- Revoked
- Not found / invalid

---

## Courses, Enrollment, Lessons, Videos

| Mobile screen/flow | Endpoint | Method | Notes |
|---|---|---|---|
| Course catalog | `/courses?page=&limit=&search=&category=&isFree=` | GET | Paginated/incremental list |
| Course detail | `/courses/:slug` | GET | Includes public lesson preview |
| Lessons | `/courses/:slug/lessons` | GET | Backend checks enrollment/payment |
| Enrollment | `/enrollments` or existing equivalent | POST | Backend owns free/paid eligibility |
| My courses | `/enrollments` or existing equivalent | GET | User-specific enrollment/progress |
| Video stream | `/videos/:id/stream` | GET | Authorization required |

**Protected access**:
- Mobile never stores durable public video URLs.
- Direct lesson links must call backend before rendering playback.

---

## Notifications and Announcements

| Mobile screen/flow | Endpoint | Method | Notes |
|---|---|---|---|
| Notifications inbox | `/notifications?page=&limit=&read=` | GET | Paginated list |
| Mark read | `/notifications/:id/read` | PATCH | Refetch unread counts |
| Announcements | `/announcements` or dashboard endpoint | GET | Use existing published announcement endpoint |
| Push token preparation | Future notification endpoint | POST | Prepared, not release-blocking unless endpoint exists |

---

## Profile and Settings

| Mobile screen/flow | Endpoint | Method | Notes |
|---|---|---|---|
| Current profile | `/auth/me` and/or `/users/me` | GET | Backend profile source |
| Edit profile | `/users/me` or existing equivalent | PATCH | Field validation from backend/shared schemas |
| Change password | `/auth/change-password` | POST | If settings supports password change |

---

## Error Mapping

| API error | Mobile UI state |
|---|---|
| `UNAUTHORIZED` | Session expired, route to login |
| `FORBIDDEN` | Permission denied |
| `VALIDATION_ERROR` | Inline form errors |
| `CONFLICT` | Duplicate registration/enrollment or invalid state |
| `NOT_FOUND` | Missing event/course/ticket/payment |
| `RATE_LIMITED` | Temporary retry state |
| `INTERNAL_ERROR` | Friendly error with retry |

---

## Implementation Verification

- Confirm every mobile endpoint is backed by existing NestJS controller/service code.
- Confirm any added endpoint is compatibility-only and reuses existing services.
- Confirm status enums come from `@amg/shared`.
- Confirm no mobile screen unlocks payment, QR, scanner, or lesson access without backend state.

---

## Phase 2 Endpoint Audit - 2026-05-29

Phase 2 checked the existing NestJS controllers against the mobile contract before user-story screens begin.

| Area | Current backend status | Gap / follow-up task |
|---|---|---|
| Auth/session | `/auth/register`, `/auth/login`, `/auth/me`, `/auth/refresh`, `/auth/logout`, and `/auth/forgot-password` exist. Phase 2 added optional `client: "mobile"` login/refresh token response support while preserving web cookies. Bearer access tokens are already supported by the JWT strategy. | Validate native login/refresh in US1. |
| Events/reservations | `/events`, `/events/:slug`, `/registrations`, and user reservations exist. | Mobile should use slug detail unless an id lookup is added later. |
| Payments | `/payments/:id`, `/payments/:id/mock-success`, `/payments/:id/mock-fail`, and `/payments/:id/mock-cancel` exist and reuse `PaymentsService`. | Contract examples should use the existing `mock-cancel` path unless a `cancel` alias is later added. |
| QR tickets | `/qr-tickets` wallet and `/qr/scan` exist. Scanner covers backend validation. | T068/T069 must add or confirm a display-safe QR payload; current wallet mapping exposes a fallback code derived from token hash, not a raw display payload. |
| Courses/enrollments/videos | `/courses`, `/courses/:slug`, `/enrollments`, `/lessons?courseId=`, and protected `/videos/:id/stream` exist. Course detail includes lesson metadata and backend enrollment/payment hints. | T084/T085/T087-T089 must confirm mobile lesson access and enrollment flows use backend authorization for all locked/paid states. |
| Notifications | `/notifications`, `/notifications/:id/read`, `/notifications/read-all`, and notification preferences exist. | Push token endpoint remains future preparation work. |
| Announcements | Current controller exposes admin announcement management under `/announcements/admin` with permission guards. | T098 must confirm or add a mobile/user-safe published announcements endpoint. |
| Profile/settings | `/users/profile` GET/PATCH exists, while `/auth/me` also provides current identity. | Mobile profile API should use existing `/users/profile`; contract may document `/users/me` as an alias only if added. |
| Attendance/recent scans | `/attendance` and `/attendance/admin` exist. | T116 must confirm a scanner-friendly recent scans endpoint and permission model for staff users. |
