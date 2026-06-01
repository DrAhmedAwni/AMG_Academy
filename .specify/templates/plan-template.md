# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]

**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]

**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]

**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]

**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]

**Project Type**: [e.g., library/cli/web-service/mobile-app/compiler/desktop-app or NEEDS CLARIFICATION]

**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]

**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]

**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Requirement | Pass/Fail Notes |
|------|-------------|-----------------|
| Production Code Quality | Feature preserves TypeScript strictness, avoids prototype code, and does not duplicate backend business logic in clients. | [PASS/FAIL + notes] |
| Shared Types/API Contracts | Plan reuses `packages/shared`, Prisma/Zod-derived types, or documented API contracts instead of hand-written duplicate contracts. | [PASS/FAIL + notes] |
| Backend State Authority | Mobile/web clients consume the NestJS API; payment, registration, QR, course access, scanner validation, and RBAC decisions remain backend-owned. | [PASS/FAIL + notes] |
| Secure Auth/RBAC | Token storage, protected routes, logout, session expiry, role-aware navigation, and hidden scanner/admin screens are planned and backed by server authorization. | [PASS/FAIL + notes] |
| Payment Correctness | Paid event/course flows use backend payment records; mock payment is labeled; QR and lesson unlocks wait for backend eligibility. | [PASS/FAIL + notes] |
| QR/Scanner Reliability | Scanner plan covers success, duplicate, wrong-event, unpaid, unapproved, expired, revoked, and not-found states with camera-first UX. | [PASS/FAIL + notes] |
| Protected Course Access | Lesson/video access is backend-authorized; protected video URLs are not exposed as durable public URLs; locked lessons are clear. | [PASS/FAIL + notes] |
| Premium UI/UX | User-facing work follows AMG dark-first tokens, cyan/teal accents, glass cards, rounded components, status badges, and touch-friendly layouts. | [PASS/FAIL + notes] |
| Component/Module Structure | Plan identifies reusable components, mobile feature modules under `apps/mobile`, and avoids one-off styling or unnecessary libraries. | [PASS/FAIL + notes] |
| States & Navigation | Affected screens include loading, empty, error, success, validation, permission, and session states plus role-aware navigation behavior. | [PASS/FAIL + notes] |
| Performance | Lists, images, caching, scanner, navigation, and lesson/player surfaces are designed for smooth mid-range Android/iOS and existing web performance budgets. | [PASS/FAIL + notes] |
| Critical Flow Testing | Login/register/logout, events, payments, QR wallet/scanner, courses, lessons, notifications, profile/settings, and role navigation have tests or manual validation. | [PASS/FAIL + notes] |
| Accessibility/Usability | Dark contrast, tap targets, labels, icon accessibility, form validation, status text, and destructive confirmations are planned. | [PASS/FAIL + notes] |
| App Store/Environment Readiness | Local/staging/production API URLs, app metadata/icons/splash placeholders, permissions, and Android/iOS quickstart impacts are covered when mobile is affected. | [PASS/FAIL + notes] |
| Existing Web/API Regression | Plan states how changes avoid breaking existing Next.js web, NestJS API, Prisma schema, payments, QR, events, courses, notifications, RBAC, and scanner logic. | [PASS/FAIL + notes] |

For mobile features, this plan MUST list target screens, backend endpoints,
shared types/contracts, secure storage strategy, role/payment/QR/course state
ownership, Android/iOS validation targets, and quickstart/app-store impacts.

For frontend redesign features, this plan MUST list target screens, shared
components to change, browser/Playwright QA routes and viewports, and any
backend changes with rationale.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: AMG monorepo mobile + existing API
apps/
├── api/                 # Existing NestJS backend API
├── web/                 # Existing Next.js web app
└── mobile/              # Mobile app phase
    ├── app/             # Expo Router route files when Expo Router is used
    └── src/
        ├── components/
        ├── features/
        ├── hooks/
        ├── lib/
        ├── services/
        ├── theme/
        └── types/

packages/
├── shared/              # Shared Zod schemas, types, enums
└── config/              # Shared TypeScript/lint/tooling config
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
