# Tasks: AMG Academy Platform V1

**Input**: Design documents from `/specs/001-amg-platform-v1/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the feature specification. Test tasks are omitted per task generation rules.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `apps/web/src/`
- **Backend**: `apps/api/src/`
- **Shared**: `packages/shared/src/`
- **Config**: `packages/config/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, monorepo structure, and local development stack

- [X] T001 Create monorepo directory structure per implementation plan (apps/web, apps/api, packages/shared, packages/config, docs/)
- [X] T002 Configure root package.json with workspace definitions and shared npm scripts in package.json
- [X] T003 [P] Initialize Next.js 14+ app in apps/web with App Router, Tailwind CSS, Hanken Grotesk and Inter fonts
- [X] T004 [P] Initialize NestJS 10+ app in apps/api with core modules, config service, and global pipes
- [X] T005 [P] Setup Docker Compose for local development with PostgreSQL 15, Redis 7, and Nginx services
- [X] T006 [P] Configure shared packages: packages/shared (Zod schemas, types, enums) and packages/config (ESLint, TS, Tailwind configs)
- [X] T007 [P] Create environment configuration templates (.env.example for root, apps/api, apps/web)
- [X] T008 [P] Add production Dockerfiles (Dockerfile.web, Dockerfile.api) and nginx.conf reverse proxy config
- [X] T009 Setup GitHub Actions CI/CD workflow in .github/workflows/deploy.yml with test and deploy jobs

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T010 [P] Define complete Prisma schema with all models, enums, indexes, and constraints in apps/api/prisma/schema.prisma
- [X] T011 [P] Run initial Prisma migration and generate typed client in apps/api/prisma/
- [X] T012 [P] Create shared Zod validation schemas in packages/shared/src/schemas/ (auth, user, event, course, payment, etc.)
- [X] T013 [P] Create shared TypeScript types in packages/shared/src/types/ (api.types.ts, user types, event types, course types)
- [X] T014 [P] Create shared enums in packages/shared/src/enums/ (UserStatus, RegistrationStatus, PaymentStatus, QRTicketStatus, etc.)
- [X] T015 Implement NestJS global exception filter and standardized API response envelope in apps/api/src/common/filters/
- [X] T016 [P] Implement JWT Passport strategy and JwtAuthGuard with cookie extraction in apps/api/src/common/guards/
- [X] T017 [P] Implement PermissionGuard and @RequirePermission() decorator for RBAC in apps/api/src/common/decorators/
- [X] T018 Implement AuditLogInterceptor for capturing before/after state on sensitive operations in apps/api/src/common/interceptors/
- [X] T019 [P] Configure Tailwind with AMG design system colors, fonts, and breakpoints in apps/web/tailwind.config.ts
- [X] T020 [P] Create reusable UI components in apps/web/src/components/ui/ (Button, Input, Modal, Toast, Card, Badge, StatusBadge)
- [X] T021 [P] Create layout components in apps/web/src/components/layouts/ (AuthLayout, UserLayout, AdminLayout, ScannerLayout)
- [X] T022 [P] Create state components in apps/web/src/components/states/ (EmptyState, ErrorState, LoadingSkeleton)
- [X] T023 [P] Implement centralized API client with interceptors in apps/web/src/lib/api.ts
- [X] T024 [P] Implement Next.js middleware for protected routes, auth checks, and role-based redirects in apps/web/middleware.ts
- [X] T025 [P] Implement auth utilities and token management helpers in apps/web/src/lib/auth.ts
- [X] T026 Seed initial roles (super_admin, amg_admin, scanner, instructor, user) and base permissions in apps/api/prisma/seed.ts
- [X] T027 [P] Configure BullMQ queue setup and Redis connection in apps/api/src/config/queues.config.ts
- [X] T028 [P] Configure file upload infrastructure (multer, upload directories, UUID filenames) in apps/api/src/config/upload.config.ts
- [X] T029 [P] Setup notification channel abstraction (NotificationChannel interface, InAppChannel, EmailChannel) in apps/api/src/modules/notifications/channels/
- [X] T030 Create admin dashboard shell with collapsible sidebar and role-based menu filtering in apps/web/src/app/admin/layout.tsx
- [X] T031 Create user dashboard shell with bottom tab navigation (mobile) and top nav (desktop) in apps/web/src/app/(user)/layout.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration & Authentication (Priority: P1) 🎯 MVP

**Goal**: Dentists, students, and event attendees can create an account, verify their email, sign in, reset their password, and manage their profile.

**Independent Test**: A first-time visitor navigates to the platform, creates a new account, verifies their email via the confirmation link, signs in with their credentials, and lands on the authenticated dashboard.

### Implementation for User Story 1

- [X] T032 [P] [US1] Create auth module structure (controller, service, module, DTOs) in apps/api/src/modules/auth/
- [X] T033 [P] [US1] Implement POST /auth/register endpoint with bcrypt hashing and email uniqueness check in apps/api/src/modules/auth/auth.controller.ts
- [X] T034 [P] [US1] Implement POST /auth/login endpoint with JWT access/refresh cookie setting in apps/api/src/modules/auth/auth.controller.ts
- [X] T035 [P] [US1] Implement POST /auth/logout and POST /auth/refresh endpoints in apps/api/src/modules/auth/auth.controller.ts
- [X] T036 [P] [US1] Implement email verification flow (token generation, validation, mark verified) in apps/api/src/modules/auth/auth.service.ts
- [X] T037 [P] [US1] Implement password reset flow (forgot-password email, reset token validation, password update) in apps/api/src/modules/auth/auth.service.ts
- [X] T038 [P] [US1] Implement GET /auth/me endpoint returning current user with permissions in apps/api/src/modules/auth/auth.controller.ts
- [X] T039 [P] [US1] Create auth Zod schemas (register, login, verify-email, forgot-password, reset-password) in packages/shared/src/schemas/auth.schema.ts
- [X] T040 [P] [US1] Build registration page with form validation in apps/web/src/app/(auth)/register/page.tsx
- [X] T041 [P] [US1] Build login page with form validation in apps/web/src/app/(auth)/login/page.tsx
- [X] T042 [P] [US1] Build email verification page in apps/web/src/app/(auth)/verify-email/page.tsx
- [X] T043 [P] [US1] Build forgot-password and reset-password pages in apps/web/src/app/(auth)/forgot-password/page.tsx and apps/web/src/app/(auth)/reset-password/page.tsx
- [X] T044 [P] [US1] Build user profile page (view/edit name, phone, specialty, clinic, city, avatar) in apps/web/src/app/(user)/profile/page.tsx
- [X] T045 [P] [US1] Build user settings page (notification preferences, password change) in apps/web/src/app/(user)/settings/page.tsx
- [X] T046 [P] [US1] Build user dashboard page with announcements, upcoming events, recommended courses in apps/web/src/app/(user)/dashboard/page.tsx
- [X] T047 [P] [US1] Create useAuth React hook for auth state and token refresh in apps/web/src/hooks/useAuth.ts
- [X] T048 [P] [US1] Implement users module (service, controller) for profile update and user listing in apps/api/src/modules/users/
- [X] T049 [P] [US1] Create auth form components with React Hook Form + Zod resolver in apps/web/src/components/forms/AuthForm.tsx
- [X] T050 [US1] Integrate Resend email service for transactional emails (verification, reset, welcome) in apps/api/src/modules/notifications/channels/email.channel.ts
- [X] T051 [US1] Apply rate limiting to auth endpoints (5 req/min per IP for register/login) in apps/api/src/common/guards/throttler.config.ts
- [X] T052 [US1] Build public landing page in apps/web/src/app/page.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Event Discovery, Registration & Attendance (Priority: P1)

**Goal**: Users can browse events, register for free or paid events, and scanner staff can validate QR tickets and record attendance. Admins can manage events, registrations, and payments.

**Independent Test**: A logged-in user browses events, registers for a free event, an admin approves the registration, a QR ticket is automatically generated, a scanner validates the QR at the venue, and attendance is recorded.

### Implementation for User Story 2

- [X] T053 [P] [US2] Create events module (controller, service, module) in apps/api/src/modules/events/
- [X] T054 [P] [US2] Create event-categories module in apps/api/src/modules/event-categories/
- [X] T055 [P] [US2] Create registrations module in apps/api/src/modules/registrations/
- [X] T056 [P] [US2] Create payments module in apps/api/src/modules/payments/
- [X] T057 [P] [US2] Create qr-tickets module in apps/api/src/modules/qr-tickets/
- [X] T058 [P] [US2] Create attendance module in apps/api/src/modules/attendance/
- [X] T059 [P] [US2] Implement event CRUD endpoints (create, update, publish, cancel, soft delete) in apps/api/src/modules/events/events.controller.ts
- [X] T060 [P] [US2] Implement event category CRUD endpoints in apps/api/src/modules/event-categories/event-categories.controller.ts
- [X] T061 [P] [US2] Implement public event listing endpoint (GET /events) with search, filters, pagination in apps/api/src/modules/events/events.controller.ts
- [X] T062 [P] [US2] Implement public event details endpoint (GET /events/:slug) in apps/api/src/modules/events/events.controller.ts
- [X] T063 [P] [US2] Implement registration endpoints (POST /registrations, GET /registrations, approve, reject, cancel) in apps/api/src/modules/registrations/registrations.controller.ts
- [X] T064 [P] [US2] Implement payment endpoints (GET /payments, manual verify, webhook handler) in apps/api/src/modules/payments/payments.controller.ts
- [X] T065 [P] [US2] Implement QR ticket endpoints (GET /qr-tickets, regenerate, revoke) in apps/api/src/modules/qr-tickets/qr-tickets.controller.ts
- [X] T066 [P] [US2] Implement QR scan endpoint (POST /qr/scan) with full validation rules in apps/api/src/modules/qr-tickets/qr-tickets.controller.ts
- [X] T067 [P] [US2] Implement attendance endpoints (GET /attendance, event-specific logs) in apps/api/src/modules/attendance/attendance.controller.ts
- [X] T068 [P] [US2] Build public events listing page with search and filters in apps/web/src/app/(user)/events/page.tsx
- [X] T069 [P] [US2] Build public event details page with registration CTA in apps/web/src/app/(user)/events/[slug]/page.tsx
- [X] T070 [P] [US2] Build My Reservations page showing registration status and payment status in apps/web/src/app/(user)/my-reservations/page.tsx
- [X] T071 [P] [US2] Build My QR Tickets page with QR code display using qrcode.react in apps/web/src/app/(user)/my-qr-tickets/page.tsx
- [X] T072 [P] [US2] Build admin events management page with DataTable in apps/web/src/app/admin/events/page.tsx
- [X] T073 [P] [US2] Build admin event categories page in apps/web/src/app/admin/event-categories/page.tsx
- [X] T074 [P] [US2] Build admin registrations management page with approve/reject actions in apps/web/src/app/admin/registrations/page.tsx
- [X] T075 [P] [US2] Build admin payments management page with manual verification in apps/web/src/app/admin/payments/page.tsx
- [X] T076 [P] [US2] Build QR scanner interface using html5-qrcode with camera and manual fallback in apps/web/src/app/scanner/scan/page.tsx
- [X] T077 [P] [US2] Build scanner event selection page in apps/web/src/app/scanner/page.tsx
- [X] T078 [P] [US2] Build admin attendance logs page in apps/web/src/app/admin/attendance/page.tsx
- [X] T079 [P] [US2] Implement duplicate registration prevention with UNIQUE constraint and application check in apps/api/src/modules/registrations/registrations.service.ts
- [X] T080 [P] [US2] Implement capacity check and registration deadline validation in apps/api/src/modules/registrations/registrations.service.ts
- [X] T081 [P] [US2] Implement ManualPaymentProvider with IPaymentProvider interface in apps/api/src/modules/payments/providers/manual.provider.ts
- [X] T082 [P] [US2] Implement QR ticket generation with crypto.randomBytes(32) and SHA-256 hash storage in apps/api/src/modules/qr-tickets/qr-tickets.service.ts
- [X] T083 [P] [US2] Implement QR validation rules (token existence, active status, approved registration, payment satisfied, correct event, not used, not expired) in apps/api/src/modules/qr-tickets/qr-tickets.service.ts
- [X] T084 [P] [US2] Create EventCard component for event listings in apps/web/src/components/cards/EventCard.tsx
- [X] T085 [P] [US2] Create QRTicketCard component with QR code display and fallback code in apps/web/src/components/cards/QRTicketCard.tsx
- [X] T086 [P] [US2] Create QRScanner component with camera selection and manual entry fallback in apps/web/src/components/scanner/QRScanner.tsx
- [X] T087 [US2] Add audit logging for registration approvals, rejections, payment verifications, and QR scans in apps/api/src/modules/registrations/registrations.controller.ts, apps/api/src/modules/payments/payments.controller.ts, and apps/api/src/modules/qr-tickets/qr-tickets.controller.ts
- [X] T088 [US2] Add notifications for registration submitted, approved, rejected, payment successful, and QR issued events in apps/api/src/modules/registrations/registrations.service.ts and apps/api/src/modules/payments/payments.service.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 4 - Admin Dashboard & Operations (Priority: P1)

**Goal**: AMG Academy staff can manage users, roles, permissions, announcements, and audit logs through the admin interface with role-based access control.

**Independent Test**: A super admin logs into the admin dashboard, views the user list with search and filters, changes a user's role, creates and publishes an announcement, and reviews the audit log.

### Implementation for User Story 4

- [X] T089 [P] [US4] Create roles module (controller, service, module) in apps/api/src/modules/roles/
- [X] T090 [P] [US4] Create permissions module in apps/api/src/modules/permissions/
- [X] T091 [P] [US4] Implement role CRUD endpoints in apps/api/src/modules/roles/roles.controller.ts
- [X] T092 [P] [US4] Implement permission listing and role-permission assignment endpoints in apps/api/src/modules/roles/roles.controller.ts
- [X] T093 [P] [US4] Implement admin user management endpoints (list, update, disable/soft delete) with search and filters in apps/api/src/modules/users/users.controller.ts
- [X] T094 [P] [US4] Build admin users page with DataTable, search, filters, pagination, row actions in apps/web/src/app/admin/users/page.tsx
- [X] T095 [P] [US4] Build admin roles and permissions page in apps/web/src/app/admin/roles/page.tsx
- [X] T096 [P] [US4] Create DataTable component with sorting, pagination, row selection, and bulk actions in apps/web/src/components/tables/DataTable.tsx
- [X] T097 [P] [US4] Create FilterBar component for admin list filters in apps/web/src/components/tables/FilterBar.tsx
- [X] T098 [P] [US4] Build admin dashboard overview page with summary stats cards (total users, events, courses, pending registrations, pending payments) in apps/web/src/app/admin/dashboard/page.tsx
- [X] T099 [P] [US4] Implement audit log service and controller with filters in apps/api/src/modules/audit-logs/
- [X] T100 [P] [US4] Build admin audit logs viewer page with actor, action, entity filters in apps/web/src/app/admin/audit-logs/page.tsx
- [X] T101 [P] [US4] Create announcements module (controller, service, module) in apps/api/src/modules/announcements/
- [X] T102 [P] [US4] Implement announcement CRUD and publish/archive endpoints in apps/api/src/modules/announcements/announcements.controller.ts
- [X] T103 [P] [US4] Build admin announcements management page with rich text editor in apps/web/src/app/admin/announcements/page.tsx
- [X] T104 [P] [US4] Build admin QR scanner page for admin users in apps/web/src/app/admin/qr-scanner/page.tsx
- [X] T105 [P] [US4] Implement soft delete (status = DISABLED) for users with active registration/enrollment orphan prevention in apps/api/src/modules/users/users.service.ts
- [X] T106 [P] [US4] Implement @AuditLog() decorator and integrate across admin controllers in apps/api/src/common/decorators/audit-log.decorator.ts
- [X] T107 [US4] Enforce role-based navigation filtering in admin sidebar based on user permissions in apps/web/src/components/layouts/AdminLayout.tsx
- [X] T108 [US4] Add backend permission checks for all admin endpoints with @RequirePermission() decorator across apps/api/src/modules/*/

**Checkpoint**: At this point, User Stories 1, 2, and 4 should all work independently

---

## Phase 6: User Story 3 - Course Learning Platform (Priority: P2)

**Goal**: Users can browse courses, enroll in free or paid courses, and watch protected video lessons. Instructors and admins can manage course content.

**Independent Test**: A logged-in user browses courses, enrolls in a free course, opens a lesson, and watches the protected video. An admin can upload a new course with lessons and videos and publish it.

### Implementation for User Story 3

- [X] T109 [P] [US3] Create courses module (controller, service, module) in apps/api/src/modules/courses/
- [X] T110 [P] [US3] Create course-categories module in apps/api/src/modules/course-categories/
- [X] T111 [P] [US3] Create lessons module in apps/api/src/modules/lessons/
- [X] T112 [P] [US3] Create videos module in apps/api/src/modules/videos/
- [X] T113 [P] [US3] Create enrollments module in apps/api/src/modules/enrollments/
- [X] T114 [P] [US3] Implement course CRUD endpoints (create, update, publish, archive) with instructor assignment in apps/api/src/modules/courses/courses.controller.ts
- [X] T115 [P] [US3] Implement course category CRUD endpoints in apps/api/src/modules/course-categories/course-categories.controller.ts
- [X] T116 [P] [US3] Implement lesson CRUD endpoints with orderIndex management in apps/api/src/modules/lessons/lessons.controller.ts
- [X] T117 [P] [US3] Implement video upload endpoint (multipart, max 500MB, type validation) in apps/api/src/modules/videos/videos.controller.ts
- [X] T118 [P] [US3] Implement protected video streaming endpoint (GET /videos/:id/stream) with range request support in apps/api/src/modules/videos/videos.controller.ts
- [X] T119 [P] [US3] Implement enrollment endpoints (POST /enrollments, list, progress update) in apps/api/src/modules/enrollments/enrollments.controller.ts
- [X] T120 [P] [US3] Implement lesson progress tracking endpoints in apps/api/src/modules/enrollments/enrollments.controller.ts
- [X] T121 [P] [US3] Implement VPSVideoProvider with IVideoProvider interface for VPS file storage in apps/api/src/modules/videos/providers/vps.provider.ts
- [X] T122 [P] [US3] Build public course catalog page with search and filters in apps/web/src/app/(user)/courses/page.tsx
- [X] T123 [P] [US3] Build public course details page with lesson list preview in apps/web/src/app/(user)/courses/[slug]/page.tsx
- [X] T124 [P] [US3] Build My Courses page showing enrolled courses and progress in apps/web/src/app/(user)/my-courses/page.tsx
- [X] T125 [P] [US3] Build lesson video player page with protected streaming in apps/web/src/app/(user)/my-courses/[courseSlug]/[lessonSlug]/page.tsx
- [X] T126 [P] [US3] Build admin courses management page in apps/web/src/app/admin/courses/page.tsx
- [X] T127 [P] [US3] Build admin lessons management page for a specific course in apps/web/src/app/admin/lessons/page.tsx
- [X] T128 [P] [US3] Create CourseCard component for course listings in apps/web/src/components/cards/CourseCard.tsx
- [X] T129 [P] [US3] Create protected VideoPlayer component without download controls in apps/web/src/components/video/VideoPlayer.tsx
- [X] T130 [P] [US3] Implement course access validation guard for video streaming in apps/api/src/modules/videos/videos.guard.ts
- [X] T131 [P] [US3] Implement duplicate enrollment prevention with UNIQUE constraint in apps/api/src/modules/enrollments/enrollments.service.ts
- [X] T132 [P] [US3] Implement free course immediate enrollment logic in apps/api/src/modules/enrollments/enrollments.service.ts
- [X] T133 [P] [US3] Implement paid course enrollment with payment creation in apps/api/src/modules/enrollments/enrollments.service.ts
- [X] T134 [P] [US3] Build instructor course management view (filter to own courses) in apps/web/src/app/admin/courses/page.tsx
- [X] T135 [P] [US3] Add audit logging for course publish, archive, and lesson updates in apps/api/src/modules/courses/courses.controller.ts and apps/api/src/modules/lessons/lessons.controller.ts
- [X] T136 [P] [US3] Add notifications for new course published and course enrollment events in apps/api/src/modules/courses/courses.service.ts and apps/api/src/modules/enrollments/enrollments.service.ts
- [X] T137 [US3] Implement lesson progress tracking service (isCompleted, completedAt) in apps/api/src/modules/enrollments/enrollments.service.ts
- [X] T138 [US3] Build lesson list component with completion indicators in apps/web/src/components/cards/LessonCard.tsx

**Checkpoint**: At this point, User Stories 1, 2, 3, and 4 should all work independently

---

## Phase 7: User Story 5 - Reports, Exports & Content Management (Priority: P3)

**Goal**: Admins can generate reports, export data to CSV, manage static content pages, and users receive in-app and email notifications.

**Independent Test**: An admin navigates to the reports dashboard, views a summary of event registrations, exports the data to CSV, edits the privacy policy content page, and publishes it. A user views the updated privacy policy and sees a notification in their inbox.

### Implementation for User Story 5

- [X] T139 [P] [US5] Create reports module (controller, service) with aggregation queries in apps/api/src/modules/reports/
- [X] T140 [P] [US5] Create exports module with BullMQ async processing in apps/api/src/modules/exports/
- [X] T141 [P] [US5] Create content-pages module in apps/api/src/modules/content-pages/
- [X] T142 [P] [US5] Implement report endpoints (users, registrations, attendance, revenue, payments, courses, qr-scans) in apps/api/src/modules/reports/reports.controller.ts
- [X] T143 [P] [US5] Implement CSV export service with json2csv in apps/api/src/modules/exports/exports.service.ts
- [X] T144 [P] [US5] Implement async export job processor with BullMQ in apps/api/src/modules/exports/exports.worker.ts
- [X] T145 [P] [US5] Implement content page CRUD and publish endpoints in apps/api/src/modules/content-pages/content-pages.controller.ts
- [X] T146 [P] [US5] Build admin reports dashboard with summary cards and detail tables in apps/web/src/app/admin/reports/page.tsx
- [X] T147 [P] [US5] Build admin export center with sync/async handling in apps/web/src/app/admin/exports/page.tsx
- [X] T148 [P] [US5] Build admin content pages editor with rich text in apps/web/src/app/admin/content-pages/page.tsx
- [X] T149 [P] [US5] Build public content page viewer in apps/web/src/app/content/[slug]/page.tsx
- [X] T150 [P] [US5] Implement notification service and controller in apps/api/src/modules/notifications/notifications.controller.ts
- [X] T151 [P] [US5] Build user notifications inbox page with unread count in apps/web/src/app/(user)/notifications/page.tsx
- [X] T152 [P] [US5] Implement in-app notification delivery (create Notification records) in apps/api/src/modules/notifications/channels/in-app.channel.ts
- [X] T153 [P] [US5] Implement email notification delivery for all notification types via Resend in apps/api/src/modules/notifications/channels/email.channel.ts
- [X] T154 [P] [US5] Implement notification preferences endpoints in apps/api/src/modules/notifications/notifications.controller.ts
- [X] T155 [P] [US5] Build NotificationBadge component with unread count in apps/web/src/components/ui/NotificationBadge.tsx
- [X] T156 [P] [US5] Add footer with content page links in apps/web/src/components/layouts/UserLayout.tsx
- [X] T157 [P] [US5] Implement export file cleanup job (auto-delete after 7 days) in apps/api/src/modules/exports/exports.worker.ts
- [X] T158 [P] [US5] Add rich text editor component for content pages in apps/web/src/components/forms/RichTextEditor.tsx
- [X] T159 [P] [US5] Implement report data aggregation queries in apps/api/src/modules/reports/reports.service.ts
- [X] T160 [P] [US5] Add event reminder notification scheduled job in apps/api/src/modules/notifications/jobs/reminder.job.ts
- [X] T161 [P] [US5] Build report chart components for admin dashboard in apps/web/src/components/charts/
- [X] T162 [US5] Integrate notification triggers across registration, payment, QR, and course workflows in apps/api/src/modules/notifications/notification-triggers.ts
- [X] T163 [US5] Add bulk actions (approve, reject, delete, export) to all admin DataTable pages in apps/web/src/components/tables/DataTable.tsx

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Security hardening, performance optimization, accessibility, documentation, and production readiness

- [X] T164 [P] Implement global rate limiting with @nestjs/throttler (auth: 5/min, QR scan: 30/min, general: 100/min, admin: 200/min) in apps/api/src/common/guards/throttler.config.ts
- [X] T165 [P] Add security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) via Nginx and Next.js headers config
- [X] T166 [P] Implement input sanitization and XSS prevention middleware in apps/api/src/common/pipes/sanitization.pipe.ts
- [X] T167 [P] Optimize images with next/image, lazy loading, and blur placeholders across all public and admin pages in apps/web/src/app/
- [X] T168 [P] Add Redis caching for frequently accessed data (published event lists, published course lists, user sessions) in apps/api/src/common/interceptors/cache.interceptor.ts
- [X] T169 [P] Implement responsive design QA for mobile viewports on user-facing screens and tablet viewports on admin screens in apps/web/src/app/
- [X] T170 [P] Add keyboard navigation, visible focus states, and modal focus trap for WCAG 2.1 AA accessibility compliance in apps/web/src/components/ui/Modal.tsx and apps/web/src/app/
- [X] T171 [P] Implement production PM2 ecosystem configuration in ecosystem.config.js
- [X] T172 [P] Add database backup automation scripts and documentation in docs/deployment.md
- [X] T173 [P] Create admin manual documentation in docs/admin-manual.md
- [X] T174 [P] Configure Swagger/OpenAPI documentation in apps/api/src/main.ts
- [X] T175 [P] Add comprehensive .env.example documentation and deployment guide in docs/deployment.md
- [X] T176 Perform accessibility audit (WCAG 2.1 AA) and fix identified issues across all screens in apps/web/src/
- [X] T177 Run quickstart.md validation end-to-end (register, login, create event, register, approve, scan QR, create course, enroll, watch video, generate report, export CSV) per specs/001-amg-platform-v1/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Depends on US1 for auth but backend event APIs can be built in parallel
- **User Story 4 (P1)**: Can start after Foundational (Phase 2) - Depends on US1 for auth and user management; admin screens for events/courses depend on US2/US3
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for auth; can run in parallel with US2 and US4
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Depends on US1-US4 for data aggregation and notification triggers

### Within Each User Story

- Models/endpoints for a story can be developed in parallel where files don't conflict
- Services depend on their respective models/DTOs
- Frontend pages depend on backend endpoints being available (contract-first development recommended)
- Core implementation before integration and polish
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, P1 user stories (US1, US2, US4) can start in parallel
- P2 (US3) and P3 (US5) can start once their prerequisite stories are stable
- Models within a story marked [P] can run in parallel
- Frontend pages and backend modules for the same story can be developed in parallel by different team members
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all backend auth endpoints together:
Task: "Implement POST /auth/register endpoint with bcrypt hashing in apps/api/src/modules/auth/auth.controller.ts"
Task: "Implement POST /auth/login endpoint with JWT cookie setting in apps/api/src/modules/auth/auth.controller.ts"
Task: "Implement GET /auth/me endpoint returning current user with permissions in apps/api/src/modules/auth/auth.controller.ts"

# Launch all frontend auth pages together:
Task: "Build registration page with form validation in apps/web/src/app/(auth)/register/page.tsx"
Task: "Build login page with form validation in apps/web/src/app/(auth)/login/page.tsx"
Task: "Build email verification page in apps/web/src/app/(auth)/verify-email/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Authentication)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 4 → Test independently → Deploy/Demo
5. Add User Story 3 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Auth + User Dashboard)
   - Developer B: User Story 2 (Events + Registrations + QR)
   - Developer C: User Story 4 (Admin Dashboard + Roles + Audit)
3. When P1 stories are stable:
   - Developer A: User Story 3 (Courses + Videos)
   - Developer B: User Story 5 (Reports + Exports + Content)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Backend permission checks are required for ALL admin operations; frontend-only checks are insufficient
- All video access must go through the authorized streaming endpoint; never expose direct file URLs
- QR tokens use cryptographically secure random generation; only SHA-256 hashes are stored
- Payment provider is abstracted behind IPaymentProvider for future gateway migration
- Video provider is abstracted behind IVideoProvider for future streaming service migration
