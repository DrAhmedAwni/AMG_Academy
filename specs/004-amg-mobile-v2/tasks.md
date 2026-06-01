# Tasks: AMG Academy Mobile App V2

**Input**: Design documents from `/specs/004-amg-mobile-v2/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/mobile-api-contracts.md](contracts/mobile-api-contracts.md), [quickstart.md](quickstart.md)

**Tests**: Critical mobile flows require automated tests where practical or documented manual validation. Auth, role navigation, paid payments, QR wallet/scanner, courses, protected lessons, notifications, profile/settings, and backend authorization are release-blocking validation areas.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently after setup and foundational work.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other tasks in the same phase because it touches different files and has no dependency on incomplete tasks.
- **[Story]**: Maps tasks to user stories from [spec.md](spec.md).
- Every task includes exact file paths.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the mobile workspace skeleton and wire it into the existing npm monorepo without changing existing web/API behavior.

- [X] T001 Create `apps/mobile/` Expo workspace directory structure with `app/`, `src/`, `assets/`, and `README.md`
- [X] T002 Add `apps/mobile/package.json` with workspace name `@amg/mobile`, Expo scripts, typecheck, lint, and test commands
- [X] T003 Add `apps/mobile/app.json` with AMG Academy app name, bundle/package identifier placeholders, icon placeholder, splash placeholder, camera permission copy, and notification permission copy
- [X] T004 Add `apps/mobile/eas.json` with development, staging, preview, and production build profiles
- [X] T005 Add `apps/mobile/tsconfig.json` extending `../../tsconfig.base.json` and enabling strict React Native/Expo TypeScript settings
- [X] T006 Add `apps/mobile/babel.config.js` for Expo Router support
- [X] T007 Add `apps/mobile/.env.example` documenting local, staging, production, mock payment, and push preparation variables
- [X] T008 [P] Add `apps/mobile/.gitignore` for Expo, native build, and local environment artifacts
- [X] T009 [P] Add placeholder icon and splash assets under `apps/mobile/assets/`
- [X] T010 Update root `package.json` scripts to include `dev:mobile`, `android:mobile`, `ios:mobile`, `typecheck:mobile`, `lint:mobile`, and `test:mobile`
- [X] T011 Run and document dependency installation impact in `apps/mobile/README.md`

**Checkpoint**: Mobile workspace exists and can be addressed as an npm workspace.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build reusable mobile foundations required before any user story screen work starts.

**Critical**: No user story work begins until this phase is complete.

- [X] T012 Create Expo Router root layout in `apps/mobile/app/_layout.tsx` with Safe Area, QueryClient, theme, and auth providers
- [X] T013 Create session bootstrap route in `apps/mobile/app/index.tsx`
- [X] T014 [P] Create theme color tokens in `apps/mobile/src/theme/colors.ts` matching the AMG dark palette from the constitution
- [X] T015 [P] Create typography, spacing, radius, and shadow tokens in `apps/mobile/src/theme/tokens.ts`
- [X] T016 [P] Create status badge mappings in `apps/mobile/src/theme/status.ts` for registration, payment, QR, attendance, course, and enrollment statuses
- [X] T017 [P] Create `apps/mobile/src/theme/index.ts` exporting mobile theme tokens
- [X] T018 [P] Create SecureStore wrapper in `apps/mobile/src/lib/storage.ts`
- [X] T019 Create central API client in `apps/mobile/src/lib/api.ts` with base URL selection, auth header/cookie support, envelope parsing, timeout, and normalized errors
- [X] T020 Create TanStack Query client in `apps/mobile/src/lib/queryClient.ts` with private-cache clearing helpers
- [X] T021 Create auth/session helpers in `apps/mobile/src/lib/auth.ts` for bootstrap, refresh, logout, and session expiry handling
- [X] T022 [P] Create shared mobile API type aliases in `apps/mobile/src/types/api.ts` using `@amg/shared`
- [X] T023 [P] Create domain view model types in `apps/mobile/src/types/domain.ts` for MobileSession, EventView, PaymentView, QRTicketView, CourseView, LessonPlaybackView, NotificationView, and ScannerSession
- [X] T024 [P] Create base UI primitives in `apps/mobile/src/components/ui/Button.tsx`, `IconButton.tsx`, `TextField.tsx`, `Card.tsx`, `GlassCard.tsx`, `Badge.tsx`, and `StatusBadge.tsx`
- [X] T025 [P] Create shared state components in `apps/mobile/src/components/states/LoadingState.tsx`, `EmptyState.tsx`, `ErrorState.tsx`, `SuccessState.tsx`, `PermissionDeniedState.tsx`, and `SessionExpiredState.tsx`
- [X] T026 [P] Create layout primitives in `apps/mobile/src/components/layout/Screen.tsx`, `Header.tsx`, `BottomTabIcon.tsx`, and `SectionHeader.tsx`
- [X] T027 Create API error-to-UI mapping in `apps/mobile/src/lib/errors.ts`
- [X] T028 Create reusable query status helper hooks in `apps/mobile/src/hooks/useQueryState.ts`
- [X] T029 Verify mobile import compatibility for `@amg/shared` exports in `packages/shared/src/index.ts`
- [X] T030 Audit mobile-required backend endpoints against `specs/004-amg-mobile-v2/contracts/mobile-api-contracts.md` and record gaps in `specs/004-amg-mobile-v2/contracts/mobile-api-contracts.md`
- [X] T031 Add backend mobile auth transport compatibility in `apps/api/src/modules/auth/auth.controller.ts` if native SecureStore cannot use current cookie-only login reliably
- [X] T032 Add backend mobile auth transport compatibility in `apps/api/src/modules/auth/auth.service.ts` without changing existing web cookie behavior
- [X] T033 Add or update shared auth response types in `packages/shared/src/types/auth.types.ts` for mobile-compatible session material if backend transport is extended
- [X] T034 Create foundational unit tests for storage, API envelope parsing, and status mappings in `apps/mobile/src/__tests__/foundation.test.ts`

**Checkpoint**: App shell, API client, secure storage, query client, theme, UI primitives, state components, and backend auth compatibility are ready.

---

## Phase 3: User Story 1 - Mobile Foundation and Auth (Priority: P1)

**Goal**: Users can open the app, register or sign in, keep a secure session, and reach only role-appropriate screens.

**Independent Test**: Run Android and iOS development builds, sign in with a valid account, verify protected tabs appear, log out, and verify protected screens return to login.

### Tests and Validation for User Story 1

- [X] T035 [P] [US1] Add auth helper tests in `apps/mobile/src/features/auth/__tests__/auth-session.test.ts`
- [X] T036 [P] [US1] Add role-aware navigation tests in `apps/mobile/src/features/auth/__tests__/role-navigation.test.ts`
- [X] T037 [P] [US1] Add manual validation checklist for auth and protected navigation in `apps/mobile/docs/validation/auth.md`

### Implementation for User Story 1

- [X] T038 [P] [US1] Create auth API service in `apps/mobile/src/features/auth/auth.api.ts` for register, login, logout, refresh, forgot password, and current user
- [X] T039 [P] [US1] Create auth query and mutation hooks in `apps/mobile/src/features/auth/auth.hooks.ts`
- [X] T040 [P] [US1] Create auth feature types and route guards in `apps/mobile/src/features/auth/auth.types.ts` and `apps/mobile/src/features/auth/useProtectedRoute.ts`
- [X] T041 [US1] Implement auth route layout in `apps/mobile/app/(auth)/_layout.tsx`
- [X] T042 [US1] Implement login screen with validation and error states in `apps/mobile/app/(auth)/login.tsx`
- [X] T043 [US1] Implement register screen with shared schema validation and success/error states in `apps/mobile/app/(auth)/register.tsx`
- [X] T044 [US1] Implement forgot password screen in `apps/mobile/app/(auth)/forgot-password.tsx`
- [X] T045 [US1] Implement protected tabs layout with role-aware scanner visibility in `apps/mobile/app/(tabs)/_layout.tsx`
- [X] T046 [US1] Implement profile tab placeholder and logout action in `apps/mobile/app/(tabs)/profile.tsx`
- [X] T047 [US1] Implement session expired and permission denied route behavior in `apps/mobile/src/features/auth/SessionGate.tsx`
- [X] T048 [US1] Wire logout cleanup for SecureStore and query cache in `apps/mobile/src/lib/auth.ts`
- [ ] T049 [US1] Validate Android auth flow and record results in `apps/mobile/docs/validation/auth.md`
- [ ] T050 [US1] Validate iOS auth readiness and record results in `apps/mobile/docs/validation/auth.md`

**Checkpoint**: User Story 1 is independently usable: app opens, auth works, protected navigation works, logout clears private state.

---

## Phase 4: User Story 2 - Events, Payments, and QR Tickets (Priority: P1)

**Goal**: Users can browse events, register for free or paid events, reconcile payment state with the backend, and view only backend-valid QR tickets.

**Independent Test**: Register for a free event, register for a paid event, complete mock payment, refresh backend status, and verify QR tickets appear only when eligible.

### Tests and Validation for User Story 2

- [X] T051 [P] [US2] Add event registration hook tests in `apps/mobile/src/features/events/__tests__/events-flow.test.ts`
- [X] T052 [P] [US2] Add payment state mapping tests in `apps/mobile/src/features/payments/__tests__/payment-state.test.ts`
- [X] T053 [P] [US2] Add QR ticket eligibility tests in `apps/mobile/src/features/tickets/__tests__/ticket-state.test.ts`
- [X] T054 [P] [US2] Add manual validation checklist for events, payments, and QR wallet in `apps/mobile/docs/validation/events-payments-tickets.md`

### Implementation for User Story 2

- [X] T055 [P] [US2] Create event API service in `apps/mobile/src/features/events/events.api.ts`
- [X] T056 [P] [US2] Create event query and registration hooks in `apps/mobile/src/features/events/events.hooks.ts`
- [X] T057 [P] [US2] Create event card and detail components in `apps/mobile/src/components/cards/EventCard.tsx` and `apps/mobile/src/features/events/EventDetailContent.tsx`
- [X] T058 [US2] Implement Events tab with search, filters, pagination/loading states in `apps/mobile/app/(tabs)/events.tsx`
- [X] T059 [US2] Implement event detail screen with backend-derived CTA state in `apps/mobile/app/events/[eventId].tsx`
- [X] T060 [US2] Implement My Reservations screen in `apps/mobile/app/events/reservations.tsx`
- [X] T061 [P] [US2] Create payment API service in `apps/mobile/src/features/payments/payments.api.ts`
- [X] T062 [P] [US2] Create payment hooks and backend reconciliation helpers in `apps/mobile/src/features/payments/payments.hooks.ts`
- [X] T063 [US2] Confirm or add mobile payment detail endpoint in `apps/api/src/modules/payments/payments.controller.ts`
- [X] T064 [US2] Confirm or add mock payment success/fail/cancel endpoints in `apps/api/src/modules/payments/payments.controller.ts`
- [X] T065 [US2] Reuse backend payment service transitions for mock mobile actions in `apps/api/src/modules/payments/payments.service.ts`
- [X] T066 [US2] Implement mock-labeled payment screen in `apps/mobile/app/payments/[paymentId].tsx`
- [X] T067 [P] [US2] Create ticket API service and hooks in `apps/mobile/src/features/tickets/tickets.api.ts` and `apps/mobile/src/features/tickets/tickets.hooks.ts`
- [X] T068 [US2] Confirm QR ticket wallet returns display-safe QR payload in `apps/api/src/modules/qr-tickets/qr-tickets.controller.ts`
- [X] T069 [US2] Add display-safe QR payload service mapping without exposing token hashes in `apps/api/src/modules/qr-tickets/qr-tickets.service.ts`
- [X] T070 [P] [US2] Create ticket card and QR display components in `apps/mobile/src/components/cards/TicketCard.tsx` and `apps/mobile/src/features/tickets/QRCodePanel.tsx`
- [X] T071 [US2] Implement Tickets tab with active, not issued, used, expired, revoked, unpaid, and unapproved states in `apps/mobile/app/(tabs)/tickets.tsx`
- [X] T072 [US2] Wire event registration and paid event redirect to payment route in `apps/mobile/src/features/events/events.hooks.ts`
- [ ] T073 [US2] Validate free event registration, paid event mock payment, and QR wallet states on Android in `apps/mobile/docs/validation/events-payments-tickets.md`
- [ ] T074 [US2] Validate iOS readiness for events, payments, and QR wallet in `apps/mobile/docs/validation/events-payments-tickets.md`

**Checkpoint**: User Story 2 is independently usable after auth: events, reservations, paid event payment, and QR wallet use backend state correctly.

---

## Phase 5: User Story 3 - Courses and Protected Lessons (Priority: P1)

**Goal**: Users can browse courses, enroll in free or paid courses, reconcile payment state, and watch lessons only when backend access allows.

**Independent Test**: Enroll in a free course, start paid course payment, verify locked lessons remain locked until backend access is valid, and open a protected lesson through authorized playback.

### Tests and Validation for User Story 3

- [X] T075 [P] [US3] Add course enrollment hook tests in `apps/mobile/src/features/courses/__tests__/course-enrollment.test.ts`
- [X] T076 [P] [US3] Add lesson access state tests in `apps/mobile/src/features/courses/__tests__/lesson-access.test.ts`
- [X] T077 [P] [US3] Add manual validation checklist for courses and protected lessons in `apps/mobile/docs/validation/courses-lessons.md`

### Implementation for User Story 3

- [X] T078 [P] [US3] Create course API service in `apps/mobile/src/features/courses/courses.api.ts`
- [X] T079 [P] [US3] Create course query, enrollment, lessons, and progress hooks in `apps/mobile/src/features/courses/courses.hooks.ts`
- [X] T080 [P] [US3] Create course card, lesson row, and locked lesson components in `apps/mobile/src/components/cards/CourseCard.tsx`, `apps/mobile/src/features/courses/LessonRow.tsx`, and `apps/mobile/src/features/courses/LockedLesson.tsx`
- [X] T081 [US3] Implement Courses tab with filters, pagination/loading states, and backend-derived enrollment status in `apps/mobile/app/(tabs)/courses.tsx`
- [X] T082 [US3] Implement course detail screen with free/paid enrollment CTA and locked lesson states in `apps/mobile/app/courses/[courseId].tsx`
- [X] T083 [US3] Implement My Courses screen in `apps/mobile/app/courses/my-courses.tsx`
- [X] T084 [US3] Confirm or add mobile-usable enrollment create/list endpoints in `apps/api/src/modules/enrollments/enrollments.controller.ts`
- [X] T085 [US3] Reuse backend enrollment and payment eligibility rules in `apps/api/src/modules/enrollments/enrollments.service.ts`
- [X] T086 [US3] Wire paid course enrollment redirect to `apps/mobile/app/payments/[paymentId].tsx`
- [X] T087 [US3] Implement protected lesson player route with authorization refresh in `apps/mobile/app/courses/lesson/[lessonId].tsx`
- [X] T088 [US3] Create mobile video access helper that avoids durable public URLs in `apps/mobile/src/features/courses/videoAccess.ts`
- [X] T089 [US3] Confirm backend video stream remains authorization-protected in `apps/api/src/modules/videos/videos.controller.ts`
- [X] T090 [US3] Validate free enrollment, paid enrollment, locked lessons, and authorized playback on Android in `apps/mobile/docs/validation/courses-lessons.md`
- [X] T091 [US3] Validate iOS readiness for course catalog, lesson list, and protected lesson player in `apps/mobile/docs/validation/courses-lessons.md`

**Checkpoint**: User Story 3 is independently usable after auth: courses, enrollments, paid course payment, locked lessons, and protected playback use backend authorization.

---

## Phase 6: User Story 4 - Notifications, Profile, and Settings (Priority: P2)

**Goal**: Users can view notifications/announcements, edit profile/settings, and see clear feedback for all actions.

**Independent Test**: Open notifications, mark a notification read, view profile, update editable fields, change settings, and verify loading, empty, error, and success states.

### Tests and Validation for User Story 4

- [X] T092 [P] [US4] Add notification read-state tests in `apps/mobile/src/features/notifications/__tests__/notifications.test.ts`
- [X] T093 [P] [US4] Add profile form mapping tests in `apps/mobile/src/features/profile/__tests__/profile-form.test.ts`
- [X] T094 [P] [US4] Add manual validation checklist for notifications, profile, settings, and push preparation in `apps/mobile/docs/validation/profile-notifications.md`

### Implementation for User Story 4

- [X] T095 [P] [US4] Create notifications API service and hooks in `apps/mobile/src/features/notifications/notifications.api.ts` and `apps/mobile/src/features/notifications/notifications.hooks.ts`
- [X] T096 [P] [US4] Create notification card component in `apps/mobile/src/components/cards/NotificationCard.tsx`
- [X] T097 [US4] Implement notifications inbox with read/unread, empty, error, and success states in `apps/mobile/app/notifications.tsx`
- [X] T098 [US4] Confirm mobile announcements endpoint availability in `apps/api/src/modules/announcements/announcements.controller.ts`
- [X] T099 [P] [US4] Create push notification preparation helper in `apps/mobile/src/features/notifications/pushRegistration.ts`
- [X] T100 [P] [US4] Create profile API service and hooks in `apps/mobile/src/features/profile/profile.api.ts` and `apps/mobile/src/features/profile/profile.hooks.ts`
- [X] T101 [US4] Implement profile tab details and edit entry points in `apps/mobile/app/(tabs)/profile.tsx`
- [X] T102 [US4] Confirm or add current-user profile update endpoint in `apps/api/src/modules/users/users.controller.ts`
- [X] T103 [US4] Reuse backend user validation/update rules in `apps/api/src/modules/users/users.service.ts`
- [X] T104 [US4] Implement settings screen with notification preferences placeholder, password link where supported, and logout in `apps/mobile/app/settings.tsx`
- [X] T105 [US4] Validate notifications, announcements, profile edit, settings, and push permission denial on Android in `apps/mobile/docs/validation/profile-notifications.md`
- [X] T106 [US4] Validate iOS readiness for notifications, profile, settings, and push permission copy in `apps/mobile/docs/validation/profile-notifications.md`

**Checkpoint**: User Story 4 is independently usable after auth: notifications, announcements, profile, settings, and push preparation work with clear states.

---

## Phase 7: User Story 5 - Scanner Mode for Authorized Staff (Priority: P2)

**Goal**: Scanner/admin users can access camera-first scanner mode, select an event, scan QR tickets, and see fast backend validation results.

**Independent Test**: Sign in as a normal user and confirm scanner mode is hidden, then sign in as scanner/admin, scan valid and invalid tickets, and verify all result states.

### Tests and Validation for User Story 5

- [X] T107 [P] [US5] Add scanner permission and result mapping tests in `apps/mobile/src/features/scanner/__tests__/scanner-state.test.ts`
- [X] T108 [P] [US5] Add manual validation checklist for scanner role access and scan result states in `apps/mobile/docs/validation/scanner.md`

### Implementation for User Story 5

- [X] T109 [P] [US5] Create scanner API service and hooks in `apps/mobile/src/features/scanner/scanner.api.ts` and `apps/mobile/src/features/scanner/scanner.hooks.ts`
- [X] T110 [P] [US5] Create scanner result card component in `apps/mobile/src/features/scanner/ScannerResultCard.tsx`
- [X] T111 [US5] Implement scanner event selection screen with permission guard in `apps/mobile/app/scanner/index.tsx`
- [X] T112 [US5] Implement camera permission and camera-first QR scanner screen in `apps/mobile/app/scanner/scan.tsx`
- [X] T113 [US5] Implement scan result screen covering success, duplicate, wrong-event, unpaid, unapproved, expired, revoked, and invalid/not-found in `apps/mobile/app/scanner/result.tsx`
- [X] T114 [US5] Implement recent scans screen in `apps/mobile/app/scanner/recent.tsx`
- [X] T115 [US5] Confirm backend `/qr/scan` result reason coverage in `apps/api/src/modules/qr-tickets/qr-tickets.service.ts`
- [X] T116 [US5] Confirm backend attendance/recent scans endpoint availability in `apps/api/src/modules/attendance/attendance.controller.ts`
- [ ] T117 [US5] Validate normal-user scanner hiding and scanner/admin route access on Android in `apps/mobile/docs/validation/scanner.md`
- [ ] T118 [US5] Validate scan result states and QR validation timing on Android in `apps/mobile/docs/validation/scanner.md`
- [ ] T119 [US5] Validate iOS readiness for camera permission and scanner flow in `apps/mobile/docs/validation/scanner.md`

**Checkpoint**: User Story 5 is independently usable after auth: scanner mode is hidden from unauthorized users and backend validation drives all scan results.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, documentation, performance, accessibility, app-store readiness, and regression checks across the mobile app.

- [X] T120 [P] Update `apps/mobile/README.md` with local/staging/production environment setup and Android/iOS commands
- [X] T121 [P] Update `specs/004-amg-mobile-v2/quickstart.md` if implementation commands differ from the plan
- [X] T122 [P] Add mobile release checklist in `apps/mobile/docs/release-checklist.md`
- [X] T123 Run mobile typecheck and record result in `apps/mobile/docs/validation/final-qa.md`
- [X] T124 Run mobile lint and record result in `apps/mobile/docs/validation/final-qa.md`
- [X] T125 Run configured mobile tests and record result in `apps/mobile/docs/validation/final-qa.md`
- [X] T126 Run backend regression tests for auth, payments, QR, enrollments, videos, notifications, and users in `apps/api/`
- [X] T127 [P] Perform AMG dark UI consistency review across mobile screens and record screenshots/notes in `apps/mobile/docs/validation/ui-review.md`
- [X] T128 [P] Perform accessibility review for contrast, tap targets, icon labels, status labels, forms, and scanner controls in `apps/mobile/docs/validation/accessibility.md`
- [X] T129 [P] Perform performance review for navigation, lists, image loading, QR wallet, lesson player, and scanner timing in `apps/mobile/docs/validation/performance.md`
- [X] T130 Confirm local, staging, and production environment files are documented and production mock payments are disabled in `apps/mobile/.env.example`
- [X] T131 Confirm app icon, splash placeholders, camera permission copy, notification permission copy, and EAS profiles in `apps/mobile/app.json` and `apps/mobile/eas.json`
- [X] T132 Confirm mobile payment, QR, scanner, course access, and RBAC states are backend-derived in `apps/mobile/docs/validation/final-qa.md`
- [X] T133 Confirm protected lesson/video flow does not expose durable public video URLs in `apps/mobile/docs/validation/final-qa.md`
- [X] T134 Confirm existing web routes for payment and QR tickets still function in `apps/web/src/app/(user)/payment/[paymentId]/page.tsx` and `apps/web/src/app/(user)/my-qr-tickets/page.tsx`
- [X] T135 Confirm AGENTS.md references current mobile plan artifacts in `AGENTS.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories.
- **US1 Mobile Foundation and Auth (Phase 3)**: Depends on Foundational; MVP.
- **US2 Events, Payments, and QR Tickets (Phase 4)**: Depends on US1 auth/session.
- **US3 Courses and Protected Lessons (Phase 5)**: Depends on US1 auth/session and reuses payment foundation from US2.
- **US4 Notifications, Profile, and Settings (Phase 6)**: Depends on US1 auth/session.
- **US5 Scanner Mode (Phase 7)**: Depends on US1 auth/session and role-aware navigation; can run after Foundational plus US1.
- **Polish (Phase 8)**: Depends on selected stories being complete.

### User Story Dependencies

- **US1 (P1)**: Independent after Foundational; recommended MVP.
- **US2 (P1)**: Requires US1 session; otherwise independently testable with backend data.
- **US3 (P1)**: Requires US1 session; payment screen reuse from US2 is recommended before paid course completion.
- **US4 (P2)**: Requires US1 session; independent of US2/US3.
- **US5 (P2)**: Requires US1 session and scanner/admin test user; independent of US2/US3 UI.

### Dependency Graph

```text
Phase 1 Setup
  -> Phase 2 Foundational
    -> US1 Auth
      -> US2 Events/Payments/Tickets
      -> US3 Courses/Lessons
      -> US4 Notifications/Profile/Settings
      -> US5 Scanner
        -> Phase 8 Polish
```

---

## Parallel Execution Examples

### US1 Parallel Work

```text
T035 auth helper tests
T036 role-aware navigation tests
T038 auth API service
T039 auth query hooks
T040 auth route guards
```

### US2 Parallel Work

```text
T055 event API service
T061 payment API service
T067 ticket API service and hooks
T057 event card/detail components
T051-T054 tests and validation checklist
```

### US3 Parallel Work

```text
T078 course API service
T079 course hooks
T080 course/lesson components
T075-T077 tests and validation checklist
```

### US4 Parallel Work

```text
T095 notification API/hooks
T099 push notification helper
T100 profile API/hooks
T092-T094 tests and validation checklist
```

### US5 Parallel Work

```text
T109 scanner API/hooks
T110 scanner result component
T107-T108 tests and validation checklist
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 Setup.
2. Complete Phase 2 Foundational.
3. Complete US1 Mobile Foundation and Auth.
4. Stop and validate Android/iOS auth, SecureStore cleanup, protected navigation, and role-aware scanner hiding.

### Incremental Delivery

1. Add US2 Events, Payments, and QR Tickets after auth.
2. Add US3 Courses and Protected Lessons.
3. Add US4 Notifications, Profile, and Settings.
4. Add US5 Scanner Mode.
5. Complete Polish and final QA.

### Release Gate

Do not release until typecheck, lint, critical flow validation, backend regression checks, role/payment/QR/course backend-state verification, app metadata checks, and Android/iOS build readiness are complete.

---

## Summary

- **Total tasks**: 135
- **Setup tasks**: 11
- **Foundational tasks**: 23
- **US1 tasks**: 16
- **US2 tasks**: 24
- **US3 tasks**: 17
- **US4 tasks**: 15
- **US5 tasks**: 13
- **Polish tasks**: 16
- **MVP scope**: Phases 1-3, ending with authenticated protected navigation and role-aware scanner hiding.
