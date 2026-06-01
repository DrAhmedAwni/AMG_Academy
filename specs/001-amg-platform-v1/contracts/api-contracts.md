# API Contracts: AMG Academy Platform V1

**Date**: 2026-05-27
**Feature**: AMG Academy Platform V1
**Plan**: [plan.md](plan.md)

---

## Overview

These contracts define the REST API interface between the Next.js frontend and the NestJS backend. All endpoints are prefixed with `/api/v1`. The API is designed to be stateless, JWT-authenticated via `httpOnly` cookies, and reusable by the future React Native V2 mobile app.

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 25,
    "total": 150
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "email", "message": "Email is required" }
    ]
  }
}
```

### Error Codes

| Code | HTTP Status | Meaning |
|---|---|---|
| BAD_REQUEST | 400 | Invalid request parameters |
| UNAUTHORIZED | 401 | Authentication required or invalid |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists or state conflict |
| UNPROCESSABLE | 422 | Validation failed |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

## Authentication

All protected endpoints require a valid JWT access token in the `httpOnly` cookie. The cookie is automatically sent with `withCredentials: true`.

### POST /auth/register

Register a new user account.

**Request Body**:
```json
{
  "name": "Dr. Ahmed Mohamed",
  "email": "ahmed@example.com",
  "password": "SecurePass123",
  "phone": "+20 123 456 7890",
  "specialty": "Orthodontics",
  "clinic": "Smile Care Dental",
  "city": "Cairo"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Dr. Ahmed Mohamed",
    "email": "ahmed@example.com",
    "emailVerified": false,
    "role": "user",
    "createdAt": "2026-05-27T10:00:00Z"
  }
}
```

**Validation Rules**:
- `name`: required, min 2 chars
- `email`: required, valid email format, unique
- `password`: required, min 8 chars, 1 uppercase, 1 lowercase, 1 number
- `phone`: optional, valid phone format
- `specialty`, `clinic`, `city`: optional, max 100 chars each

---

### POST /auth/login

Authenticate and receive JWT tokens.

**Request Body**:
```json
{
  "email": "ahmed@example.com",
  "password": "SecurePass123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "Dr. Ahmed Mohamed",
      "email": "ahmed@example.com",
      "role": "user",
      "avatarUrl": null
    }
  }
}
```

**Cookies Set**:
- `access_token` — JWT access token, 15 min expiry, httpOnly, Secure, SameSite=Strict
- `refresh_token` — JWT refresh token, 7 day expiry, httpOnly, Secure, SameSite=Strict, Path=/api/v1/auth/refresh

**Validation Rules**:
- `email`: required, valid email
- `password`: required
- Account must be verified (`emailVerified = true`)
- Account must not be disabled or deleted

---

### POST /auth/logout

Clear authentication cookies.

**Response (200)**:
```json
{
  "success": true,
  "data": null
}
```

**Cookies Cleared**:
- `access_token`
- `refresh_token`

---

### POST /auth/refresh

Refresh access token using refresh token cookie.

**Response (200)**:
```json
{
  "success": true,
  "data": null
}
```

**Cookies Set**:
- New `access_token` with extended expiry

---

### POST /auth/forgot-password

Request password reset email.

**Request Body**:
```json
{
  "email": "ahmed@example.com"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": { "message": "If the email exists, a reset link has been sent" }
}
```

---

### POST /auth/reset-password

Reset password using reset token.

**Request Body**:
```json
{
  "token": "reset-jwt-token",
  "password": "NewSecurePass123"
}
```

**Validation Rules**:
- `token`: valid, non-expired reset JWT
- `password`: min 8 chars, 1 uppercase, 1 lowercase, 1 number

---

### GET /auth/me

Get current authenticated user.

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Dr. Ahmed Mohamed",
    "email": "ahmed@example.com",
    "role": "user",
    "permissions": ["events:read", "courses:read", "registrations:create"]
  }
}
```

---

## Events

### GET /events

List published events.

**Query Parameters**:
- `page` (number, default: 1)
- `limit` (number, default: 25, max: 100)
- `search` (string, optional) — search in title, description
- `category` (string, optional) — category slug
- `status` (string, optional) — published, cancelled
- `isFree` (boolean, optional)
- `startDateFrom` (ISO date, optional)
- `startDateTo` (ISO date, optional)

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "AMG Dental Congress 2026",
      "slug": "amg-dental-congress-2026",
      "description": "Annual dental congress...",
      "startDate": "2026-06-15T09:00:00Z",
      "endDate": "2026-06-17T18:00:00Z",
      "location": "Cairo Convention Center",
      "price": 1500,
      "currency": "EGP",
      "isFree": false,
      "capacity": 500,
      "registrationDeadline": "2026-06-10T23:59:59Z",
      "category": { "id": "uuid", "name": "Congress", "slug": "congress" },
      "thumbnailUrl": "https://.../event-thumb.jpg",
      "registrationsCount": 342,
      "status": "published",
      "createdAt": "2026-05-01T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 25, "total": 150 }
}
```

---

### GET /events/:slug

Get event details.

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "AMG Dental Congress 2026",
    "slug": "amg-dental-congress-2026",
    "description": "...",
    "startDate": "2026-06-15T09:00:00Z",
    "endDate": "2026-06-17T18:00:00Z",
    "location": "Cairo Convention Center",
    "price": 1500,
    "currency": "EGP",
    "capacity": 500,
    "registrationDeadline": "2026-06-10T23:59:59Z",
    "category": { "id": "uuid", "name": "Congress", "slug": "congress" },
    "thumbnailUrl": "https://.../event-thumb.jpg",
    "registrationsCount": 342,
    "remainingSpots": 158,
    "isRegistered": false,
    "status": "published",
    "createdAt": "2026-05-01T10:00:00Z"
  }
}
```

*Note: `isRegistered` is true if the authenticated user has a registration for this event.*

---

## Registrations

### POST /registrations

Register for an event.

**Request Body**:
```json
{
  "eventId": "uuid"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "eventId": "uuid",
    "eventTitle": "AMG Dental Congress 2026",
    "status": "pending",
    "paymentStatus": "pending",
    "qrTicketStatus": "not_issued",
    "createdAt": "2026-05-27T10:00:00Z"
  }
}
```

**Validation Rules**:
- User must be authenticated.
- Event must be published.
- Event must not be past registration deadline.
- Event must not be at capacity.
- User must not already be registered (unique constraint).

---

### GET /registrations

Get my registrations.

**Query Parameters**:
- `page`, `limit`, `status`

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "event": { "id": "uuid", "title": "...", "startDate": "...", "slug": "..." },
      "status": "approved",
      "paymentStatus": "successful",
      "qrTicketStatus": "active",
      "adminNotes": null,
      "createdAt": "2026-05-27T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 25, "total": 5 }
}
```

---

## QR Tickets

### GET /qr-tickets

Get my QR tickets.

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "event": { "id": "uuid", "title": "AMG Dental Congress 2026", "startDate": "..." },
      "status": "active",
      "fallbackCode": "ABC12345",
      "issuedAt": "2026-05-27T10:00:00Z"
    }
  ]
}
```

---

### POST /qr/scan

Validate a QR token and record attendance.

**Request Body**:
```json
{
  "token": "raw-qr-token-from-scan",
  "eventId": "uuid"
}
```

**Response (200) — Valid**:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "attendeeName": "Dr. Ahmed Mohamed",
    "eventName": "AMG Dental Congress 2026",
    "registrationStatus": "approved",
    "paymentStatus": "successful",
    "checkInTime": "2026-06-15T09:15:00Z",
    "scannerName": "John Scanner"
  }
}
```

**Response (200) — Invalid**:
```json
{
  "success": true,
  "data": {
    "valid": false,
    "reason": "ALREADY_CHECKED_IN",
    "previousCheckInTime": "2026-06-15T09:10:00Z"
  }
}
```

**Rejection Reasons**:
- `NOT_FOUND` — Token does not exist
- `REVOKED` — Ticket has been revoked
- `NOT_APPROVED` — Registration not approved
- `PAYMENT_PENDING` — Payment not completed
- `WRONG_EVENT` — Ticket belongs to a different event
- `EXPIRED` — Ticket has expired
- `ALREADY_CHECKED_IN` — Ticket already used

---

## Courses

### GET /courses

List published courses.

**Query Parameters**:
- `page`, `limit`, `search`, `category`, `isFree`

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Advanced Orthodontics",
      "slug": "advanced-orthodontics",
      "description": "...",
      "instructor": { "id": "uuid", "name": "Dr. Sarah Ali" },
      "category": { "id": "uuid", "name": "Orthodontics", "slug": "orthodontics" },
      "thumbnailUrl": "https://.../course-thumb.jpg",
      "price": 800,
      "currency": "EGP",
      "isFree": false,
      "lessonCount": 12,
      "totalDuration": 360,
      "enrollmentsCount": 245,
      "status": "published",
      "createdAt": "2026-05-01T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 25, "total": 80 }
}
```

---

### GET /courses/:slug

Get course details (public view).

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Advanced Orthodontics",
    "slug": "advanced-orthodontics",
    "description": "...",
    "instructor": { "id": "uuid", "name": "Dr. Sarah Ali", "avatarUrl": "..." },
    "category": { "id": "uuid", "name": "Orthodontics", "slug": "orthodontics" },
    "thumbnailUrl": "https://.../course-thumb.jpg",
    "price": 800,
    "isFree": false,
    "lessons": [
      { "id": "uuid", "title": "Introduction", "duration": 30, "orderIndex": 1 }
    ],
    "totalDuration": 360,
    "enrollmentsCount": 245,
    "isEnrolled": false,
    "status": "published"
  }
}
```

---

### GET /courses/:slug/lessons

Get lessons for a course (requires enrollment for paid courses).

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Introduction to Orthodontics",
      "description": "...",
      "duration": 30,
      "orderIndex": 1,
      "videoId": "uuid",
      "isCompleted": false
    }
  ]
}
```

**Validation**:
- For free courses: any authenticated user.
- For paid courses: user must have ACTIVE enrollment with SUCCESSFUL/MANUALLY_VERIFIED payment.

---

## Videos

### GET /videos/:id/stream

Stream a video lesson (authorization required).

**Headers**:
- `Range` (optional) — byte range for partial content

**Response (200/206)**:
- Video file stream with `Content-Type: video/mp4`
- `Accept-Ranges: bytes` for partial content support

**Validation**:
- User must be authenticated.
- User must have valid enrollment for the course containing this video.
- For paid courses, payment must be verified.

---

## Admin Endpoints

### GET /users

List all users (admin only).

**Query Parameters**:
- `page`, `limit`, `search`, `role`, `status`

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Dr. Ahmed Mohamed",
      "email": "ahmed@example.com",
      "role": "user",
      "status": "active",
      "emailVerified": true,
      "createdAt": "2026-05-27T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 25, "total": 500 }
}
```

**Required Permission**: `users:read`

---

### GET /reports/registrations

Registration report (admin only).

**Query Parameters**:
- `eventId` (optional)
- `status` (optional)
- `startDate` (optional)
- `endDate` (optional)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "total": 500,
      "approved": 420,
      "pending": 50,
      "rejected": 30
    },
    "byEvent": [
      { "eventId": "uuid", "eventTitle": "...", "count": 200 }
    ]
  }
}
```

**Required Permission**: `reports:read`

---

### POST /exports/registrations

Export registrations to CSV.

**Request Body**:
```json
{
  "eventId": "uuid",
  "status": "approved",
  "format": "csv"
}
```

**Response (202) — Async**:
```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "status": "processing",
    "estimatedTime": "45 seconds"
  }
}
```

**Response (200) — Sync**:
```json
{
  "success": true,
  "data": {
    "downloadUrl": "/api/v1/exports/uuid/download",
    "expiresAt": "2026-05-28T10:00:00Z"
  }
}
```

**Required Permission**: `exports:create`

---

## Notification Endpoints

### GET /notifications

Get my notifications.

**Query Parameters**:
- `page`, `limit`, `read` (boolean, optional)

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "REGISTRATION_APPROVED",
      "title": "Registration Approved",
      "message": "Your registration for AMG Dental Congress 2026 has been approved.",
      "read": false,
      "entityType": "EventRegistration",
      "entityId": "uuid",
      "createdAt": "2026-05-27T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 25, "total": 15, "unreadCount": 3 }
}
```

---

### PATCH /notifications/:id/read

Mark notification as read.

**Response (200)**:
```json
{
  "success": true,
  "data": { "id": "uuid", "read": true, "readAt": "2026-05-27T10:05:00Z" }
}
```

---

## Webhook Endpoints

### POST /payments/webhook/:provider

Payment provider webhook handler.

**Path Parameters**:
- `provider` — paymob, fawry, stripe, paypal

**Headers**:
- Provider-specific signature header (e.g., `X-Paymob-Signature`)

**Request Body**: Provider-specific payload

**Response (200)**:
```json
{ "success": true, "data": { "received": true } }
```

**Validation**:
- Signature verified using provider secret.
- Idempotency: duplicate webhook payloads are ignored.

---

## TypeScript Types (Shared)

```typescript
// packages/shared/src/types/api.types.ts

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  error?: ApiError;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  emailVerified: boolean;
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
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  paymentStatus: 'not_required' | 'pending' | 'successful' | 'failed' | 'refunded' | 'manually_verified';
  qrTicketStatus: 'not_issued' | 'active' | 'used' | 'expired' | 'revoked';
  adminNotes: string | null;
  createdAt: string;
}

export interface QRTicket {
  id: string;
  event: Pick<Event, 'id' | 'title' | 'startDate'>;
  status: string;
  fallbackCode: string;
  issuedAt: string;
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
  status: string;
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
  type: string;
  title: string;
  message: string;
  read: boolean;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}
```

---

## Versioning

The API is versioned under `/api/v1`. Future breaking changes will be introduced under `/api/v2`. The V2 mobile app will consume `/api/v1` initially and can migrate to `/api/v2` when ready.
