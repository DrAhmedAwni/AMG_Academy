<!--
  Sync Impact Report
  ==================
  Version change: v1.1.0 -> v1.2.0
  Modified principles:
    - 1. Production-Ready Code Only -> Production-Ready Code Quality
    - 2. Strong Type Safety -> Strict TypeScript and Shared Contracts
    - 3. API Consistency -> Backend API Reuse and State Authority
    - 4. Testing Critical Workflows -> Secure Authentication and Authorization
    - 5. Premium Dark-First AMG UI/UX -> Payment State Correctness
    - 6. Reusable Premium UI Components -> QR Ticket and Scanner Reliability
    - 7. Complete Screen States and Responsive Behavior -> Protected Course Access and Video Security
    - 8. Premium Admin Operations Reliability -> Premium Dark-First AMG UI/UX Consistency
    - 9. Security and Access Control -> Maintainable Components and Feature Modules
    - 10. Performance Requirements for Premium UI -> Complete States and Role-Aware Navigation
    - 11. Database and Data Integrity -> Mobile and Web Performance Requirements
    - 12. Accessibility and Keyboard Usability -> Testing Standards for Critical Flows
    - 13. Maintainability and Future Mobile Readiness -> Accessibility and Mobile Usability
    - 14. Definition of Done with UI/UX QA -> App Store and Environment Readiness
    - 15. Release Blocking Rules with UI Regression Gates -> Definition of Done and Release Blocking Rules
  Added sections:
    - Mobile V2 backend/API source-of-truth rules
    - Mobile secure token storage and role-aware navigation rules
    - Mobile payment, QR scanner, protected course, performance, and app store readiness rules
  Removed sections: None; prior web/backend governance is retained through expanded principles
  Templates requiring updates:
    - .specify/templates/plan-template.md: updated
    - .specify/templates/spec-template.md: updated
    - .specify/templates/tasks-template.md: updated
    - .specify/templates/commands/*.md: not present
  Runtime guidance:
    - docs/PRD-mobile-v2.md read and reflected in the mobile V2 principles.
  Follow-up TODOs: None
-->

# AMG Academy Platform Constitution

**Version**: 1.2.0 | **Ratified**: 2026-05-27 | **Last Amended**: 2026-05-29

## Preamble

This constitution establishes the non-negotiable engineering, product, security,
and design standards for the AMG Academy Platform and AMG Academy Mobile App V2.
It applies to the existing monorepo, including the NestJS API, PostgreSQL
database, Prisma schema, Next.js web app, shared packages, and the planned
mobile app under `apps/mobile`.

Every contributor, reviewer, and maintainer MUST follow these principles.
Exceptions MUST follow the governance process defined below.

---

## Core Principles

### 1. Production-Ready Code Quality

All production code MUST be clean, typed, maintainable, and ready for real AMG
Academy users. Prototype code, throwaway implementations, commented-out
experiments, debug artifacts, and unused code are prohibited.

- TypeScript strictness MUST be preserved across `apps/api`, `apps/web`,
  `apps/mobile`, and shared packages.
- Business logic MUST NOT live inside presentation components.
- Mobile screens MUST NOT duplicate backend business rules for payment,
  registration, QR validity, course access, scanner validation, or RBAC.
- Existing shared types, Zod schemas, enums, and API contracts MUST be reused
  where they apply before creating mobile-only equivalents.
- New abstractions MUST reduce real duplication or match an established local
  pattern; speculative abstractions are prohibited.
- The implementation MUST NOT break existing web or backend behavior while
  adding mobile functionality.

**Rationale**: AMG Academy operations include payments, attendance, protected
course access, and staff workflows. Production code MUST be reliable enough for
those responsibilities from the first release.

**Enforcement**: Code review, linting, TypeScript checks, and feature QA MUST
reject prototype-quality code and duplicated business rules.

---

### 2. Strict TypeScript and Shared Contracts

TypeScript MUST remain strict and explicit throughout the monorepo.

- The `any` type MUST be avoided unless a local, reviewed justification explains
  why a safer type is not practical.
- API request and response shapes MUST be typed.
- Prisma models, DTOs, form schemas, navigation params, API hooks, and mobile
  view models MUST use explicit types.
- Shared status values MUST use shared enums or literal unions, including
  registration, payment, QR ticket, attendance, course, enrollment, lesson,
  notification, user, role, and permission statuses.
- Mobile API clients MUST consume typed contracts from `packages/shared` or the
  documented API contract. Duplicated hand-written mobile types are allowed only
  when the shared package cannot represent a mobile view model, and the mapping
  MUST be explicit.

**Rationale**: Shared, strict types prevent the mobile app, web app, API, and
database from drifting apart.

**Enforcement**: CI MUST fail on TypeScript errors. Reviews MUST reject new
untyped API boundaries and undocumented `any` usage.

---

### 3. Backend API Reuse and State Authority

The NestJS backend API and PostgreSQL database are the source of truth for AMG
Academy state. The mobile app MUST consume the existing versioned API, starting
with `/api/v1` unless a reviewed API version change is approved.

- Mobile MUST NOT connect directly to PostgreSQL, Prisma, or private backend
  internals.
- Payment, registration, QR ticket, course access, scanner validation, role,
  permission, notification, and profile decisions MUST come from backend state.
- Mobile MUST NOT invent frontend-only business rules for eligibility,
  paid/free access, approval, scanner permissions, or lesson locking.
- Frontend checks MAY improve UX by hiding unavailable actions, but backend
  authorization remains mandatory and authoritative.
- Backend API changes for mobile MUST preserve web compatibility unless the
  plan documents the migration and approval.
- API responses MUST keep a consistent success/error envelope, predictable
  status codes, and stable error codes for mobile UX states.

**Rationale**: One source of truth prevents payment bypasses, invalid QR tickets,
wrong course access, and role inconsistencies across web and mobile.

**Enforcement**: Mobile feature plans MUST identify the backend endpoints used.
Reviews MUST reject client-only state transitions for protected workflows.

---

### 4. Secure Authentication and Authorization

Authentication and authorization MUST be secure on web and mobile.

- Mobile tokens MUST be stored with secure platform storage, such as Keychain on
  iOS and Keystore-backed secure storage on Android.
- Tokens MUST NOT be stored in plain AsyncStorage, local files, logs, URLs, or
  analytics payloads.
- Protected mobile routes and screens MUST require authentication.
- Role-aware navigation MUST be enforced in the app shell.
- Scanner, admin, instructor, and privileged screens MUST be hidden from users
  without the required role or permission.
- Hidden navigation is not authorization. Backend guards MUST still enforce
  every protected endpoint.
- Logout MUST clear stored tokens, cached private data, and authenticated
  navigation state.
- Expired sessions MUST send the user through a clear re-authentication flow.

**Rationale**: Mobile devices are long-lived, portable, and often shared. Token
storage and route protection MUST assume real-world loss and misuse risks.

**Enforcement**: Auth, logout, route guard, and role navigation behavior MUST be
tested or manually validated for every mobile release.

---

### 5. Payment State Correctness

Paid event and paid course flows MUST use backend payment records and backend
eligibility decisions.

- Mobile MUST request payment state from the backend; it MUST NOT mark a payment
  successful locally.
- Mock payment flows MUST be clearly labeled in UI and code, and MUST NOT be
  confused with production payment confirmation.
- QR tickets MUST NOT become active unless backend registration, approval, and
  payment state allow activation.
- Paid course lessons MUST remain locked until backend course access allows
  playback.
- Payment redirects, return screens, and refresh actions MUST reconcile with the
  backend payment record before showing success.
- Manual/offline payment verification MUST remain permission-protected and
  audit-logged on the backend.

**Rationale**: Payment state controls financial access, attendance rights, and
course content. Local optimism cannot be allowed to grant access.

**Enforcement**: Paid event registration, paid course enrollment, payment
redirect return, and payment refresh flows are release-blocking checks.

---

### 6. QR Ticket and Scanner Reliability

QR ticket validity MUST come from backend validation. The scanner flow MUST be
fast, camera-first, and explicit about every result state.

- QR tokens MUST remain secure, unique, non-predictable, revocable, and
  non-reusable.
- Mobile ticket screens MUST display only tickets the backend says the user may
  view.
- Scanner validation MUST call the backend for the selected event and scanned
  token.
- Scanner UI MUST clearly show success, duplicate, wrong-event, unpaid,
  unapproved, expired, revoked, and not-found states.
- Scanner UI MUST keep the camera as the primary interaction and allow rapid
  follow-up scans after a result is acknowledged.
- Rejected scans SHOULD be recorded by the backend where audit requirements
  apply.
- A text fallback ticket code MUST be available where QR rendering or scanning
  fails.

**Rationale**: Event check-in is time-sensitive and security-sensitive. Staff
need instant, unambiguous feedback without weakening validation.

**Enforcement**: Scanner validation, duplicate prevention, wrong-event handling,
and unpaid/unapproved rejection MUST be tested or manually validated before
release.

---

### 7. Protected Course Access and Video Security

Lesson and video access MUST depend on backend authorization.

- Mobile MUST NOT expose protected video URLs directly as durable public URLs.
- Video playback MUST use an authorized backend stream endpoint or an approved
  short-lived provider URL issued only after backend access checks.
- Paid course lessons MUST be visually locked until backend enrollment and
  payment state allow access.
- Lesson lists, progress, and playback controls MUST reflect backend course
  access state.
- Direct deep links to locked lessons MUST re-check backend authorization before
  rendering content.
- Mobile SHOULD block screenshots or screen recording on protected course
  screens where technically supported, while recognizing that complete capture
  prevention is not guaranteed.

**Rationale**: AMG Academy course videos are protected educational assets and
MUST NOT be unlocked by client navigation or leaked URLs.

**Enforcement**: Protected lesson access, direct-link denial, paid course lock
states, and video playback authorization are release-blocking checks.

---

### 8. Premium Dark-First AMG UI/UX Consistency

AMG Academy user experiences MUST match the redesigned premium dark UI direction
across web and mobile.

**Design language**:

- Dark-first premium AMG Academy surfaces.
- Cyan/teal primary accent.
- Glass cards and elevated dark surfaces.
- Rounded components with restrained depth.
- Clear status badges with text labels.
- Touch-friendly layouts on mobile.
- Professional dental education tone; no generic template styling.

**Authoritative visual tokens**:

| Role | Color |
|---|---|
| Background Main | `#020617` |
| Background Secondary | `#071114` |
| Surface | `#0F172A` |
| Surface Elevated | `#111827` |
| Surface Glass | `rgba(15, 23, 42, 0.72)` |
| Primary Accent | `#54D9E8` |
| Primary Accent Hover | `#67E8F9` |
| Primary Glow | `rgba(84, 217, 232, 0.35)` |
| Text Primary | `#F8FAFC` |
| Text Secondary | `#94A3B8` |
| Text Muted | `#64748B` |
| Border | `#1E293B` |
| Border Strong | `#334155` |
| Success | `#22C55E` |
| Warning | `#F59E0B` |
| Error | `#EF4444` |
| Info | `#38BDF8` |
| Purple Accent | `#8B5CF6` |

Typography MUST use Hanken Grotesk or Inter for headings and Inter for body
text, labels, inputs, tables, and mobile controls where technically practical.

**Rationale**: The mobile app MUST feel like the same AMG Academy product as
the redesigned web app, not a separate or lower-quality companion.

**Enforcement**: Design review MUST validate tokens, shared components, status
colors, spacing, loading/empty/error/success states, and touch ergonomics.

---

### 9. Maintainable Components and Feature Modules

The monorepo MUST stay modular and understandable as mobile is added.

- `apps/mobile` MUST use a clean, discoverable React Native / Expo-compatible
  folder structure organized around app shell/navigation, shared UI, API
  services, hooks, tokens, utilities, and feature modules.
- When Expo Router is used, route files SHOULD live under `apps/mobile/app/`
  and reusable implementation code SHOULD live under `apps/mobile/src/`.
- Feature modules SHOULD map to product domains such as auth, events, payments,
  QR tickets, scanner, courses, lessons, notifications, profile, settings, and
  admin/staff tools.
- Components MUST be small enough to review and maintain. Data fetching,
  formatting, business mapping, and presentation SHOULD be separated where it
  improves clarity.
- Shared UI primitives MUST be reused before one-off screen styling is added.
- Status badges, cards, buttons, forms, empty states, loading states, and error
  states MUST use shared components.
- Adding a new library MUST be justified by real value, maintenance cost, bundle
  impact, and platform compatibility.

**Rationale**: Mobile V2 will span many existing domains. A clean structure
keeps the app extensible without duplicating the web or backend in miniature.

**Enforcement**: Reviews MUST reject unclear feature placement, one-off repeated
components, and unnecessary dependencies.

---

### 10. Complete States and Role-Aware Navigation

Every screen MUST handle all states needed for its workflow.

- Loading states MUST appear for API work.
- Empty states MUST explain what is missing and the next available action.
- Error states MUST provide useful feedback and retry where appropriate.
- Success states MUST confirm completed actions.
- Permission-denied states MUST be explicit and MUST NOT expose protected data.
- Session-expired states MUST route clearly back to authentication.
- Validation errors MUST be visible near the relevant field.
- Role-aware navigation MUST prevent unauthorized scanner/admin screens from
  appearing for normal users.
- Mobile layouts MUST be touch-friendly, readable, and free of text overlap,
  clipped buttons, hidden primary actions, or navigation collisions.

**Rationale**: Most AMG Academy workflows depend on async backend state. Missing
states create confusion and support burden.

**Enforcement**: A screen or feature is incomplete if any required loading,
empty, error, success, permission, session, or validation state is missing.

---

### 11. Mobile and Web Performance Requirements

AMG Academy experiences MUST remain smooth on representative desktop browsers
and mid-range Android and iOS devices.

| Metric | Target |
|---|---|
| Standard API response under normal load | Under 500 ms |
| QR scan to validation result | Under 1 second |
| Mobile navigation transition | Smooth, without visible jank |
| User-facing list scroll | Smooth on mid-range devices |

**Rules**:

- Long lists MUST use efficient list rendering and pagination or incremental
  loading.
- Images MUST be optimized, sized appropriately, cached where practical, and
  lazy-loaded when off screen.
- API loading states and caching MUST be used where they reduce repeated network
  calls without showing stale security-sensitive state.
- Heavy libraries MUST NOT be added without a documented reason and review.
- Scanner and lesson player code SHOULD load progressively where practical.
- Premium effects MUST be restrained and MUST NOT make navigation, scrolling,
  scanning, forms, or tables sluggish.
- Admin and user web lists MUST remain server-paginated.

**Rationale**: The app MUST feel premium on real devices, not only on a
developer workstation.

**Enforcement**: Performance-sensitive flows MUST be checked during QA,
especially event/course lists, QR wallet, scanner, notifications, and lessons.

---

### 12. Testing Standards for Critical Flows

Critical AMG Academy flows MUST be covered by automated tests or clearly
documented manual validation when automation is not yet practical.

The following flows are critical:

- Login, register, and logout.
- Protected route access and session expiry.
- Role-aware navigation.
- Events list, event details, and event registration.
- Paid event payment redirect and backend reconciliation.
- QR ticket wallet.
- Course catalog, course details, and enrollment.
- Paid course payment redirect and backend reconciliation.
- Lesson player access control.
- Notifications.
- Profile and settings.
- Scanner QR validation.
- Admin/scanner screen authorization.

**Testing layers**:

- Backend unit and integration tests MUST cover payment, registration, QR,
  course access, scanner validation, and RBAC state transitions.
- Mobile tests SHOULD cover critical UI and navigation behavior where tooling is
  available.
- Manual validation MUST record device/platform, API environment, test account
  role, and result for any critical flow not automated.
- TypeScript and lint checks MUST pass before completion.

**Rationale**: These flows are where users pay, enter events, access paid
content, and where staff enforce permissions.

**Enforcement**: A critical mobile flow cannot be marked done without either a
passing test or documented manual validation evidence.

---

### 13. Accessibility and Mobile Usability

AMG Academy web and mobile experiences MUST be readable, operable, and clear.

- Dark backgrounds MUST maintain readable contrast.
- Tap targets MUST be large enough for comfortable mobile use.
- Status MUST NOT be communicated by color alone; use text labels and icons
  where helpful.
- Icon buttons MUST include accessible labels where the platform supports them.
- Forms MUST have clear labels, validation messages, and error feedback.
- Focus states, keyboard navigation, and screen reader semantics MUST be
  preserved on web.
- Mobile navigation, dialogs, sheets, and scanner controls MUST be understandable
  without relying on visual decoration alone.
- QR tickets MUST include a text fallback code.
- Destructive actions MUST use confirmation patterns.

**Rationale**: Accessibility and usability are core quality requirements, not
polish after the main implementation.

**Enforcement**: Reviews MUST check contrast, labels, tap targets, form
feedback, status text, and destructive confirmations.

---

### 14. App Store and Environment Readiness

Mobile V2 MUST be prepared for local development, staging validation, production
release, and app store submission.

- Local, staging, and production API URLs MUST be separated by environment.
- The app MUST NOT hardcode production-only API URLs in source code.
- App metadata, identifiers, icons, splash placeholders, permissions, and build
  configuration MUST be prepared before release.
- Camera permission copy MUST support the scanner flow.
- Build documentation MUST explain Android and iOS development builds.
- Quickstart documentation MUST include the commands and environment variables
  required to run the mobile app against local/staging APIs.
- Release builds MUST be checked against the intended backend environment.

**Rationale**: Mobile apps require platform configuration and store assets that
cannot be left until the final release day.

**Enforcement**: Mobile release candidates MUST include environment, build, icon,
splash, permission, and quickstart checks.

---

### 15. Definition of Done and Release Blocking Rules

A mobile task is complete only when all applicable items are true:

- TypeScript passes.
- Lint passes.
- The screen or feature follows AMG Academy design tokens.
- Loading, empty, error, and success states are handled.
- Authentication, permission, and session states are handled where applicable.
- Backend API integration is used correctly.
- Role, payment, QR, scanner, and course access states are not faked.
- Critical flow behavior is tested or manually validated.
- The implementation does not break existing web or backend functionality.
- App store, environment, or quickstart documentation is updated when affected.

A release MUST be blocked if any of the following are true:

- Login, registration, logout, or protected routes are broken.
- Role-aware navigation exposes scanner/admin screens to unauthorized users.
- Backend RBAC can be bypassed.
- Event registration or course enrollment duplicates are possible.
- Payment state can be bypassed or faked.
- QR tickets activate before backend eligibility allows it.
- Scanner accepts duplicate, wrong-event, unpaid, unapproved, expired, revoked,
  or otherwise invalid tickets.
- Paid course lessons or videos are accessible without backend authorization.
- Protected video URLs are exposed as durable public URLs.
- Notifications, profile, or settings flows corrupt user data.
- Mobile UI has unreadable contrast, blocked tap targets, or broken primary
  navigation.
- Critical tests or documented manual validation are missing.
- Existing web or backend P0 behavior regresses.

**Rationale**: Done means safe for users and staff, not merely visually present.

**Enforcement**: The Definition of Done MUST be completed in PR/task notes before
merge or release approval.

---

## Governance

### Amendment Procedure

1. Any team member MAY propose an amendment by creating a PR against this
   document.
2. The PR MUST document:
   - The principle being modified, added, or removed
   - The reason for the change
   - The risk of not making the change
   - Any migration plan for existing code that will fall out of compliance
3. The amendment MUST be reviewed by at least one senior contributor.
4. Ahmed Developer is the primary approver and MUST sign off on all amendments.

### Exception Process

Any exception to a principle MUST be documented with:

- **Principle being bypassed**: Which numbered principle is violated
- **Reason**: Why the exception is necessary
- **Risk**: What could go wrong
- **Mitigation**: How the risk is reduced or accepted
- **Review date**: When the exception will be reassessed
- **Approval**: Signed off by Ahmed Developer

Exceptions expire on their review date and MUST be either resolved or renewed.

### Versioning Policy

This constitution follows semantic versioning:

- **MAJOR**: Backward-incompatible governance changes, principle removals, or
  redefinitions.
- **MINOR**: New principles or materially expanded guidance.
- **PATCH**: Clarifications, wording fixes, non-semantic refinements.

This amendment is a MINOR update because it materially expands governance for
the new mobile app phase without removing existing web/backend obligations.

### Compliance Review

- Every PR MUST reference the relevant principles.
- Spec Kit plans MUST include a constitution compliance check.
- Mobile plans MUST identify target screens, backend endpoints, role/payment/QR
  state ownership, testing/manual validation evidence, and app store readiness
  impacts where applicable.
- A full compliance audit SHOULD be conducted before every major release.

---

**Version**: 1.2.0 | **Ratified**: 2026-05-27 | **Last Amended**: 2026-05-29
