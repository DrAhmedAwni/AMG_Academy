# Feature Specification: AMG Academy Mobile App V2

**Feature Branch**: `004-amg-mobile-v2`

**Created**: 2026-05-29

**Status**: Draft

**Input**: Product requirements from `docs/PRD-mobile-v2.md` and the AMG Academy Platform Constitution v1.2.0.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mobile Foundation and Auth (Priority: P1)

Users can install and open the AMG Academy mobile app, register or sign in, keep a secure session, and reach only the screens allowed for their role.

**Why this priority**: Authentication, secure storage, and protected navigation are prerequisites for every paid, QR, course, notification, profile, and scanner flow.

**Independent Test**: Run the app on Android and iOS development builds, sign in with a valid account, verify protected tabs appear, log out, and verify protected screens return to login.

**Acceptance Scenarios**:

1. **Given** a signed-out user, **When** they open the app, **Then** they see the auth flow and cannot access protected user, scanner, or profile screens.
2. **Given** valid credentials, **When** the user signs in, **Then** the session is stored securely and the app shows role-appropriate navigation.
3. **Given** a signed-in user, **When** they log out, **Then** private cached data and stored auth state are cleared.

---

### User Story 2 - Events, Payments, and QR Tickets (Priority: P1)

Users can browse events, register for free or paid events, reconcile paid-event payment state with the backend, and view only backend-valid QR tickets.

**Why this priority**: Event registration and QR tickets are core AMG Academy event-day workflows.

**Independent Test**: Register for a free event, register for a paid event, complete the mock payment flow, refresh status from the backend, and verify QR tickets appear only when eligible.

**Acceptance Scenarios**:

1. **Given** published events, **When** the user opens Events, **Then** they see searchable and filterable event cards with clear price and status.
2. **Given** a free event, **When** the user registers, **Then** backend registration state drives the reservation status.
3. **Given** a paid event, **When** the user completes mock payment, **Then** backend payment state controls whether QR access is unlocked.
4. **Given** a ticket is unpaid, unapproved, expired, used, or revoked, **When** the user opens the ticket wallet, **Then** the state is clear and no active scannable ticket is shown unless the backend allows it.

---

### User Story 3 - Courses and Protected Lessons (Priority: P1)

Users can browse courses, enroll in free or paid courses, reconcile payment state, and watch lessons only when backend access rules allow playback.

**Why this priority**: Paid lessons are protected educational assets and must not be unlocked by client-only state.

**Independent Test**: Enroll in a free course, start a paid course payment, verify locked lessons stay locked until backend access is valid, and open a protected lesson through the authorized playback flow.

**Acceptance Scenarios**:

1. **Given** published courses, **When** the user opens Courses, **Then** they see course cards with title, instructor, category, price, lesson count, and enrollment/progress state.
2. **Given** a paid course without verified access, **When** the user opens the lesson list, **Then** locked lessons remain visually clear and inaccessible.
3. **Given** valid enrollment/payment access, **When** the user opens a lesson, **Then** the lesson player loads through backend authorization.

---

### User Story 4 - Notifications, Profile, and Settings (Priority: P2)

Users can view announcements and notifications, update profile information, configure supported settings, and receive clear feedback for every action.

**Why this priority**: These screens make the mobile app useful day to day and support future push notifications.

**Independent Test**: Open notifications, mark a notification read, view profile, update editable fields, change settings, and verify loading, empty, error, and success states.

**Acceptance Scenarios**:

1. **Given** unread notifications, **When** the user opens Notifications, **Then** unread/read status is visible and can be updated where supported.
2. **Given** editable profile fields, **When** the user submits valid changes, **Then** backend profile state is updated and success feedback is shown.
3. **Given** a backend or validation error, **When** the action fails, **Then** the app shows a clear error and keeps the prior valid state.

---

### User Story 5 - Scanner Mode for Authorized Staff (Priority: P2)

Scanner/admin users can access camera-first scanner mode, select an event, scan QR tickets, and see fast backend validation results.

**Why this priority**: Scanner mode is a staff-critical event-day workflow and must be permission-protected.

**Independent Test**: Sign in as a normal user and confirm scanner mode is hidden, then sign in as scanner/admin, scan valid and invalid tickets, and verify all result states.

**Acceptance Scenarios**:

1. **Given** a normal user, **When** they sign in, **Then** scanner routes and navigation are hidden.
2. **Given** an authorized scanner/admin user, **When** they select an event and scan a QR code, **Then** the backend returns the validation result.
3. **Given** duplicate, wrong-event, unpaid, unapproved, expired, revoked, or unknown tickets, **When** scanned, **Then** the result state is explicit and fast.

### Edge Cases

- Auth token/session expires while the user is on a protected screen.
- The app starts offline or the API URL is misconfigured.
- Paid event/course payment returns pending, failed, cancelled, refunded, or manually verified.
- QR ticket wallet contains no active tickets.
- Scanner camera permission is denied.
- Scanner result is valid but the recent scans list fails to refresh.
- Course lesson access changes while a lesson screen is open.
- Push notification permission is denied.
- Profile update partially fails due to validation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST add a native mobile app under `apps/mobile`.
- **FR-002**: The mobile app MUST use the existing AMG Academy backend API and MUST NOT duplicate backend business logic.
- **FR-003**: The mobile app MUST reuse shared types, schemas, and enums from `packages/shared` where feasible.
- **FR-004**: Users MUST be able to register, sign in, refresh/restore session where supported, and log out.
- **FR-005**: Auth/session data MUST be stored securely on the device.
- **FR-006**: Protected routes MUST require authentication.
- **FR-007**: Navigation MUST be role-aware and hide scanner/admin/staff screens from unauthorized users.
- **FR-008**: The mobile dashboard MUST show welcome content, upcoming events, QR ticket shortcut, continue learning, announcements, and notifications preview where data exists.
- **FR-009**: Users MUST be able to browse, search, filter, view, and register for events.
- **FR-010**: Paid event registration MUST redirect to a payment screen and reconcile with backend payment state.
- **FR-011**: The QR ticket wallet MUST show valid, used, expired, revoked, and not issued states from backend data.
- **FR-012**: Users MUST be able to browse courses, view course details, enroll in free courses, and start paid course payment.
- **FR-013**: Paid course lessons MUST remain locked until backend access allows playback.
- **FR-014**: Protected lesson playback MUST depend on backend authorization.
- **FR-015**: Users MUST be able to view notifications, announcements, profile, and settings.
- **FR-016**: Push notification preparation MUST be included without requiring production push delivery in the first release.
- **FR-017**: Authorized scanner/admin users MUST be able to select an event, scan QR codes, and view validation results.
- **FR-018**: Scanner result states MUST include success, duplicate, wrong-event, unpaid, unapproved, expired, revoked, and invalid/not-found.
- **FR-019**: Every major screen MUST handle loading, empty, error, and success states.
- **FR-020**: Local, staging, and production API URLs MUST be configurable separately.
- **FR-021**: Android and iOS development build commands and app store readiness placeholders MUST be documented.

### Key Entities *(include if feature involves data)*

- **Mobile Session**: Secure local auth state tied to backend login, refresh, logout, current user, role, and permissions.
- **Mobile User Profile**: Backend user profile fields displayed and edited in the app.
- **Event View**: Mobile representation of a published event, registration status, payment status, and CTA state.
- **Payment View**: Mobile payment state for event registration or course enrollment, including mock payment actions until Paymob is ready.
- **QR Ticket View**: Mobile wallet entry with event, registration, payment, attendance, status, fallback code, and QR display data.
- **Course View**: Mobile course catalog/detail data, enrollment state, payment state, lessons, progress, and locked state.
- **Lesson Playback View**: Authorized lesson player state and progress controls.
- **Notification View**: Mobile notification and announcement list/read state.
- **Scanner Session**: Selected event, camera permission, current scan, backend validation result, and recent scans.

## UI/UX & Accessibility Requirements *(mandatory for user-facing/frontend features)*

- **Design System Compliance**: Dark-first premium AMG Academy design, cyan/teal primary actions, glass/elevated cards, rounded components, Hanken Grotesk or Inter-style typography, clear status badges, and consistent loading/empty/error/success states.
- **Target Screens**: Auth, home dashboard, Events, event detail, My Reservations, Payment, Tickets, ticket detail, Courses, course detail, My Courses, lesson player, Notifications, Profile, Settings, Scanner event selection, Scanner camera, Scan Result, Recent Scans.
- **Responsive Targets**: Phone-first iOS and Android layouts with touch-friendly controls, safe-area support, readable cards, and tablet-safe scaling where the app runs on larger devices.
- **State Coverage**: Loading, empty, error, success, permission denied, session expired, payment pending/failed/cancelled/successful, QR active/used/expired/revoked/not issued, lesson locked/unlocked, camera permission denied, and offline/API unavailable.
- **Accessibility**: Readable dark contrast, large tap targets, accessible icon labels, text labels for statuses, visible form validation, screen-reader-friendly button names, and confirmation for destructive or important actions.
- **Backend Scope Guardrail**: Existing backend APIs, database, Prisma schema, payment, QR, course access, scanner validation, notifications, and RBAC remain the source of truth. Any backend change must be a small compatibility extension, not duplicated business logic.
- **Visual QA Evidence**: Android and iOS screenshots or manual QA notes for auth, tabs, event detail, payment, ticket wallet, course detail, lesson player, scanner, notifications, profile, settings, empty/error states, and role-restricted navigation.

## Mobile/API State Requirements *(mandatory for apps/mobile features)*

- **Mobile Screens/Modules**: Expo route groups for `(auth)`, `(tabs)`, events, courses, payments, scanner, notifications, and settings; feature modules for auth, events, payments, tickets, courses, notifications, profile, and scanner.
- **Backend Endpoints Used**: Existing `/api/v1` auth, events, registrations, payments, QR tickets, QR scan, courses, lessons, videos, notifications, profile/users, announcements, and staff/admin permission endpoints.
- **Shared Contracts**: Reuse `@amg/shared` `ApiResponse`, auth/user/event/course/payment/QR/notification types, schemas, and status enums; add mobile-only view models only for presentation mapping.
- **Auth & Secure Storage**: Store mobile session token/cookie values in secure device storage. Clear stored auth, private query cache, and navigation state on logout or invalid refresh.
- **Role-Aware Navigation**: Base all route visibility on backend `auth/me` role and permissions. Scanner/admin screens are hidden for unauthorized users and still guarded by backend authorization.
- **Payment State Source**: Backend payment records drive paid event/course success, pending, failed, cancelled, refunded, and manually verified UI. Mock payment must be labeled.
- **QR/Scanner State Source**: Backend QR ticket and scanner validation responses drive wallet and scanner states.
- **Course Access Source**: Backend enrollment/payment authorization drives locked lessons and video playback.
- **Performance Plan**: TanStack Query caching, paginated/incremental lists, optimized images, progressive scanner and lesson screens, and minimal libraries for smooth mid-range Android/iOS behavior.
- **App Store/Environment Impact**: Environment-specific API URLs, app metadata, icons, splash placeholders, camera permission copy, notification permission preparation, and Android/iOS build docs.
- **Validation Evidence**: Manual or automated validation for auth, events, payments, QR wallet, scanner, courses, lesson access, notifications, profile/settings, role navigation, Android build, and iOS readiness.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A signed-in user can reach the mobile dashboard from app launch in under 30 seconds on a development build with a valid backend.
- **SC-002**: Users can complete free event registration and see updated reservation status without restarting the app.
- **SC-003**: Paid event and paid course payment flows show backend-reconciled status within one refresh after mock payment action.
- **SC-004**: QR ticket wallet never shows an active scannable ticket for unpaid, unapproved, expired, revoked, or not issued states.
- **SC-005**: Authorized scanner/admin users receive a scan result in under 1 second under normal local/staging conditions.
- **SC-006**: Paid lesson access is blocked for users without backend-approved enrollment/payment access.
- **SC-007**: Android development build runs; iOS development build is documented and prepared.
- **SC-008**: Type checking, linting, and critical mobile validation flows pass before the feature is marked complete.

## Assumptions

- Existing AMG backend modules and `/api/v1` contracts remain the source of truth.
- The first mobile release uses mock payment actions until Paymob production credentials and provider contracts are ready.
- The mobile app is online-first; offline-first mode is out of scope.
- Push notifications are prepared, but production push delivery may be completed in a later phase.
- Full desktop admin replication is out of scope; mobile staff/admin access is lightweight and scanner-first.
