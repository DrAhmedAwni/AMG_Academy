# AMG Academy Mobile App V2 — Product Requirements Document

## 1. Project Identity

| Field                             | Value                        |
| --------------------------------- | ---------------------------- |
| Project Name                      | AMG Academy Mobile App V2    |
| Project ID                        | PRD-MOBILE-002               |
| Version                           | v2.0                         |
| Status                            | Draft                        |
| Priority                          | High                         |
| Owner / PM                        | Ahmed Developer              |
| Product Type                      | Native Mobile App            |
| Target Platforms                  | iOS and Android              |
| Related Product                   | AMG Academy Web App V1       |
| Backend                           | Existing NestJS API          |
| Database                          | Existing PostgreSQL database |
| Recommended Mobile App Path       | `apps/mobile`                |
| Recommended Spec Kit Feature Path | `specs/004-amg-mobile-v2`    |

---

## 2. Background

AMG Academy Platform V1 already has a working web app, backend, database, admin console, user dashboard, event registration, paid/free event support, payment tracking, QR tickets, attendance scanning, courses, enrollments, protected lessons, announcements, notifications, reports, exports, RBAC, and a premium dark UI/UX design system.

The next phase is to build a native mobile app for Android and iOS using the same backend, same database, same business rules, and the same visual direction as the redesigned web app.

The mobile app should not rebuild backend logic. It should consume the existing API and create a premium mobile experience for users, event attendees, learners, scanner staff, instructors, and admins where needed.

---

## 3. Problem Statement

AMG Academy users need a mobile-first way to browse events, register, pay, access QR tickets, receive notifications, watch courses, and scan event attendance. The web app works, but a native mobile app will provide a better event-day experience, better course access, stronger push notifications, and a more polished academy experience.

Admins and scanner staff also need mobile-friendly access to operational workflows such as QR scanning and attendance check-in.

---

## 4. Product Purpose

The purpose of AMG Academy Mobile App V2 is to provide a premium native mobile app for AMG Academy users and staff while reusing the existing backend and database.

The mobile app must allow users to:

* Register and sign in.
* Browse events.
* Register for free and paid events.
* Complete mock payment flow for paid events and courses until Paymob is ready.
* View registration status.
* Access QR tickets.
* Receive announcements and notifications.
* Browse courses.
* Enroll in free and paid courses.
* Watch protected video lessons.
* Track course progress.
* Manage profile and settings.
* Use scanner mode if they have scanner/admin permissions.

---

## 5. Goals and Objectives

### Primary Goal

Build a production-ready native mobile app for AMG Academy using the existing backend, PostgreSQL database, API contracts, and premium web UI/UX direction.

### Objectives

1. Add a new mobile app inside the existing monorepo under `apps/mobile`.
2. Reuse existing backend APIs instead of duplicating business logic.
3. Reuse shared TypeScript types, enums, and validation schemas where possible from `packages/shared`.
4. Match the premium dark AMG Academy UI/UX from the redesigned web app.
5. Support core user flows: authentication, events, registrations, payments, QR tickets, courses, lessons, notifications, profile, and settings.
6. Support scanner mode for authorized scanner/admin staff.
7. Prepare mobile push notification support.
8. Prepare Android and iOS app store readiness.
9. Keep the mobile app maintainable, typed, and scalable.

---

## 6. Success Definition

The mobile app is successful when:

1. A user can register, sign in, and access their mobile dashboard.
2. A user can browse events and register for free events.
3. A user can register for paid events and complete the mock payment flow.
4. A user can view registration and payment status.
5. A user can access valid QR tickets.
6. Scanner staff can scan QR tickets and see clear success/error states.
7. A user can browse courses and enroll in free or paid courses.
8. A user can watch protected lessons only after enrollment/payment access is valid.
9. A user can see notifications and announcements.
10. The mobile app visually matches the premium web UI/UX direction.
11. The app works on Android and iOS development builds.
12. Type checking, linting, and critical flow testing pass.

---

## 7. Scope

## 7.1 In Scope

### Mobile App Foundation

* Create `apps/mobile`.
* Configure React Native / Expo mobile app.
* Configure TypeScript.
* Configure navigation.
* Configure environment variables.
* Configure API client.
* Configure authentication storage.
* Configure shared types import from `packages/shared`.
* Configure app theme based on web UI/UX tokens.

### Authentication

* Login.
* Register.
* Logout.
* Token refresh where supported by backend.
* Current user session.
* Protected routes.
* Role-aware navigation.

### User Dashboard

* Welcome card.
* Upcoming events.
* QR ticket shortcut.
* Continue learning.
* Announcements.
* Notifications preview.

### Events

* Events list.
* Event filters.
* Event search.
* Event details.
* Free event registration.
* Paid event registration.
* Redirect to payment screen for paid events.
* Registration status display.
* My reservations.

### Payments

* Mobile payment screen for mock payments.
* Payment summary.
* Mock payment success/fail/cancel actions.
* Payment status display.
* Link payments to event registrations and course enrollments.
* Show pending, successful, failed, cancelled, refunded, and manually verified states.
* Prepare provider-ready structure for future Paymob integration.

### QR Tickets

* QR ticket wallet.
* QR ticket details.
* Valid, used, expired, revoked, and not issued states.
* Large scannable QR display.
* Event check-in instructions.

### Courses

* Course catalog.
* Course filters.
* Course details.
* Free course enrollment.
* Paid course enrollment.
* Redirect to payment screen for paid courses.
* My courses.
* Lesson list.
* Protected lesson player.
* Progress state.
* Locked lesson state.

### Notifications and Announcements

* Notification inbox.
* Notification read/unread state.
* Announcement cards.
* Push notification preparation.

### Profile and Settings

* Profile view.
* Edit profile.
* Notification preferences.
* Password/settings links where supported.
* Logout.

### Scanner Mode

* Scanner event selection.
* Camera-based QR scanning.
* Scan result screen.
* Success, duplicate, invalid, unpaid, wrong-event, expired, and rejected states.
* Recent scans list.

### Admin / Staff Mobile Access

* Lightweight admin/staff screens only where useful on mobile.
* Admin payment visibility if permission exists.
* Event registration visibility if permission exists.
* Scanner-first operations should be prioritized over full desktop admin replication.

---

## 7.2 Out of Scope

* Rebuilding backend business logic.
* Rebuilding database architecture.
* Replacing the existing web app.
* Real Paymob integration until credentials/API are ready.
* Apple/Google in-app purchases.
* Offline-first full app mode.
* Full advanced LMS features.
* Community/forum features.
* AI assistant.
* Multi-organization support.
* Complete desktop admin dashboard inside mobile.
* Full Arabic/RTL support unless already supported by existing backend/content.

---

## 8. Users and Personas

### Persona 1 — Dentist / AMG Academy Student

Uses the app to browse events, register, pay, view QR tickets, receive announcements, and learn from courses.

### Persona 2 — Event Attendee

Uses the app mainly on event day to access QR tickets, event details, location, and status.

### Persona 3 — AMG Academy Admin

Uses mobile for quick status checks, payment visibility, event registrations, and scanner-related operations.

### Persona 4 — Scanner Staff

Uses the mobile app camera to scan QR tickets and check attendees into events.

### Persona 5 — Instructor

Uses the app to view assigned courses and learner/course information if permissions allow.

---

## 9. Design Requirements

The mobile app must follow the same premium AMG Academy UI/UX direction as the redesigned web app.

### Visual Style

* Dark-first interface.
* Deep black and dark navy backgrounds.
* Glassmorphism cards.
* Cyan / teal primary actions.
* Rounded cards and buttons.
* Premium academy/congress dashboard style.
* Clear status pills.
* Clean typography.
* High contrast.
* Touch-friendly spacing.

### Recommended Design Tokens

* Background Main: `#020617`
* Background Surface: `#0F172A`
* Surface Elevated: `#111827`
* Primary Accent: `#54D9E8`
* Primary Accent Hover: `#67E8F9`
* Text Primary: `#F8FAFC`
* Text Secondary: `#94A3B8`
* Border: `#1E293B`
* Success: `#22C55E`
* Warning: `#F59E0B`
* Error: `#EF4444`
* Info: `#38BDF8`
* Purple Accent: `#8B5CF6`

### UX Requirements

* Mobile-first layout.
* Bottom tab navigation for normal users.
* Role-aware scanner/admin access.
* Large tap targets.
* Clear loading states.
* Clear empty states.
* Clear error states.
* Confirmation for destructive or important actions.
* Toast/snackbar feedback for success and failure.
* No hidden critical statuses.
* Payment and registration state must be clear at all times.

---

## 10. Navigation Requirements

### User Bottom Tabs

* Home
* Events
* Tickets
* Courses
* Profile

### Optional Secondary Screens

* Notifications
* Settings
* Payment
* Course lesson player
* Event details
* Course details
* My reservations
* My courses

### Staff / Scanner Access

Scanner mode should be accessible only for users with scanner/admin permissions.

Scanner navigation:

* Select Event
* Scan QR
* Recent Scans
* Scan Result

### Admin Access

Admin mobile access should be lightweight and permission-aware. Full admin console does not need to be replicated if the web admin already exists.

---

## 11. Functional Requirements

### FR-001 — Mobile App Foundation

The system must add a native mobile app to the existing monorepo under `apps/mobile`.

Acceptance Criteria:

* Mobile app runs on Android development environment.
* Mobile app runs on iOS development environment where available.
* TypeScript is configured.
* Navigation is configured.
* API client is configured.
* Environment variables are configured.
* Shared types can be imported where feasible.
* App uses AMG Academy dark design tokens.

---

### FR-002 — Authentication

Users must be able to sign in, register, maintain session, and log out.

Acceptance Criteria:

* User can open login screen.
* User can sign in with valid credentials.
* User sees validation errors for invalid credentials.
* Auth token/session is stored securely.
* User can log out.
* Protected screens redirect unauthenticated users to login.
* Role-aware navigation is shown after login.

---

### FR-003 — Mobile Dashboard

Users must see a personalized dashboard after login.

Acceptance Criteria:

* Dashboard shows welcome message.
* Dashboard shows upcoming events.
* Dashboard shows QR ticket shortcut.
* Dashboard shows continue learning section.
* Dashboard shows announcements or notifications preview.
* Empty states appear when there are no events, courses, or notifications.

---

### FR-004 — Events

Users must be able to browse, search, filter, view, and register for events.

Acceptance Criteria:

* Events list shows event cards.
* Event cards show title, status, category, date, location, price, and CTA.
* Event details show full information.
* Free event registration follows existing backend flow.
* Paid event registration creates or uses a payment checkout and sends user to payment screen.
* Registration status is visible.
* My reservations screen shows user registrations.

---

### FR-005 — Payments

Users must be able to complete mock payment flow for paid events and paid courses.

Acceptance Criteria:

* Payment screen shows item type, title, amount, currency, user, and status.
* Mock payment mode is clearly labeled.
* User can simulate successful payment.
* User can simulate failed payment.
* User can cancel payment.
* Successful payment updates backend payment state.
* Failed/cancelled payment blocks QR ticket and course access.
* Payment states are shown consistently.

---

### FR-006 — QR Ticket Wallet

Users must be able to access their event QR tickets.

Acceptance Criteria:

* Ticket wallet shows all available user tickets.
* Ticket card shows event title, date, location, registration status, payment status, and attendance status.
* QR code is large and scannable.
* Used, expired, revoked, and not issued states are clear.
* Pending/unpaid registrations do not show active scannable tickets.

---

### FR-007 — Course Catalog and Enrollment

Users must be able to browse courses and enroll.

Acceptance Criteria:

* Course catalog shows course cards.
* Course cards show title, instructor, category, price, lessons, and progress where available.
* Course details show description and lessons.
* Free course enrollment grants access based on backend rules.
* Paid course enrollment redirects to payment screen.
* My courses shows enrolled courses.
* Locked courses/lessons show clear state.

---

### FR-008 — Lesson Player

Users must be able to watch protected lessons after valid enrollment/payment access.

Acceptance Criteria:

* Lesson player shows video area.
* Lesson list/playlist is available.
* User can move to next lesson.
* User can mark complete where supported.
* Locked lessons are blocked.
* Protected video access depends on backend authorization.
* Visible download controls are avoided where technically supported.

---

### FR-009 — Notifications and Announcements

Users must be able to view notifications and announcements.

Acceptance Criteria:

* Notification inbox shows read/unread state.
* User can open a notification.
* Announcements are visible in dashboard or notifications area.
* Push notification token registration is prepared if supported.
* Notification preferences are shown where supported.

---

### FR-010 — Profile and Settings

Users must be able to view and update profile data.

Acceptance Criteria:

* Profile screen shows name, email, phone, specialty, clinic, city, and avatar if available.
* Edit profile screen allows updating permitted fields.
* Settings screen shows notification preferences and logout.
* User receives success/error feedback after updates.

---

### FR-011 — Scanner Mode

Authorized scanner/admin users must be able to scan QR tickets.

Acceptance Criteria:

* Scanner mode is hidden from unauthorized users.
* Scanner can select an event.
* Camera scanner opens.
* Valid QR shows success result.
* Duplicate QR shows duplicate result.
* Wrong event QR shows wrong-event result.
* Unpaid/unapproved QR shows rejection.
* Expired/revoked QR shows rejection.
* Recent scans list is visible.

---

### FR-012 — App Store Readiness Preparation

The mobile app should be structured for future Android and iOS deployment.

Acceptance Criteria:

* App name and basic metadata are prepared.
* Environment config separates local/staging/production API URLs.
* App icons/splash placeholders are prepared.
* Build commands are documented.
* Quickstart explains how to run the app.

---

## 12. Non-Functional Requirements

### Performance

* Main screens should feel responsive on mid-range phones.
* Lists should use efficient scrolling.
* Images should be optimized.
* API requests should show loading states.
* Navigation should feel smooth.
* Avoid heavy unnecessary libraries.

### Security

* Tokens must be stored securely.
* Users must only access their own registrations, payments, tickets, courses, and profile.
* Scanner/admin features must remain permission-protected.
* Payment amount must come from backend, not frontend.
* Protected video access must depend on backend authorization.

### Accessibility

* Text must be readable on dark backgrounds.
* Tap targets must be large enough.
* Icons must have accessible labels where possible.
* Status should include text, not only color.
* Forms must show validation messages.

### Maintainability

* Code must be modular.
* Shared components should be used.
* Feature folders should be clear.
* API logic should be centralized.
* Business logic should remain in backend.

---

## 13. Suggested Mobile Folder Structure

```txt
apps/mobile/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── home.tsx
│   │   ├── events.tsx
│   │   ├── tickets.tsx
│   │   ├── courses.tsx
│   │   └── profile.tsx
│   ├── events/
│   │   └── [eventId].tsx
│   ├── courses/
│   │   ├── [courseId].tsx
│   │   └── lesson/[lessonId].tsx
│   ├── payments/
│   │   └── [paymentId].tsx
│   ├── scanner/
│   │   ├── index.tsx
│   │   └── scan.tsx
│   ├── notifications.tsx
│   └── settings.tsx
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── cards/
│   │   ├── forms/
│   │   ├── layout/
│   │   └── states/
│   ├── features/
│   │   ├── auth/
│   │   ├── events/
│   │   ├── payments/
│   │   ├── tickets/
│   │   ├── courses/
│   │   ├── notifications/
│   │   ├── profile/
│   │   └── scanner/
│   ├── hooks/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── storage.ts
│   │   └── queryClient.ts
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── tokens.ts
│   └── types/
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 14. Recommended Implementation Phases

### Phase 1 — Mobile Foundation

* Create `apps/mobile`.
* Configure Expo / React Native.
* Configure TypeScript.
* Configure navigation.
* Configure API client.
* Configure secure token storage.
* Configure theme tokens.
* Configure shared types imports.

### Phase 2 — Authentication

* Login.
* Register.
* Session loading.
* Logout.
* Protected routes.
* Role-aware navigation.

### Phase 3 — User Dashboard and Navigation

* Bottom tabs.
* Home dashboard.
* Notifications preview.
* Quick access cards.

### Phase 4 — Events and Reservations

* Events list.
* Event details.
* Free registration.
* Paid registration redirect to payment.
* My reservations.

### Phase 5 — Payments and QR Tickets

* Payment screen.
* Mock payment actions.
* QR ticket wallet.
* Ticket details.

### Phase 6 — Courses and Lessons

* Course catalog.
* Course details.
* Free/paid enrollment.
* My courses.
* Lesson player.

### Phase 7 — Scanner Mode

* Event selection.
* Camera QR scanner.
* Scan result states.
* Recent scans.

### Phase 8 — Profile, Settings, Notifications

* Profile.
* Edit profile.
* Settings.
* Notifications.
* Announcements.

### Phase 9 — QA and App Store Preparation

* Android test.
* iOS test where available.
* Environment setup.
* App icon/splash placeholders.
* Quickstart docs.
* Regression testing.

---

## 15. QA Requirements

Test these flows:

1. App opens correctly.
2. Login works.
3. Register works.
4. Logout works.
5. Protected screens require login.
6. Events load.
7. Event details load.
8. Free event registration works.
9. Paid event redirects to payment screen.
10. Mock payment success updates status.
11. QR wallet shows valid tickets.
12. Pending/unpaid tickets are blocked.
13. Courses load.
14. Free course enrollment works.
15. Paid course redirects to payment screen.
16. Lesson player blocks locked lessons.
17. Notifications load.
18. Profile loads and updates.
19. Scanner mode is hidden for normal users.
20. Scanner mode works for scanner/admin users.
21. Dark design system is consistent.
22. Android build runs.
23. iOS build is prepared.

---

## 16. Definition of Done

The mobile app phase is done when:

* `apps/mobile` exists and runs.
* Authentication works.
* Main user tabs work.
* Events flow works.
* Payment flow works for paid events/courses.
* QR wallet works.
* Courses and lessons work.
* Scanner mode works for authorized users.
* Profile and notifications work.
* App uses AMG Academy premium dark UI/UX.
* Backend business logic is reused, not duplicated.
* Type checking passes.
* Linting passes.
* Critical flows are tested.
* Quickstart documentation exists.
