# Implementation Plan: AMG Academy Platform V1

**Branch**: `001-amg-platform-v1` | **Date**: 2026-05-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-amg-platform-v1/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build the AMG Academy Platform V1 — a web-first academy, event registration, QR ticketing, attendance, payment tracking, and recorded course platform. The platform serves dentists, students, event attendees, AMG Academy admins, instructors, event scanner staff, and managers/viewers. V1 is a responsive web application built with Next.js (frontend) and NestJS (backend), backed by PostgreSQL. The backend API is designed for future reuse by a React Native V2 mobile app.

Primary requirement: Deliver a complete, production-ready platform that enables AMG Academy staff to manage events, courses, registrations, payments, QR tickets, attendance, announcements, reports, and content without developer support, while providing a premium, consistent user experience for attendees and students.

Technical approach: Monorepo with `apps/web` (Next.js), `apps/api` (NestJS), `packages/shared` (Zod schemas, types, utilities), and `packages/config` (shared tooling config). Prisma ORM for PostgreSQL. Docker Compose for local development. PM2 + Nginx on Hostinger VPS for production.

---

## Technical Context

**Language/Version**: TypeScript 5.4+ (strict mode)

**Primary Dependencies**:
- Frontend: Next.js 14+, React 18+, Tailwind CSS 3.4+, TanStack Query, Zod, react-hot-toast, qrcode.react, html5-qrcode
- Backend: NestJS 10+, Prisma 5+, Passport (JWT), BullMQ, Redis, json2csv
- Shared: Zod schemas, TypeScript types, utility functions

**Storage**: PostgreSQL 15+ (primary database), Redis (job queues + session cache), VPS filesystem (uploads/videos initially)

**Testing**: Jest (unit + integration), Playwright (E2E), React Testing Library (component)

**Target Platform**: Responsive web application (mobile-first user screens, desktop-first admin screens). Latest 2 versions of Chrome, Firefox, Safari, Edge.

**Project Type**: Web application (frontend + backend API + database)

**Performance Goals**:
- Initial page load under 2 seconds (after optimization)
- Standard API response under 500 ms
- QR scan validation result under 1 second
- Admin list pagination with 25 records per page default

**Constraints**:
- Single-tenant deployment on Hostinger VPS
- English-only for V1 (no RTL/Arabic)
- Manual/offline payment first; online gateway abstracted for later
- VPS video storage initially; streaming provider migration path required
- No offline functionality
- No multi-organization support

**Scale/Scope**: Single organization (AMG Academy), estimated hundreds to low-thousands of concurrent users, dozens of events per year, hundreds of courses.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| 1. Production-Ready Code Only | ✅ Pass | Monorepo enforces clean separation; no prototype code policy documented |
| 2. Strong Type Safety | ✅ Pass | TypeScript strict mode + Prisma + Zod shared schemas enforce types |
| 3. API Consistency | ✅ Pass | REST under `/api/v1`, consistent envelope, JWT auth, backend permission checks |
| 4. Testing Critical Workflows | ✅ Pass | Jest + Playwright test suites planned; P0 test coverage required |
| 5. AMG UI/UX Consistency | ✅ Pass | Tailwind config maps exact AMG color tokens; Hanken Grotesk + Inter fonts |
| 6. Reusable UI Components | ✅ Pass | Component library planned in `apps/web/components/ui/` |
| 7. Every Screen Must Handle States | ✅ Pass | TanStack Query provides loading/error/success states; empty states built per screen |
| 8. Admin Dashboard Reliability | ✅ Pass | All admin lists include search, filters, pagination, row actions, bulk actions, exports |
| 9. Security and Access Control | ✅ Pass | Backend RBAC, JWT, payment webhook verification, secure QR tokens, protected video |
| 10. Performance Requirements | ✅ Pass | Paginated lists, indexed search fields, async exports, lazy-loaded images, optimized videos |
| 11. Database and Data Integrity | ✅ Pass | Prisma migrations, foreign keys, unique constraints, indexed lookups |
| 12. Accessibility | ✅ Pass | WCAG 2.1 AA target: visible labels, focus states, keyboard nav, modal focus trap |
| 13. Maintainability and Future Mobile Readiness | ✅ Pass | API reusable by V2; payment/video/notification abstractions planned |
| 14. Definition of Done | ✅ Pass | DoD checklist enforced per PR; Ahmed Developer approval for P0 |
| 15. Release Blocking Rules | ✅ Pass | Release checklist includes all P0 workflow validation |

**Post-design re-check**: All principles still pass. No violations introduced.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-amg-platform-v1/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
amg-academy-platform/
├── apps/
│   ├── web/                 # Next.js 14+ frontend
│   │   ├── src/
│   │   │   ├── app/         # App Router routes
│   │   │   │   ├── (auth)/  # Auth group (login, register, verify, reset)
│   │   │   │   ├── (user)/  # User dashboard group
│   │   │   │   ├── admin/   # Admin dashboard routes
│   │   │   │   ├── scanner/ # Scanner-only routes
│   │   │   │   └── api/     # Next.js API routes (proxy to backend)
│   │   │   ├── components/
│   │   │   │   ├── ui/      # Reusable UI components (Button, Input, Modal, etc.)
│   │   │   │   ├── cards/   # EventCard, CourseCard, AnnouncementCard, etc.
│   │   │   │   ├── tables/  # DataTable, FilterBar, etc.
│   │   │   │   ├── forms/   # Form wrappers, validation feedback
│   │   │   │   ├── layouts/ # AdminLayout, UserLayout, AuthLayout
│   │   │   │   └── states/  # EmptyState, ErrorState, LoadingSkeleton
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── lib/
│   │   │   │   ├── api.ts   # API client (axios/fetch wrapper)
│   │   │   │   ├── auth.ts  # Auth utilities, token management
│   │   │   │   └── utils.ts # General utilities
│   │   │   ├── constants/   # App constants, routes, colors
│   │   │   └── types/       # Frontend-specific types
│   │   ├── public/
│   │   ├── tailwind.config.ts
│   │   └── next.config.js
│   │
│   └── api/                 # NestJS backend
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── users/
│       │   │   ├── roles/
│       │   │   ├── permissions/
│       │   │   ├── events/
│       │   │   ├── event-categories/
│       │   │   ├── registrations/
│       │   │   ├── payments/
│       │   │   ├── qr-tickets/
│       │   │   ├── attendance/
│       │   │   ├── courses/
│       │   │   ├── course-categories/
│       │   │   ├── lessons/
│       │   │   ├── videos/
│       │   │   ├── enrollments/
│       │   │   ├── announcements/
│       │   │   ├── notifications/
│       │   │   ├── content-pages/
│       │   │   ├── reports/
│       │   │   ├── exports/
│       │   │   └── audit-logs/
│       │   ├── common/      # Guards, interceptors, filters, pipes, decorators
│       │   ├── config/      # Configuration modules
│       │   └── main.ts
│       ├── prisma/
│       │   └── schema.prisma
│       └── test/
│
├── packages/
│   ├── shared/              # Shared Zod schemas, types, utilities
│   │   ├── src/
│   │   │   ├── schemas/     # Zod validation schemas
│   │   │   ├── types/       # Shared TypeScript types/interfaces
│   │   │   └── enums/       # Shared enums (statuses, roles, etc.)
│   │   └── package.json
│   │
│   └── config/              # Shared ESLint, TS, Tailwind configs
│       ├── eslint/
│       ├── typescript/
│       └── tailwind/
│
├── docs/                    # Deployment docs, architecture decisions
├── docker-compose.yml       # Local development stack
├── Dockerfile.api           # API production build
├── Dockerfile.web           # Web production build
└── nginx.conf               # Reverse proxy config
```

**Structure Decision**: Monorepo with `apps/web` and `apps/api` as the two primary applications. `packages/shared` houses Zod schemas and TypeScript types shared between frontend and backend, ensuring API contract consistency. This structure supports future V2 mobile app development by keeping the API completely independent of the web frontend.

---

## Complexity Tracking

> No Constitution Check violations that require justification.

---

# Detailed Implementation Plan

## 1. Architecture Overview

### Frontend Architecture

The frontend is a **Next.js 14+** application using the **App Router**. It serves both the public marketing pages and the authenticated application. The app is organized into route groups:

- `(auth)` — Login, register, email verification, password reset. No sidebar.
- `(user)` — User dashboard, events, courses, profile, reservations, QR tickets, notifications. Bottom tab navigation on mobile, top navigation on desktop.
- `admin` — Full admin dashboard. Left sidebar navigation on desktop. Mobile has hamburger menu.
- `scanner` — Standalone scanner interface for event staff. Minimal UI, camera-first.

**Why Next.js App Router**: Server-side rendering for SEO on public pages, client-side rendering for authenticated app pages, API route proxying, and built-in image optimization.

### Backend Architecture

The backend is a **NestJS 10+** modular monolith. Each domain (users, events, payments, etc.) is a self-contained NestJS module with controller, service, and repository layers. The API is stateless and JWT-authenticated.

**Why NestJS**: Modular architecture aligns with Constitution Principle 1 (single responsibility per module), built-in dependency injection, excellent TypeScript support, and proven patterns for enterprise applications.

### Database Architecture

**PostgreSQL 15+** is the single source of truth. **Prisma** is the ORM. All schema changes go through Prisma migrations (`prisma migrate dev` locally, `prisma migrate deploy` in production).

**Why Prisma over TypeORM**: Superior TypeScript type generation, reliable declarative migrations, visual Prisma Studio for debugging, and cleaner relation handling. See `research.md` for full rationale.

### Storage Architecture

- **Application files** (thumbnails, PDFs): Stored on VPS filesystem with organized directory structure (`/uploads/images/`, `/uploads/documents/`).
- **Videos**: Stored on VPS filesystem initially (`/uploads/videos/`). Served via a NestJS endpoint that validates authorization before streaming. The video provider is abstracted behind an interface (`IVideoProvider`) to allow future migration to Cloudflare Stream, Bunny Stream, Vimeo, Mux, or S3 without changing business logic.

### Email Architecture

**Resend** (or configurable SMTP fallback) delivers transactional emails. The notification system abstracts email delivery behind a `NotificationChannel` interface. In V1, channels are `InAppChannel` and `EmailChannel`. V2 will add `PushChannel` for React Native.

### Payment Architecture

Payment processing starts with a **manual/offline verification flow** (admin marks payment as verified). The payment provider is abstracted behind an `IPaymentProvider` interface. Future online gateways (Paymob, Fawry, Stripe, PayPal) implement this interface without changing business logic. Webhook verification is implemented per gateway.

### Deployment Architecture

- **Local development**: Docker Compose spins up Next.js, NestJS, PostgreSQL, Redis, and Nginx.
- **Staging**: Docker Compose on a Hostinger VPS (or subdomain).
- **Production**: PM2 manages Node.js processes on Hostinger VPS. Nginx reverse-proxies to Next.js (port 3000) and NestJS (port 4000). PostgreSQL and Redis run on the same VPS or a managed database if available.

### Why Web-First V1 Before Mobile V2

Building V1 as a responsive web app validates the entire backend API, admin workflows, QR system, course module, and payment flow before committing to native mobile development. The web app:
- Serves all user personas immediately (no app store approval delays)
- Allows rapid iteration on UI/UX
- Validates API stability for the future React Native app
- Enables admin staff to operate without downloading an app
- Provides a QR scanner that works in the browser (using `html5-qrcode`)

The backend API is designed to be **completely reusable** by the V2 React Native app. No frontend-specific logic lives in the backend. All business rules, validations, and state transitions are enforced in NestJS services.

---

## 2. Repository and Project Structure

See the Project Structure section above for the full tree.

### Key Directory Rules

- `apps/web/src/app/` — Next.js App Router. Route groups organize pages by persona.
- `apps/web/src/components/ui/` — Reusable UI component library (Button, Input, Modal, Toast, Card, Badge, StatusBadge, DataTable, etc.).
- `apps/web/src/lib/api.ts` — Centralized API client with interceptors for auth tokens, error handling, and loading states.
- `apps/api/src/modules/` — One NestJS module per domain. Each module contains:
  - `*.controller.ts` — HTTP route handlers
  - `*.service.ts` — Business logic
  - `*.repository.ts` — Database queries (or uses Prisma directly in service for simple cases)
  - `*.module.ts` — NestJS module declaration
  - `dto/` — Data Transfer Objects (validated with Zod or class-validator)
- `packages/shared/src/schemas/` — Zod schemas for form validation, API request validation, and shared type inference.
- `packages/shared/src/enums/` — Shared enums (UserStatus, RegistrationStatus, PaymentStatus, QRTicketStatus, etc.) used by both frontend and backend.

---

## 3. Frontend Plan

### Route Structure

**Public routes** (no auth required):
- `/` — Landing page
- `/login` — Sign in
- `/register` — Create account
- `/verify-email` — Email verification (token-based)
- `/forgot-password` — Request password reset
- `/reset-password` — Set new password (token-based)
- `/events` — Public event listing (browse without registration)
- `/events/[slug]` — Public event details
- `/courses` — Public course catalog
- `/courses/[slug]` — Public course details
- `/content/[slug]` — Static content pages (privacy, terms, FAQ, support)

**User routes** (auth required, `(user)` group):
- `/dashboard` — User dashboard (announcements, upcoming events, recommended courses, quick links)
- `/events` — Event listing with registration CTA
- `/events/[slug]` — Event details with registration button
- `/my-reservations` — My event registrations with status
- `/my-qr-tickets` — My QR tickets
- `/courses` — Course catalog with enrollment CTA
- `/courses/[slug]` — Course details with enrollment button
- `/my-courses` — My enrolled courses
- `/my-courses/[courseSlug]/[lessonSlug]` — Lesson video player
- `/notifications` — Notification inbox
- `/profile` — Edit profile
- `/settings` — Notification preferences, password change

**Admin routes** (auth + admin permission required, `admin` group):
- `/admin/dashboard` — Overview stats
- `/admin/users` — User management
- `/admin/roles` — Role and permission management
- `/admin/events` — Event management
- `/admin/event-categories` — Event categories
- `/admin/registrations` — Registration management
- `/admin/payments` — Payment management
- `/admin/qr-scanner` — QR scanner interface
- `/admin/attendance` — Attendance logs
- `/admin/announcements` — Announcement management
- `/admin/courses` — Course management
- `/admin/lessons` — Lesson management
- `/admin/content-pages` — Content page management
- `/admin/reports` — Reports dashboard
- `/admin/exports` — Export center
- `/admin/audit-logs` — Audit log viewer

**Scanner routes** (auth + scanner role required, `scanner` group):
- `/scanner` — Select event
- `/scanner/scan` — QR scanning interface

### Protected Route Handling

- Use Next.js middleware (`middleware.ts`) to check JWT token presence and validity for protected routes.
- Token stored in `httpOnly` cookie (secure, same-site).
- Middleware redirects unauthenticated users to `/login` with a `redirect` query parameter.
- Admin routes check role via an API call or decoded JWT payload before rendering.

### Role-Based Navigation

- User layout: Bottom tab bar on mobile (Dashboard, Events, Courses, Notifications, Profile). Top nav on desktop.
- Admin layout: Left sidebar with collapsible menu. Menu items filtered by user's permissions.
- Scanner layout: Minimal header with event selector. Only Scanner and Attendance links visible.

### API Client Structure

```typescript
// apps/web/src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api/v1',
  withCredentials: true,
});

// Request interceptor: attach JWT from cookie
api.interceptors.request.use((config) => {
  // Cookie is automatically sent via withCredentials
  return config;
});

// Response interceptor: handle 401, 403, show toast errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    // Show toast with error message
    return Promise.reject(error);
  }
);
```

### Form Validation

- Use Zod schemas from `packages/shared` for both frontend and backend validation.
- React Hook Form + Zod resolver for form handling.
- Inline validation on blur/submit. Required fields marked with `*`.

### State Management

- **Server state**: TanStack Query (react-query) for all API data. Handles caching, refetching, pagination, and mutations.
- **Client state**: React Context for global UI state (sidebar open/close, theme, auth user). No Redux needed.
- **Form state**: React Hook Form.

### Loading, Empty, Error, Success States

Every screen component wraps data fetching in a consistent pattern:

```tsx
// Pattern for every page
if (isLoading) return <LoadingSkeleton />;
if (isError) return <ErrorState error={error} onRetry={refetch} />;
if (!data || data.length === 0) return <EmptyState message="No events found" />;
return <SuccessContent data={data} />;
```

### Responsive Layout Rules

- **Mobile-first** for user screens: Base styles target mobile (`< 768px`). Breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`.
- **Desktop-first** for admin screens: Admin dashboard optimized for `≥ 1024px`. Mobile has hamburger menu and reduced columns.
- Bottom tab bar visible only on user mobile routes. Hidden on desktop and admin routes.
- Admin sidebar: Fixed on desktop (`w-64`), collapsible on tablet (`w-16` icon-only), hamburger menu on mobile.

### AMG Design System with Tailwind

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FFFFFF',
          action: '#2563EB',
          secondary: '#C7CBD1',
        },
        background: {
          main: '#05070A',
          surface: '#10141B',
          elevated: '#1A202A',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#A8B0BD',
          muted: '#6B7280',
        },
        border: '#2A303A',
        highlight: '#D9DEE7',
        success: '#22C55E',
        error: '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: {
        heading: ['Hanken Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
};
```

- All backgrounds use `bg-background-main` or `bg-background-surface`.
- Text uses `text-text-primary` for headings, `text-text-secondary` for descriptions.
- Action buttons use `bg-brand-action` sparingly.
- Status badges use the semantic colors (success, error, warning).

---

## 4. Backend Plan

### Module Structure

Each domain module follows the NestJS standard:

```
modules/{domain}/
├── {domain}.controller.ts    # REST endpoints
├── {domain}.service.ts       # Business logic
├── {domain}.repository.ts    # Database access (optional wrapper)
├── {domain}.module.ts        # NestJS module
├── dto/
│   ├── create-{domain}.dto.ts
│   ├── update-{domain}.dto.ts
│   └── {domain}-query.dto.ts
├── entities/
│   └── {domain}.entity.ts    # Prisma model reference or class
└── guards/
    └── {domain}-permission.guard.ts
```

### Controller/Service/Repository Pattern

- **Controller**: Handles HTTP requests, delegates to service, returns standardized API responses.
- **Service**: Contains all business logic. Validates rules, orchestrates multiple repositories, triggers notifications and audit logs.
- **Repository**: Thin wrapper around Prisma client queries. For simple modules, the service can call Prisma directly.

### DTO Validation

- Use Zod schemas from `packages/shared` for runtime validation.
- NestJS `ZodValidationPipe` validates request bodies against Zod schemas.
- All DTOs are TypeScript interfaces inferred from Zod schemas.

### Authentication Strategy

- **JWT Access Token**: Short-lived (15 minutes), stored in `httpOnly` cookie.
- **JWT Refresh Token**: Long-lived (7 days), stored in `httpOnly` cookie with `path=/api/v1/auth/refresh`.
- **Password hashing**: bcrypt with salt rounds 12.
- **Passport JWT strategy**: Extracts and validates JWT from cookie on every protected request.

### Role-Based Access Control

- Roles stored in database: `super_admin`, `amg_admin`, `scanner`, `instructor`, `user`.
- Permissions are configurable per role and stored in `RolePermission` table.
- `@RequirePermission()` decorator on controller methods specifies required permission (e.g., `events:create`, `users:read`).
- `PermissionGuard` checks if the authenticated user's role has the required permission.

### Audit Logging

- `AuditLogInterceptor` or decorator-based approach: `@AuditLog(action, entityType)` on controller methods.
- Before/after service calls, the interceptor captures old value, new value, actor ID, and entity ID.
- Audit logs are written asynchronously (fire-and-forget) to avoid blocking the request.

### Error Handling Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [
      { "field": "email", "message": "Email is required" }
    ]
  }
}
```

### API Response Format

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

### Rate Limiting

- `@nestjs/throttler` applied globally.
- Auth endpoints: 5 requests per minute per IP.
- QR validation endpoint: 30 requests per minute per IP.
- General API: 100 requests per minute per authenticated user.

### File Upload Handling

- Use `@nestjs/platform-express` with `multer` for multipart uploads.
- Images: Max 5MB, accept `image/jpeg`, `image/png`, `image/webp`.
- Videos: Max 500MB, accept `video/mp4`, `video/webm`.
- Files stored in `/uploads/` with organized subdirectories and UUID filenames.
- File type validation and virus scanning (if available) before saving.

### Payment Provider Abstraction

```typescript
interface IPaymentProvider {
  name: string;
  createPayment(amount: number, currency: string, reference: string): Promise<PaymentIntent>;
  verifyWebhook(payload: unknown, signature: string): Promise<boolean>;
  getPaymentStatus(providerReference: string): Promise<PaymentStatus>;
}

class ManualPaymentProvider implements IPaymentProvider { ... }
class PaymobProvider implements IPaymentProvider { ... }
class StripeProvider implements IPaymentProvider { ... }
```

### Video Provider Abstraction

```typescript
interface IVideoProvider {
  upload(file: Buffer, filename: string): Promise<VideoMetadata>;
  getSignedUrl(videoId: string, expirySeconds: number): Promise<string>;
  delete(videoId: string): Promise<void>;
}

class VPSVideoProvider implements IVideoProvider { ... }
// Future: CloudflareStreamProvider, BunnyStreamProvider, etc.
```

### Email/Notification Service

```typescript
interface NotificationChannel {
  send(notification: NotificationPayload): Promise<void>;
}

class InAppChannel implements NotificationChannel { ... }
class EmailChannel implements NotificationChannel { ... }
// Future: PushChannel implements NotificationChannel { ... }
```

### Export Service

- Synchronous export for small datasets (< 10,000 records, < 30 seconds).
- Asynchronous export via BullMQ for large datasets: enqueue export job, process in background, notify admin via in-app notification when ready.

### Background Job Strategy

- **BullMQ** with Redis for job queues.
- Queues:
  - `export-queue` — Large CSV exports
  - `notification-queue` — Bulk email notifications
  - `webhook-retry-queue` — Payment webhook retries
  - `reminder-queue` — Event reminder notifications

---

## 5. Database Plan

### ORM: Prisma

All entities defined in `apps/api/prisma/schema.prisma`.

### Schema Overview

```prisma
// enums
enum UserStatus { ACTIVE DISABLED DELETED }
enum RegistrationStatus { PENDING APPROVED REJECTED CANCELLED }
enum PaymentStatus { NOT_REQUIRED PENDING SUCCESSFUL FAILED REFUNDED MANUALLY_VERIFIED }
enum QRTicketStatus { NOT_ISSUED ACTIVE USED EXPIRED REVOKED }
enum AttendanceStatus { VALIDATED REJECTED }
enum CourseStatus { DRAFT PUBLISHED ARCHIVED }
enum EnrollmentStatus { ACTIVE COMPLETED CANCELLED }
enum AnnouncementStatus { DRAFT PUBLISHED ARCHIVED }
enum NotificationType { REGISTRATION_SUBMITTED REGISTRATION_APPROVED REGISTRATION_REJECTED PAYMENT_SUCCESSFUL PAYMENT_FAILED QR_ISSUED EVENT_REMINDER EVENT_CANCELLED NEW_ANNOUNCEMENT NEW_COURSE }
enum NotificationChannelType { IN_APP EMAIL PUSH }
enum AuditAction { CREATE UPDATE DELETE APPROVE REJECT VERIFY SCAN PUBLISH ARCHIVE }

model User {
  id          String   @id @default(uuid())
  email       String   @unique
  password    String
  name        String
  phone       String?
  specialty   String?
  clinic      String?
  city        String?
  avatarUrl   String?
  emailVerified Boolean @default(false)
  emailVerifiedAt DateTime?
  status      UserStatus @default(ACTIVE)
  roleId      String
  role        Role     @relation(fields: [roleId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  registrations EventRegistration[]
  enrollments   CourseEnrollment[]
  notifications Notification[]
  auditLogs     AuditLog[]
  qrTickets     QRTicket[]
  attendanceChecks AttendanceCheckIn[]

  @@index([email])
  @@index([roleId])
  @@index([status])
}

model Role {
  id          String   @id @default(uuid())
  name        String   @unique
  slug        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  users       User[]
  permissions RolePermission[]
}

model Permission {
  id          String   @id @default(uuid())
  module      String
  action      String
  description String?
  createdAt   DateTime @default(now())

  roles       RolePermission[]

  @@unique([module, action])
}

model RolePermission {
  id           String     @id @default(uuid())
  roleId       String
  permissionId String
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@unique([roleId, permissionId])
  @@index([roleId])
  @@index([permissionId])
}

model Event {
  id                String   @id @default(uuid())
  title             String
  slug              String   @unique
  description       String   @db.Text
  startDate         DateTime
  endDate           DateTime
  location          String
  price             Decimal  @default(0)
  capacity          Int
  registrationDeadline DateTime?
  status            String   @default("draft") // draft, published, cancelled
  categoryId        String
  category          EventCategory @relation(fields: [categoryId], references: [id])
  thumbnailUrl      String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  registrations     EventRegistration[]
  qrTickets         QRTicket[]
  attendance        AttendanceCheckIn[]

  @@index([status])
  @@index([categoryId])
  @@index([startDate])
  @@index([slug])
}

model EventCategory {
  id          String   @id @default(uuid())
  name        String   @unique
  slug        String   @unique
  description String?
  createdAt   DateTime @default(now())

  events      Event[]
}

model EventRegistration {
  id          String   @id @default(uuid())
  userId      String
  eventId     String
  user        User     @relation(fields: [userId], references: [id])
  event       Event    @relation(fields: [eventId], references: [id])
  status      RegistrationStatus @default(PENDING)
  adminNotes  String?  @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  payment     Payment?
  qrTicket    QRTicket?

  @@unique([userId, eventId])
  @@index([userId])
  @@index([eventId])
  @@index([status])
}

model Payment {
  id             String   @id @default(uuid())
  registrationId String?  @unique
  enrollmentId   String?  @unique
  registration   EventRegistration? @relation(fields: [registrationId], references: [id])
  enrollment     CourseEnrollment?  @relation(fields: [enrollmentId], references: [id])
  amount         Decimal
  currency       String   @default("EGP")
  status         PaymentStatus @default(PENDING)
  provider       String   @default("manual") // manual, paymob, fawry, stripe, paypal
  providerRef    String?
  receiptRef     String?
  verifiedById   String?
  verifiedAt     DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([status])
  @@index([provider])
  @@index([providerRef])
}

model QRTicket {
  id             String   @id @default(uuid())
  registrationId String   @unique
  registration   EventRegistration @relation(fields: [registrationId], references: [id])
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  eventId        String
  event          Event    @relation(fields: [eventId], references: [id])
  tokenHash      String   @unique
  status         QRTicketStatus @default(NOT_ISSUED)
  issuedAt       DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  attendance     AttendanceCheckIn[]

  @@index([tokenHash])
  @@index([eventId])
  @@index([status])
}

model AttendanceCheckIn {
  id          String   @id @default(uuid())
  qrTicketId  String
  qrTicket    QRTicket @relation(fields: [qrTicketId], references: [id])
  eventId     String
  event       Event    @relation(fields: [eventId], references: [id])
  scannerId   String
  scanner     User     @relation(fields: [scannerId], references: [id])
  status      AttendanceStatus
  scanTime    DateTime @default(now())
  notes       String?

  @@index([eventId])
  @@index([scannerId])
  @@index([scanTime])
}

model Course {
  id          String   @id @default(uuid())
  title       String
  slug        String   @unique
  description String   @db.Text
  instructorId String
  instructor  User     @relation(fields: [instructorId], references: [id])
  categoryId  String
  category    CourseCategory @relation(fields: [categoryId], references: [id])
  thumbnailUrl String?
  price       Decimal  @default(0)
  isFree      Boolean  @default(true)
  status      CourseStatus @default(DRAFT)
  totalDuration Int     @default(0) // minutes
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  lessons     Lesson[]
  enrollments CourseEnrollment[]

  @@index([status])
  @@index([categoryId])
  @@index([instructorId])
  @@index([slug])
}

model CourseCategory {
  id          String   @id @default(uuid())
  name        String   @unique
  slug        String   @unique
  description String?
  createdAt   DateTime @default(now())

  courses     Course[]
}

model Lesson {
  id          String   @id @default(uuid())
  title       String
  description String?  @db.Text
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  orderIndex  Int
  duration    Int      @default(0) // minutes
  videoId     String?
  video       Video?   @relation(fields: [videoId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  progress    LessonProgress[]

  @@index([courseId])
  @@index([orderIndex])
}

model Video {
  id          String   @id @default(uuid())
  provider    String   @default("vps") // vps, cloudflare, bunny, vimeo, mux, s3
  providerVideoId String?
  originalName String
  filePath    String?
  duration    Int      @default(0)
  sizeBytes   Int      @default(0)
  mimeType    String?
  createdAt   DateTime @default(now())

  lessons     Lesson[]
}

model CourseEnrollment {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id])
  status      EnrollmentStatus @default(ACTIVE)
  enrolledAt  DateTime @default(now())
  completedAt DateTime?

  payment     Payment?
  progress    LessonProgress[]

  @@unique([userId, courseId])
  @@index([userId])
  @@index([courseId])
  @@index([status])
}

model LessonProgress {
  id          String   @id @default(uuid())
  enrollmentId String
  enrollment  CourseEnrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  lessonId    String
  lesson      Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  isCompleted Boolean  @default(false)
  completedAt DateTime?

  @@unique([enrollmentId, lessonId])
  @@index([enrollmentId])
  @@index([lessonId])
}

model Announcement {
  id          String   @id @default(uuid())
  title       String
  body        String   @db.Text
  targetRoles String[] // array of role slugs, empty = all
  status      AnnouncementStatus @default(DRAFT)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([status])
  @@index([publishedAt])
}

model Notification {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  type        NotificationType
  title       String
  message     String   @db.Text
  read        Boolean  @default(false)
  readAt      DateTime?
  entityType  String?  // event, course, registration, etc.
  entityId    String?
  channels    NotificationChannelType[]
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([read])
  @@index([createdAt])
}

model StaticContentPage {
  id          String   @id @default(uuid())
  title       String
  slug        String   @unique
  body        String   @db.Text
  status      String   @default("draft") // draft, published
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([slug])
  @@index([status])
}

model AuditLog {
  id          String   @id @default(uuid())
  actorId     String
  actor       User     @relation(fields: [actorId], references: [id])
  action      AuditAction
  entityType  String
  entityId    String
  oldValue    String?  @db.Text
  newValue    String?  @db.Text
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@index([actorId])
  @@index([entityType, entityId])
  @@index([createdAt])
  @@index([action])
}
```

### Important Constraints

- `User.email` — UNIQUE
- `EventRegistration` — UNIQUE on `(userId, eventId)` (prevents duplicate registrations)
- `QRTicket.tokenHash` — UNIQUE and INDEXED (fast scan lookup)
- `Payment.providerRef` — INDEXED (reconciliation and webhook lookup)
- `EventRegistration.status` — INDEXED (admin filtering)
- `Payment.status` — INDEXED (admin filtering)
- `AttendanceCheckIn` — INDEXED on `eventId`, `scannerId`, `scanTime`
- `CourseEnrollment` — UNIQUE on `(userId, courseId)` (prevents duplicate enrollments)
- All foreign keys use `ON DELETE` rules appropriate to the relationship (CASCADE for child records, RESTRICT for parent records where orphan prevention is needed).

---

## 6. API Plan

All endpoints are prefixed with `/api/v1`.

### Auth Endpoints

| Method | Route | Purpose | Auth | Validation |
|---|---|---|---|---|
| POST | `/auth/register` | Create account | Public | Email unique, password min 8 chars |
| POST | `/auth/login` | Sign in | Public | Email verified required |
| POST | `/auth/logout` | Sign out | Authenticated | — |
| POST | `/auth/refresh` | Refresh access token | Public (refresh cookie) | Valid refresh token |
| POST | `/auth/forgot-password` | Request reset | Public | Email exists |
| POST | `/auth/reset-password` | Set new password | Public (token) | Token valid, password min 8 |
| POST | `/auth/verify-email` | Verify email | Public (token) | Token valid |
| GET | `/auth/me` | Get current user | Authenticated | — |

### User Endpoints

| Method | Route | Purpose | Role | Notes |
|---|---|---|---|---|
| GET | `/users` | List users | `users:read` | Paginated, searchable |
| GET | `/users/:id` | Get user | `users:read` | — |
| PATCH | `/users/:id` | Update user | `users:update` | Self or admin |
| DELETE | `/users/:id` | Disable user | `users:delete` | Soft delete |
| GET | `/users/me` | Get profile | Authenticated | Current user |
| PATCH | `/users/me` | Update profile | Authenticated | Self only |

### Role & Permission Endpoints

| Method | Route | Purpose | Role |
|---|---|---|---|
| GET | `/roles` | List roles | `roles:read` |
| GET | `/roles/:id` | Get role | `roles:read` |
| POST | `/roles` | Create role | `roles:create` |
| PATCH | `/roles/:id` | Update role | `roles:update` |
| DELETE | `/roles/:id` | Delete role | `roles:delete` |
| GET | `/permissions` | List permissions | `roles:read` |
| POST | `/roles/:id/permissions` | Assign permission | `roles:update` |
| DELETE | `/roles/:id/permissions/:pid` | Remove permission | `roles:update` |

### Event Endpoints

| Method | Route | Purpose | Role | Notes |
|---|---|---|---|---|
| GET | `/events` | List published events | Public | Searchable, filterable |
| GET | `/events/:slug` | Get event details | Public | — |
| GET | `/events/admin` | List all events | `events:read` | Admin view |
| POST | `/events` | Create event | `events:create` | — |
| PATCH | `/events/:id` | Update event | `events:update` | — |
| DELETE | `/events/:id` | Cancel/delete event | `events:delete` | Soft delete |
| POST | `/events/:id/publish` | Publish event | `events:update` | — |

### Event Category Endpoints

| Method | Route | Purpose | Role |
|---|---|---|---|
| GET | `/event-categories` | List categories | Public |
| POST | `/event-categories` | Create category | `events:create` |
| PATCH | `/event-categories/:id` | Update category | `events:update` |
| DELETE | `/event-categories/:id` | Delete category | `events:delete` |

### Registration Endpoints

| Method | Route | Purpose | Role | Notes |
|---|---|---|---|---|
| GET | `/registrations` | My registrations | Authenticated | Current user only |
| POST | `/registrations` | Register for event | Authenticated | Duplicate prevention |
| GET | `/registrations/admin` | List all registrations | `registrations:read` | Admin view |
| PATCH | `/registrations/:id/approve` | Approve | `registrations:update` | Triggers QR generation |
| PATCH | `/registrations/:id/reject` | Reject | `registrations:update` | Requires reason |
| PATCH | `/registrations/:id/cancel` | Cancel | Authenticated | Self or admin |

### Payment Endpoints

| Method | Route | Purpose | Role |
|---|---|---|---|
| GET | `/payments` | My payments | Authenticated |
| GET | `/payments/admin` | List all payments | `payments:read` |
| GET | `/payments/:id` | Get payment | `payments:read` |
| POST | `/payments/:id/verify-manual` | Manual verify | `payments:update` | Audit logged |
| POST | `/payments/webhook/:provider` | Webhook | Public | Signature verified |

### QR Ticket Endpoints

| Method | Route | Purpose | Role | Notes |
|---|---|---|---|---|
| GET | `/qr-tickets` | My QR tickets | Authenticated | Current user only |
| GET | `/qr-tickets/:id` | Get QR ticket | Authenticated | — |
| POST | `/qr-tickets/:id/regenerate` | Regenerate | `qr-tickets:update` | Admin only |
| POST | `/qr-tickets/:id/revoke` | Revoke | `qr-tickets:update` | Admin only |

### QR Scanning Endpoints

| Method | Route | Purpose | Role | Notes |
|---|---|---|---|---|
| POST | `/qr/scan` | Scan QR token | `scanner:use` | Validates all rules |
| GET | `/qr/validate/:token` | Validate token | `scanner:use` | Pre-check without recording |

### Attendance Endpoints

| Method | Route | Purpose | Role |
|---|---|---|---|
| GET | `/attendance` | My attendance | Authenticated |
| GET | `/attendance/admin` | List all | `attendance:read` |
| GET | `/attendance/event/:eventId` | By event | `attendance:read` |

### Course Endpoints

| Method | Route | Purpose | Role | Notes |
|---|---|---|---|---|
| GET | `/courses` | List published courses | Public | Searchable, filterable |
| GET | `/courses/:slug` | Get course details | Public | — |
| GET | `/courses/admin` | List all courses | `courses:read` | Admin view |
| POST | `/courses` | Create course | `courses:create` | — |
| PATCH | `/courses/:id` | Update course | `courses:update` | Self (instructor) or admin |
| DELETE | `/courses/:id` | Archive course | `courses:delete` | Soft delete |

### Course Category Endpoints

| Method | Route | Purpose | Role |
|---|---|---|---|
| GET | `/course-categories` | List categories | Public |
| POST | `/course-categories` | Create category | `courses:create` |
| PATCH | `/course-categories/:id` | Update category | `courses:update` |
| DELETE | `/course-categories/:id` | Delete category | `courses:delete` |

### Lesson Endpoints

| Method | Route | Purpose | Role |
|---|---|---|---|
| GET | `/courses/:courseId/lessons` | List lessons | Public (published) / Authenticated (enrolled) |
| GET | `/lessons/:id` | Get lesson | Authenticated (enrolled) |
| POST | `/lessons` | Create lesson | `courses:create` |
| PATCH | `/lessons/:id` | Update lesson | `courses:update` |
| DELETE | `/lessons/:id` | Delete lesson | `courses:delete` |

### Video Endpoints

| Method | Route | Purpose | Role | Notes |
|---|---|---|---|---|
| GET | `/videos/:id/stream` | Stream video | Authenticated | Validates enrollment + payment |
| POST | `/videos/upload` | Upload video | `courses:create` | Max 500MB |
| DELETE | `/videos/:id` | Delete video | `courses:delete` | — |

### Enrollment Endpoints

| Method | Route | Purpose | Role | Notes |
|---|---|---|---|---|
| GET | `/enrollments` | My enrollments | Authenticated | — |
| POST | `/enrollments` | Enroll in course | Authenticated | Duplicate prevention |
| GET | `/enrollments/admin` | List all | `enrollments:read` | Admin view |
| PATCH | `/enrollments/:id/progress` | Update progress | Authenticated | Self only |

### Announcement Endpoints

| Method | Route | Purpose | Role |
|---|---|---|---|
| GET | `/announcements` | List published | Public |
| GET | `/announcements/admin` | List all | `announcements:read` |
| POST | `/announcements` | Create | `announcements:create` |
| PATCH | `/announcements/:id` | Update | `announcements:update` |
| DELETE | `/announcements/:id` | Archive | `announcements:delete` |
| POST | `/announcements/:id/publish` | Publish | `announcements:update` |

### Notification Endpoints

| Method | Route | Purpose | Role |
|---|---|---|---|
| GET | `/notifications` | My notifications | Authenticated |
| PATCH | `/notifications/:id/read` | Mark as read | Authenticated |
| PATCH | `/notifications/read-all` | Mark all read | Authenticated |
| GET | `/notifications/preferences` | Get preferences | Authenticated |
| PATCH | `/notifications/preferences` | Update preferences | Authenticated |

### Content Page Endpoints

| Method | Route | Purpose | Role |
|---|---|---|---|
| GET | `/content-pages` | List published | Public |
| GET | `/content-pages/:slug` | Get by slug | Public |
| GET | `/content-pages/admin` | List all | `content-pages:read` |
| POST | `/content-pages` | Create | `content-pages:create` |
| PATCH | `/content-pages/:id` | Update | `content-pages:update` |
| DELETE | `/content-pages/:id` | Delete | `content-pages:delete` |

### Report Endpoints

| Method | Route | Purpose | Role |
|---|---|---|---|
| GET | `/reports/users` | User report | `reports:read` |
| GET | `/reports/registrations` | Registration report | `reports:read` |
| GET | `/reports/attendance` | Attendance report | `reports:read` |
| GET | `/reports/revenue` | Revenue report | `reports:read` |
| GET | `/reports/payments` | Payment report | `reports:read` |
| GET | `/reports/courses` | Course report | `reports:read` |
| GET | `/reports/qr-scans` | QR scan report | `reports:read` |

### Export Endpoints

| Method | Route | Purpose | Role | Notes |
|---|---|---|---|---|
| POST | `/exports/users` | Export users | `exports:create` | Async if > 30s |
| POST | `/exports/registrations` | Export registrations | `exports:create` | Async if > 30s |
| POST | `/exports/attendance` | Export attendance | `exports:create` | Async if > 30s |
| POST | `/exports/payments` | Export payments | `exports:create` | Async if > 30s |
| POST | `/exports/enrollments` | Export enrollments | `exports:create` | Async if > 30s |
| GET | `/exports/:id/download` | Download export | `exports:read` | — |

### Audit Log Endpoints

| Method | Route | Purpose | Role |
|---|---|---|---|
| GET | `/audit-logs` | List logs | `audit-logs:read` |
| GET | `/audit-logs/:id` | Get log | `audit-logs:read` |

---

## 7. Authentication and Authorization Plan

### Registration Flow

1. User submits registration form (name, email, password).
2. Backend validates email uniqueness, password strength (min 8 chars, 1 uppercase, 1 number).
3. Password hashed with bcrypt (12 rounds).
4. User created with `status = ACTIVE`, `role = user`, `emailVerified = false`.
5. Verification token (JWT with short expiry) generated and emailed.
6. User clicks verification link → token validated → `emailVerified = true`.

### Login Flow

1. User submits email + password.
2. Backend finds user by email, compares password with bcrypt.
3. If valid and `emailVerified = true`:
   - Generate access token (15 min expiry).
   - Generate refresh token (7 day expiry).
   - Set both as `httpOnly`, `Secure`, `SameSite=Strict` cookies.
4. Return user profile.

### Logout Flow

1. Clear access and refresh cookies.
2. Optionally blacklist refresh token in Redis (for immediate revocation).

### Session/JWT Strategy

- Access token: 15 minutes, stored in `httpOnly` cookie.
- Refresh token: 7 days, stored in `httpOnly` cookie with restricted path.
- Token payload: `{ sub: userId, email, roleId, iat, exp }`.
- Frontend: No localStorage tokens. All API calls use `withCredentials: true`.
- Backend: Passport JWT strategy extracts token from cookie.

### Password Reset

1. User requests reset → backend generates reset token (JWT, 1 hour expiry).
2. Token emailed as a link (`/reset-password?token=xxx`).
3. User submits new password → token validated → password hashed and updated.

### Protected Routes

- Next.js middleware (`middleware.ts`) checks for access token cookie.
- If missing/invalid: redirect to `/login`.
- Admin routes: middleware checks role from JWT payload or makes a lightweight API call.
- Backend: Every protected endpoint uses `@UseGuards(JwtAuthGuard)`.
- Admin endpoints: additionally use `@UseGuards(PermissionGuard)` with `@RequirePermission()` decorator.

### Role Access Matrix

| Module | Super Admin | AMG Admin | Scanner | Instructor | User |
|---|---|---|---|---|---|
| Users | CRUD | Read/Update | — | — | Read self |
| Roles | CRUD | Read | — | — | — |
| Events | CRUD | CRUD | — | — | Read |
| Registrations | CRUD | CRUD | — | — | Read self |
| Payments | CRUD | CRUD/Verify | — | — | Read self |
| QR Tickets | CRUD | CRUD | Read/Scan | — | Read self |
| Attendance | CRUD | Read | Read/Create | — | Read self |
| Courses | CRUD | CRUD | — | CRUD own | Read |
| Lessons | CRUD | CRUD | — | CRUD own | Read enrolled |
| Videos | CRUD | CRUD | — | CRUD own | Stream enrolled |
| Enrollments | CRUD | CRUD | — | — | Read self/Create |
| Announcements | CRUD | CRUD | — | — | Read |
| Reports | CRUD | Read | — | — | — |
| Exports | CRUD | Create | — | — | — |
| Content Pages | CRUD | CRUD | — | — | Read |
| Audit Logs | CRUD | Read | — | — | — |

*CRUD = Create, Read, Update, Delete. "own" = resources assigned to the instructor.*

---

## 8. Event and Registration Plan

### Event Creation/Editing

- Admins create events with all required fields: title, slug, description, start/end date/time, location, price, capacity, category, registration deadline.
- Slug auto-generated from title (URL-friendly) but editable.
- Events saved as `draft` by default. Admin must explicitly `publish`.
- Published events are visible on the public events page.

### Event Categories

- Predefined categories: Congress, Workshop, Webinar, Booth, Academy Event, Offline Course.
- Admins can add/edit/delete categories.
- Categories have name, slug, and optional description.

### Event Publishing/Unpublishing

- `draft` → `published`: Event becomes visible to users.
- `published` → `draft`: Event hidden from public listing. Existing registrations remain.
- `published` → `cancelled`: Event marked cancelled. All registered users notified.

### Event Capacity

- `capacity` field limits registrations.
- When capacity is reached, registration endpoint returns `409 Conflict` with "Event is full" message.
- Optional future: waiting list support (out of scope for V1).

### Registration Deadline

- `registrationDeadline` optional field.
- If set, registrations after the deadline are blocked with `410 Gone` or `409 Conflict`.

### Free Event Registration

1. User clicks "Register" on event details.
2. Backend creates `EventRegistration` with `status = PENDING` (if admin approval required) or `status = APPROVED` (if auto-approve setting enabled).
3. If `status = APPROVED` and no payment required, QR ticket is generated immediately.
4. User sees registration in "My Reservations".

### Paid Event Registration

1. User clicks "Register" on paid event.
2. Backend creates `EventRegistration` with `status = PENDING`.
3. Backend creates `Payment` with `status = PENDING`.
4. User sees registration and payment status in "My Reservations".
5. Admin verifies payment (manual or webhook) → `Payment.status = SUCCESSFUL`.
6. Admin approves registration → `EventRegistration.status = APPROVED`.
7. Once both payment is successful AND registration is approved, QR ticket is generated.

### Admin Approval/Rejection

- Admin views registration list with filters by status, event, date.
- Approve: `status = APPROVED`, admin notes optional.
- Reject: `status = REJECTED`, admin must provide rejection reason.
- Approval/rejection triggers notification to user and audit log entry.

### Duplicate Registration Prevention

- Database UNIQUE constraint on `(userId, eventId)`.
- Application-level check before insert.
- If duplicate attempted, return `409 Conflict` with clear message.

### My Reservations Screen

- User sees all their registrations with: event name, date, status badge, payment status, QR ticket status (if applicable).
- Clicking a registration shows full details.
- QR ticket displayed as a card with QR code and fallback text code.

---

## 9. Payment Plan

### Payment Abstraction Layer

```typescript
// IPaymentProvider interface (see Backend Plan section)
// ManualPaymentProvider — initial implementation
// Future: PaymobProvider, FawryProvider, StripeProvider, PayPalProvider
```

### Payment Status Lifecycle

```
NOT_REQUIRED → (no payment needed for free events)
PENDING → SUCCESSFUL (via webhook or manual verification)
PENDING → FAILED (via webhook or timeout)
SUCCESSFUL → REFUNDED (admin action)
PENDING → MANUALLY_VERIFIED (admin marks as paid offline)
PENDING → CANCELLED (registration cancelled)
```

### Manual/Offline Payment First

- Admin views "Pending Payments" list.
- Admin clicks "Verify Manually" → enters verification notes → `Payment.status = MANUALLY_VERIFIED`.
- Action is audit-logged with actor ID, timestamp, and old/new status.
- Manual verification triggers QR ticket generation if registration is approved.

### Future Online Gateway Support

- Each gateway implements `IPaymentProvider`.
- Gateway-specific webhook endpoints: `/api/v1/payments/webhook/paymob`, `/payments/webhook/stripe`, etc.
- Webhook handler verifies signature, updates payment status, triggers notifications.

### Payment Webhook Verification

- Each webhook endpoint validates the provider's signature using the provider's secret key.
- Invalid signatures return `401 Unauthorized`.
- Valid webhooks update payment status and enqueue notification jobs.

### Payment Status Reconciliation

- Admin dashboard shows payment status alongside registrations.
- Discrepancies (e.g., webhook says successful but registration not approved) are highlighted.
- Admin can manually reconcile by approving the registration.

### Admin Payment Dashboard

- List all payments with search, filters (status, provider, date range), pagination.
- Row actions: view details, verify manually, refund, view receipt.
- Bulk actions: bulk verify (where safe).

### Refund Status

- Refund initiated by admin → `Payment.status = REFUNDED`.
- Audit logged. User notified.
- If refund occurs after QR ticket issued, ticket is revoked.

### Receipt/Invoice Reference

- `Payment.receiptRef` stores external receipt number if available.
- Displayed on payment details and user receipt view.

---

## 10. QR Ticket and Attendance Plan

### QR Ticket Generation

**Trigger**: Registration status = `APPROVED` AND payment status = `SUCCESSFUL` or `MANUALLY_VERIFIED`.

**Process**:
1. Generate cryptographically secure random token (32 bytes, base64url encoded).
2. Hash the token with SHA-256 and store the hash in `QRTicket.tokenHash`.
3. Set `status = ACTIVE`, `issuedAt = now()`.
4. The raw token is encoded in the QR code image displayed to the user.
5. The raw token is NEVER stored in the database — only the hash.

**Security**:
- Token is single-use per check-in.
- Token expires when the event ends (configurable: 24 hours after event end).
- Admin can revoke a ticket (e.g., refund, cancellation).

### QR Status Lifecycle

```
NOT_ISSUED → ACTIVE (upon approval + payment)
ACTIVE → USED (after first successful scan)
ACTIVE → EXPIRED (after event ends + grace period)
ACTIVE → REVOKED (admin action or refund)
```

### QR Display for User

- User views QR ticket in "My QR Tickets" or from "My Reservations".
- Display: QR code image (generated with `qrcode.react`), event name, attendee name, date/time, registration status, payment status, ticket status, fallback text code (last 8 characters of token).
- QR code refreshed if regenerated by admin.

### QR Resend by Admin

- Admin can regenerate a ticket (e.g., lost phone, security concern).
- Old token hash invalidated. New token generated and hash stored.
- User sees updated QR code.

### QR Scanner Page

- Scanner staff navigates to `/scanner`.
- Selects event from dropdown (only upcoming/ongoing events).
- Camera view opens (`html5-qrcode`).
- Scanned token sent to `/api/v1/qr/scan`.

### Camera Scanning

- Uses `html5-qrcode` library.
- Supports rear camera on mobile devices.
- Scan area highlighted with AMG brand colors.
- Sound/vibration feedback on scan (optional).

### Manual Ticket Code Entry

- Fallback input field for entering the fallback text code (last 8 chars).
- Backend looks up token hash prefix match.

### Validation Rules

On scan, backend validates in this order:
1. Token hash exists in database.
2. QR ticket status is `ACTIVE`.
3. Registration status is `APPROVED`.
4. Payment status is `SUCCESSFUL` or `MANUALLY_VERIFIED` (or `NOT_REQUIRED`).
5. Event matches the selected scanner event.
6. Event has not ended (or within grace period).
7. QR ticket has not been used before (no existing `AttendanceCheckIn` with `status = VALIDATED`).

If any rule fails, return specific rejection reason:
- "Ticket not found"
- "Ticket revoked"
- "Registration not approved"
- "Payment pending"
- "Wrong event"
- "Event has ended"
- "Already checked in at [timestamp]"

### Attendance Record Creation

On successful validation:
1. Create `AttendanceCheckIn` with `status = VALIDATED`.
2. Update `QRTicket.status = USED`.
3. Return attendee name, event name, check-in time.
4. Trigger notification to user ("You have been checked in").

### Scanner Staff ID Logging

- `AttendanceCheckIn.scannerId` records the user who performed the scan.
- Allows audit trail of who checked in whom.

### Attendance Export

- Admin exports attendance by event.
- Columns: Event name, Attendee name, Check-in time, Scanner name, Status.

---

## 11. Course and Video Plan

### Course Catalog

- Public page listing published courses.
- Search by title, filter by category, sort by date or popularity.
- Course cards show: thumbnail, title, instructor, category, price/free label, lesson count, duration.

### Course Details

- Public page showing: title, description, instructor bio, category, price, lesson list (titles only), duration, enrollment count.
- "Enroll" button (free) or "Enroll & Pay" button (paid).
- Lessons are hidden until enrolled.

### Free Course Enrollment

1. User clicks "Enroll" on free course.
2. Backend creates `CourseEnrollment` with `status = ACTIVE`.
3. User immediately sees "Go to Course" button.

### Paid Course Enrollment

1. User clicks "Enroll & Pay" on paid course.
2. Backend creates `CourseEnrollment` with `status = ACTIVE` and `Payment` with `status = PENDING`.
3. User sees payment instructions or online payment flow.
4. After payment verification, lessons become accessible.

### Course Categories

- Same pattern as event categories.
- Predefined categories or admin-created.

### Instructor Assignment

- `Course.instructorId` links to a User with the `instructor` role.
- Instructors can only manage their assigned courses (unless they have `courses:update` for all).

### Lesson Management

- Admin/instructor creates lessons within a course.
- Each lesson has: title, description, order index, duration, video.
- Lessons ordered by `orderIndex`.
- Drag-and-drop reordering (nice-to-have for V1, manual index input is fine).

### Video Upload/Linking

- Admin uploads video file via multipart form.
- Backend stores file on VPS filesystem (`/uploads/videos/{courseId}/{lessonId}/{uuid}.mp4`).
- `Video` record created with provider = "vps", file path, duration, size.
- Lesson linked to video.

### Protected Video Playback

- Video is streamed via `/api/v1/videos/:id/stream`.
- Endpoint validates:
  1. User is authenticated.
  2. User has an `ACTIVE` enrollment for the course.
  3. If course is paid, payment status is `SUCCESSFUL` or `MANUALLY_VERIFIED`.
- If valid, backend serves the video file with appropriate headers (`Content-Type`, `Accept-Ranges` for partial content).
- If invalid, return `403 Forbidden`.

### Course Access Validation

- Every lesson page and video stream endpoint enforces enrollment + payment checks on the backend.
- Frontend does not rely on client-side checks alone.

### Course Progress Tracking

- Optional per course.
- Tracks `LessonProgress` records: `isCompleted` boolean.
- Completion triggered when video ends or user clicks "Mark as Complete".
- Course completion rate = completed lessons / total lessons.

### Admin Course Dashboard

- List all courses with search, filters, status badges, pagination.
- Row actions: edit, publish, archive, view enrollments.
- Bulk actions: bulk publish, bulk archive.

### Instructor Course Management

- Instructors see only their assigned courses.
- Can create/edit lessons, upload videos, view enrollments.
- Cannot access other admin modules.

---

## 12. Admin Dashboard Plan

### Dashboard Overview

- Summary cards: Total users, total events, total courses, pending registrations, pending payments, today's attendance.
- Recent activity feed (latest registrations, payments, QR scans).
- Quick links to most-used admin screens.

### Module Screens

Every admin list screen includes:
- **Search**: Full-text search on relevant fields (name, email, title).
- **Filters**: Status, date range, category, role.
- **Status badges**: Color-coded badges for all status fields.
- **Pagination**: 25 records per page default. Server-side pagination.
- **Row actions**: View, edit, delete, approve, reject, publish, archive.
- **Bulk actions**: Select multiple rows, apply bulk action (approve, reject, delete, export) where safe.
- **Export**: Export current filtered view to CSV.
- **Loading state**: Skeleton loader while data fetches.
- **Empty state**: Illustration + message + CTA when no records.
- **Error state**: Error message + retry button when request fails.

Every admin form includes:
- **Required validation**: Red asterisk, inline validation on blur/submit.
- **Save/loading state**: Button shows spinner, disabled during submit.
- **Success feedback**: Toast notification on successful save.
- **Unsaved changes warning**: Alert if user tries to navigate away with unsaved changes.
- **Permission checks**: Form rendered only if user has `create` or `update` permission for the module.

### Role-Based Navigation

- Sidebar menu items filtered by user's role permissions.
- Scanner role: only Scanner and Attendance items visible.
- Instructor role: only Courses and Lessons items visible.
- AMG Admin: all items except Super Admin-only actions (role creation, audit log deletion).

---

## 13. Announcements and Notifications Plan

### Announcement CRUD

- Admin creates announcement with title, body, target audience (all users or specific roles).
- Saved as `draft` by default.
- Admin publishes → `status = PUBLISHED`, `publishedAt = now()`.
- Published announcements appear on user dashboard and notification list.
- Archived announcements hidden from users but retained for history.

### Audience Targeting

- `targetRoles` array stores role slugs.
- Empty array = all users.
- Notifications generated only for users matching the target roles.

### Notification Types

| Type | Trigger | Channel |
|---|---|---|
| REGISTRATION_SUBMITTED | User registers for event | In-app + Email |
| REGISTRATION_APPROVED | Admin approves registration | In-app + Email |
| REGISTRATION_REJECTED | Admin rejects registration | In-app + Email |
| PAYMENT_SUCCESSFUL | Payment confirmed | In-app + Email |
| PAYMENT_FAILED | Payment fails | In-app + Email |
| QR_ISSUED | QR ticket generated | In-app + Email |
| EVENT_REMINDER | 24 hours before event | In-app + Email |
| EVENT_CANCELLED | Event cancelled | In-app + Email |
| NEW_ANNOUNCEMENT | Announcement published | In-app + Email |
| NEW_COURSE | Course published | In-app + Email |

### In-App Notifications

- User notification inbox (`/notifications`).
- Unread count badge on navigation.
- Clicking a notification marks it as read and navigates to the relevant entity.
- Grouped by date. Filter by type (optional).

### Email Notifications

- Sent via Resend (or SMTP fallback).
- HTML email templates for each notification type.
- Includes AMG branding, clear CTA button, unsubscribe link (for non-transactional).

### Future Push Notifications

- Notification service abstracts channels.
- V2 adds `PushChannel` implementing the same interface.
- No backend changes required.

---

## 14. Reports and Export Plan

### Reports

| Report | Metrics | Filters |
|---|---|---|
| Total Users | Count, new users by period | Date range, role |
| Event Registrations | Count, by status, by event | Event, date range, status |
| Attendance Rate | Checked-in / total registered | Event, date range |
| Revenue | Paid vs free revenue, by event | Event, date range, status |
| No-Show Users | Registered but not checked in | Event, date range |
| Course Enrollments | Count, by course, by status | Course, date range |
| Course Completion Rate | Completed / total enrolled | Course, date range |
| Payment Reports | Total, by status, by provider | Date range, status, provider |
| QR Scan Logs | Total scans, valid vs rejected | Event, date range, scanner |

### Exports

- Export current filtered view to CSV.
- Supported entities: Users, Registrations, Attendance, Payments, Course Enrollments, QR Scan Logs.
- CSV columns match the list view columns.
- Synchronous for < 10,000 records.
- Asynchronous (BullMQ) for larger datasets or complex joins.

### Async Export Flow

1. Admin clicks export.
2. Backend estimates record count.
3. If < 10,000: generate CSV immediately, return download URL.
4. If ≥ 10,000: enqueue export job, return job ID.
5. Background worker generates CSV, stores in `/uploads/exports/`.
6. Admin receives in-app notification: "Export ready" with download link.
7. Export files auto-deleted after 7 days.

---

## 15. Content Management Plan

### Content Pages

Admin-managed static pages:
- Privacy Policy (`/content/privacy-policy`)
- Terms and Conditions (`/content/terms-and-conditions`)
- Refund Policy (`/content/refund-policy`)
- FAQs (`/content/faqs`)
- Support/Contact (`/content/support`)

### Admin Content Editor

- Rich text editor (TipTap or similar) for body content.
- Slug auto-generated from title.
- Publish/draft toggle.
- Preview before publish.

### Public Access

- Content pages are public (no auth required).
- Linked from footer and user settings.

---

## 16. Audit Logging Plan

### Tracked Actions

| Action | Entity | Fields Logged |
|---|---|---|
| Role change | User | `roleId` (old → new) |
| Permission change | RolePermission | `permissionId` added/removed |
| Registration approve | EventRegistration | `status` (pending → approved) |
| Registration reject | EventRegistration | `status` (pending → rejected), `adminNotes` |
| QR scan | AttendanceCheckIn | `status`, `scanTime` |
| Payment status change | Payment | `status` (old → new) |
| Manual payment verify | Payment | `status` (pending → manually_verified), `verifiedById` |
| User disable | User | `status` (active → disabled) |
| User delete | User | `status` (active → deleted) |
| Event publish | Event | `status` (draft → published) |
| Event cancel | Event | `status` (published → cancelled) |
| Course publish | Course | `status` (draft → published) |
| Course archive | Course | `status` (published → archived) |
| Content update | StaticContentPage | `body` (old → new) |

### Audit Log Entry

```typescript
{
  actorId: string;      // User who performed the action
  action: AuditAction;  // CREATE, UPDATE, DELETE, APPROVE, etc.
  entityType: string;   // "EventRegistration", "Payment", etc.
  entityId: string;     // UUID of the affected entity
  oldValue: string;     // JSON string of previous state (or null)
  newValue: string;     // JSON string of new state (or null)
  ipAddress: string;    // Client IP
  userAgent: string;    // Client user agent
  createdAt: Date;
}
```

### Implementation

- `@AuditLog(action, entityType)` decorator on controller methods.
- Interceptor captures old value before service call, new value after.
- Async write to `AuditLog` table (non-blocking).
- Admin views audit logs with filters by actor, action, entity type, date range.

---

## 17. Testing Plan

### Testing Layers

| Layer | Tool | Coverage Target |
|---|---|---|
| Unit tests | Jest | Business logic, validation, permissions, status transitions |
| Integration tests | Jest + Supertest | Full request-response flows for each module |
| E2E tests | Playwright | Main user journey + admin journey |
| Component tests | React Testing Library | Reusable UI components |

### Critical Tested Workflows

- **User Registration**: Valid input, duplicate email, weak password, unverified login blocked.
- **Login/Logout**: Valid credentials, invalid credentials, expired session, logout clears cookies.
- **Email Verification**: Token valid, token expired, already verified.
- **Password Reset**: Request sent, token valid, token expired, password updated.
- **Event Creation**: Valid data, invalid dates, duplicate slug.
- **Event Registration**: Free registration, paid registration, duplicate blocked, deadline blocked, capacity blocked.
- **Admin Approval/Rejection**: Approve generates QR, reject sends notification, audit logged.
- **Payment Status Tracking**: Manual verify, webhook verify, refund, status reconciliation.
- **QR Ticket Generation**: Generated after approval + payment, not before.
- **QR Validation and Check-in**: Valid scan, duplicate scan, wrong event, expired, revoked, unpaid.
- **Duplicate QR Prevention**: Same token cannot be used twice.
- **Course Enrollment**: Free enrolls immediately, paid blocks until payment.
- **Protected Video Access**: Valid enrollment plays, invalid enrollment blocked, direct URL blocked.
- **Role and Permission Enforcement**: Admin can access, scanner cannot access admin, instructor limited to own courses.
- **Reports and Exports**: Correct data, proper CSV format, async flow for large datasets.

### Test Data

- Seed script creates: test users (one per role), test events (free and paid), test courses (free and paid), test registrations, test payments.
- E2E tests run against a fresh seeded database.

---

## 18. Performance Plan

### Targets

| Metric | Target | Measurement |
|---|---|---|
| Initial page load | < 2 seconds | Lighthouse Performance score |
| API response (normal load) | < 500 ms | Server response time |
| QR scan validation | < 1 second | Scan to result display |
| Admin list query | < 300 ms | Database query + serialization |
| Image load | < 100 ms | Above-the-fold images |

### Strategies

- **Pagination**: All list endpoints use `page` + `limit` (default 25, max 100).
- **Database indexes**: Searchable fields indexed (email, slug, status, tokenHash, providerRef).
- **Lazy loading**: Images below the fold use `next/image` with lazy loading.
- **Video optimization**: Videos streamed with range requests; metadata loaded before video.
- **Caching**: Redis caches frequently accessed data (event lists, user sessions).
- **CDN**: Nginx serves static assets with caching headers.
- **Code splitting**: Next.js automatic code splitting per route.
- **Bundle optimization**: Tree-shaking, dynamic imports for heavy components (scanner, video player).

### Large Exports

- Async processing via BullMQ.
- Worker generates CSV in background.
- Admin notified when ready.
- Export files stored temporarily and auto-deleted after 7 days.

---

## 19. Security Plan

### Password Security

- bcrypt with 12 salt rounds.
- Password strength: minimum 8 characters, 1 uppercase, 1 lowercase, 1 number.
- Password reset tokens: JWT with 1-hour expiry, single-use.

### Backend Permission Checks

- Every admin endpoint checks permissions via `PermissionGuard`.
- Permission checks happen on the backend, never frontend-only.
- JWT payload includes `roleId` for quick guard checks.

### Payment Security

- Payment status never trusted from frontend.
- Webhook signatures verified with provider secret.
- Manual payment changes require `payments:update` permission and are audit-logged.

### QR Security

- Tokens generated with `crypto.randomBytes(32)`.
- Only SHA-256 hash stored in database.
- Tokens are single-use (one check-in per ticket).
- Expired after event ends + grace period.
- Revocable by admin.

### Rate Limiting

| Endpoint | Limit |
|---|---|
| Auth (login, register) | 5 req/min per IP |
| Password reset | 3 req/hour per email |
| QR scan | 30 req/min per IP |
| General API | 100 req/min per user |
| Admin API | 200 req/min per user |

### Input Validation

- All request bodies validated with Zod schemas.
- SQL injection prevention via Prisma parameterized queries.
- XSS prevention via React's automatic escaping and Content Security Policy headers.

### File Upload Security

- File type validation (whitelist extensions and MIME types).
- File size limits (images 5MB, videos 500MB).
- Filename sanitization (UUID replacement).
- Upload directory outside web root.

### Video Security

- No direct public video URLs.
- All video access through `/api/v1/videos/:id/stream` with authorization.
- `Content-Disposition: inline` but no download controls in player.
- Web V1: CSS/JS obfuscation to reduce unauthorized downloading (cannot fully prevent screen recording).

### Audit and Backups

- All sensitive actions audit-logged.
- Daily automated PostgreSQL backups.
- Backup encryption and off-site storage.

### Environment Security

- All secrets in `.env` file, never committed.
- Production `.env` managed via Hostinger control panel or secure vault.
- `NODE_ENV=production` disables stack traces in error responses.

---

## 20. Deployment Plan

### Hostinger VPS Setup

**Server specs** (recommended):
- 4 vCPU, 8GB RAM, 160GB SSD
- Ubuntu 22.04 LTS

**Stack**:
- Node.js 20 LTS
- PostgreSQL 15
- Redis 7
- Nginx
- PM2

### Nginx Configuration

- Reverse proxy `/` → Next.js (port 3000).
- Reverse proxy `/api` → NestJS (port 4000).
- Static file serving (`/uploads/` from filesystem).
- Gzip compression.
- SSL/TLS via Let's Encrypt (Certbot).
- Security headers (CSP, HSTS, X-Frame-Options).

### SSL/TLS

- Let's Encrypt certificates via Certbot.
- Auto-renewal via cron job.
- HTTP → HTTPS redirect.

### Node Process Management

- **Production**: PM2 manages Next.js and NestJS processes.
  - `pm2 start ecosystem.config.js`
  - Cluster mode for API (2 instances).
  - Log rotation via `pm2-logrotate`.
- **Staging**: Docker Compose for easy environment reproduction.

### PostgreSQL Setup

- Install PostgreSQL 15.
- Create database: `amg_academy_platform`.
- Create user with restricted permissions.
- Enable SSL connections.
- Configure `pg_hba.conf` for local and trusted remote access.

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/amg_academy_platform

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=xxx
JWT_REFRESH_SECRET=xxx

# Email
RESEND_API_KEY=xxx
SMTP_HOST=xxx
SMTP_PORT=587
SMTP_USER=xxx
SMTP_PASS=xxx

# Payment (future)
PAYMOB_API_KEY=xxx
STRIPE_SECRET_KEY=xxx

# App
NODE_ENV=production
API_PORT=4000
WEB_PORT=3000
FRONTEND_URL=https://amgacademy.com
```

### Database Migrations

- Production migrations run via `npx prisma migrate deploy` (non-interactive).
- Migrations applied as part of deployment pipeline.
- Never run `prisma migrate dev` in production.

### File Storage

- Create `/var/www/amg-academy/uploads/` with proper permissions.
- Subdirectories: `images/`, `videos/`, `documents/`, `exports/`.
- Nginx serves `/uploads/` directly for public files (thumbnails, documents).
- Videos served through API authorization endpoint.

### Backups

- Daily PostgreSQL dump via `pg_dump` at 2 AM.
- Backup files compressed and uploaded to external storage (S3 or Hostinger backup).
- Retention: 30 days.

### Monitoring and Logging

- PM2 logs (`pm2 logs`) for application errors.
- Nginx access/error logs.
- PostgreSQL slow query log (queries > 1 second).
- Optional: Integrate Sentry for error tracking.

### CI/CD with GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test
      - run: npm run build
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_KEY }}
          script: |
            cd /var/www/amg-academy-platform
            git pull origin main
            npm ci
            npm run db:migrate
            npm run build
            pm2 restart all
```

### Staging and Production

- **Staging**: `staging.amgacademy.com` — auto-deploy from `develop` branch.
- **Production**: `amgacademy.com` — manual deploy from `main` branch after QA approval.

---

## 21. Implementation Phases

### Phase 1 — Foundation (Week 1-2)

**Goal**: Repository setup, authentication, role/permission foundation, admin shell, user dashboard shell.

- [ ] Repository setup (monorepo, shared packages, configs)
- [ ] Docker Compose for local development
- [ ] Prisma schema and initial migration
- [ ] NestJS API setup (modules, guards, interceptors, error handling)
- [ ] Next.js web setup (Tailwind config, fonts, layout structure)
- [ ] Shared Zod schemas and types
- [ ] Auth module (register, login, logout, verify email, forgot/reset password)
- [ ] User module (profile, user list)
- [ ] Role and permission module (roles, permissions, assignment)
- [ ] Admin layout and navigation shell
- [ ] User dashboard shell and bottom tab navigation
- [ ] Protected route middleware
- [ ] API client setup with interceptors
- [ ] Reusable UI components (Button, Input, Modal, Toast, Card, Badge, StatusBadge)

**Validation**: A user can register, verify email, log in, and see the dashboard. An admin can log in and see the admin sidebar.

### Phase 2 — Events, Registrations, Payments (Week 3-4)

**Goal**: Full event lifecycle including registration, payment tracking, and admin approval.

- [ ] Event categories CRUD
- [ ] Event CRUD (admin)
- [ ] Event listing and details (public)
- [ ] Event registration flow
- [ ] Duplicate registration prevention
- [ ] Registration deadline and capacity checks
- [ ] Payment module (manual/offline tracking)
- [ ] Payment status lifecycle
- [ ] Admin registration approval/rejection
- [ ] Admin payment verification
- [ ] My Reservations screen
- [ ] Audit logging for approvals and payments
- [ ] Notifications for registration and payment events

**Validation**: A user can browse events, register for a free event, and see it in My Reservations. An admin can approve a registration and verify a payment.

### Phase 3 — QR, Attendance, Courses (Week 5-6)

**Goal**: QR ticketing, attendance scanning, and course learning module.

- [ ] QR ticket generation (secure random tokens)
- [ ] QR ticket display for user
- [ ] QR ticket admin management (regenerate, revoke)
- [ ] QR scanner page (camera + manual entry)
- [ ] QR validation backend (all rules)
- [ ] Attendance recording
- [ ] Attendance logs (admin)
- [ ] Course categories CRUD
- [ ] Course CRUD (admin/instructor)
- [ ] Course catalog and details (public)
- [ ] Course enrollment (free and paid)
- [ ] Lesson management
- [ ] Video upload and storage
- [ ] Protected video streaming endpoint
- [ ] Video player component (no download controls)
- [ ] Course progress tracking
- [ ] My Courses screen

**Validation**: After a registration is approved and paid, a QR ticket is generated. A scanner can validate it. A user can enroll in a course and watch a protected video.

### Phase 4 — Admin Completion, Reports, Content, QA (Week 7-8)

**Goal**: Complete admin features, reports, exports, content management, and production readiness.

- [ ] Announcement CRUD and publishing
- [ ] Notification system (in-app and email)
- [ ] Reports dashboard (all report types)
- [ ] Export center (CSV, async for large datasets)
- [ ] Content page management
- [ ] Audit log viewer
- [ ] Admin dashboard overview stats
- [ ] Bulk actions on all admin lists
- [ ] Performance optimization (images, lazy loading, caching)
- [ ] Security hardening (rate limiting, CSP headers, input validation)
- [ ] E2E tests for critical workflows
- [ ] Integration tests for all modules
- [ ] Responsive design QA (mobile + desktop)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Production deployment on Hostinger VPS
- [ ] Documentation (deployment guide, API docs, admin manual)

**Validation**: All P0 workflows pass tests. Admin can manage all platform operations. Platform deployed and accessible.

---

## 22. Risks and Mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| 8-week timeline is aggressive for full platform | High | High | Prioritize P1 features (auth, events, QR, payments). Defer P3 (reports, content) if needed. Add buffer week. |
| Admin dashboard scope is large | Medium | High | Build reusable DataTable and Form components early. Use consistent patterns across all admin screens. |
| Payment gateway decision may delay integration | Medium | Medium | Start with manual/offline verification. Abstract payment provider so gateway can be added later without rewrites. |
| Video security limitations on web | High | Medium | Use signed URLs, authorization middleware, and no download controls. Accept that browser screen recording cannot be fully prevented. |
| VPS video storage may not scale | Medium | High | Abstract video provider from day one. Plan migration path to streaming provider (Cloudflare, Bunny, etc.). |
| QR security must be implemented correctly | Medium | High | Use crypto-secure random tokens, store only hashes, implement all validation rules with tests. |
| Permissions must be carefully tested | Medium | High | Write comprehensive permission tests. Use test matrix covering all role/module combinations. |
| Future mobile app needs API stability | Medium | Medium | Design API to be stateless and frontend-agnostic. Version API (`/api/v1`). Document all endpoints. |
| Team unfamiliarity with NestJS/Prisma | Low | Medium | Allocate time for learning in Phase 1. Use NestJS CLI generators. Leverage Prisma documentation. |
| Hostinger VPS resource limits | Low | Medium | Monitor resource usage. Scale VPS plan if needed. Use PM2 clustering for API. |

---

## 23. Deliverables

| Deliverable | Description |
|---|---|
| Frontend Web App | Next.js responsive web application with user dashboard, admin dashboard, and scanner interface |
| Backend API | NestJS REST API with 20+ modules, JWT auth, RBAC, and comprehensive validation |
| PostgreSQL Schema | Prisma schema with 20+ entities, migrations, indexes, and constraints |
| Admin Dashboard | Full admin interface for managing users, events, courses, payments, QR, attendance, content, reports |
| User Dashboard | Personalized dashboard with events, courses, reservations, QR tickets, notifications, profile |
| QR Scanner | Browser-based QR scanning interface for event staff with camera and manual fallback |
| Course Module | Course catalog, enrollment, protected video lessons, and progress tracking |
| Payment Tracking | Payment status tracking with manual verification and future gateway abstraction |
| Reports & Exports | Dashboard reports and CSV exports with async processing for large datasets |
| Content Management | Admin-managed static pages (privacy, terms, FAQ, support) |
| Audit Logs | Immutable audit trail for all sensitive admin actions |
| Deployment Documentation | Step-by-step guide for Hostinger VPS setup, Nginx config, SSL, PM2, backups |
| Test Suite | Unit, integration, and E2E tests covering all P0 workflows |
| Environment Configuration | `.env.example`, Docker Compose, PM2 ecosystem config, GitHub Actions CI/CD |
| API Documentation | Auto-generated OpenAPI/Swagger docs from NestJS controllers |
