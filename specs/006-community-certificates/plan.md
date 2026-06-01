# Implementation Plan: Community Learning and Certificates

**Branch**: `006-community-certificates` | **Date**: 2026-06-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-community-certificates/spec.md`; existing AMG Mobile V2 plan from `/specs/004-amg-mobile-v2/plan.md`; Constitution v1.2.0 from `/.specify/memory/constitution.md`

**Note**: This plan stages the full community learning feature but implements certificates first.

## Summary

Add three community learning capabilities to the existing AMG Academy monorepo:

1. Certificates with automatic draft creation, admin approval/release, AMG-branded PDF download, user/mobile wallet, and public QR verification.
2. Moderated case discussion with admin-approved posts, immediate comments, reporting, bookmarking, upvoting, and reply notifications.
3. Study groups with student-created and instructor-led modes, real-time chat, private shared files, and scheduled sessions.

MVP scope is Certificates. Case Discussion and Study Groups remain documented and task-ready for later phases.

---

## Technical Context

**Language/Version**: TypeScript strict mode across NestJS API, Next.js web, Expo mobile, and shared packages; Node.js 20+ and npm 10+.

**Primary Dependencies**:
- Existing NestJS API and Prisma/PostgreSQL models
- Existing Next.js admin/web app
- Existing Expo mobile app and authenticated API client
- Existing notification, audit log, role/permission, course, event, attendance, registration, enrollment, and video/storage patterns
- PDF generation library for certificate documents
- QR rendering/encoding for certificate verification links
- Future WebSocket gateway for study group real-time chat

**Storage**:
- PostgreSQL through Prisma remains source of truth.
- Certificate PDFs, case images, and study group files use private backend-controlled file access.
- Initial file provider may use Google Drive behind backend streaming/download endpoints; VPS storage remains a later provider.
- Public certificate verification must not expose storage provider links.

**Testing**:
- `npm run typecheck --workspaces --if-present`
- `npm run lint --workspaces --if-present`
- `npm run test --workspaces --if-present`
- `npm run build --workspaces --if-present`
- Web Playwright smoke/regression for admin certificate queue and public verification page
- Mobile Expo doctor/export and Android validation for certificate wallet

**Target Platform**: Web admin, public web verification, and Expo mobile app.

**Project Type**: Full-stack monorepo feature spanning API, web, mobile, shared packages, Prisma, and documentation.

**Performance Goals**:
- Certificate verification visible in under 3 seconds under normal conditions.
- Admin certificate queue paginates and filters without table jank.
- Mobile certificate wallet opens with stable loading/empty/error states.
- Future real-time study group messages reach online members within 2 seconds under normal conditions.

**Constraints**:
- Backend remains authoritative for certificate eligibility, moderation, study group membership, file access, and role permissions.
- Clients must not expose Drive/VPS direct links for protected assets.
- Certificate QR verification is separate from event attendance QR tickets.
- Public verification shows limited safe data only.
- Case posts require admin approval; comments do not require pre-approval.
- Study group chat must be real-time when that phase is implemented.

**Scale/Scope**:
- Single AMG Academy organization.
- Certificates first for events/courses.
- Cases and study groups after certificate MVP is verified.

---

## Constitution Check

| Gate | Requirement | Pass/Fail Notes |
|------|-------------|-----------------|
| Production Code Quality | Preserve strict TypeScript and avoid prototype code. | PASS - staged MVP keeps implementation bounded. |
| Shared Types/API Contracts | New status values and API shapes must be shared or documented. | PASS - shared certificate contracts are planned. |
| Backend State Authority | Certificate eligibility, moderation, membership, and file access remain backend-owned. | PASS - explicit source-of-truth rules. |
| Secure Auth/RBAC | Admin approval and private wallets/files require guarded backend endpoints. | PASS - admin/user/public boundaries are defined. |
| Payment Correctness | Certificate triggers depend on backend attendance/course completion, not client claims. | PASS - no client-generated eligibility. |
| QR/Scanner Reliability | Certificate QR is independent from event attendance QR. | PASS - separate verification contract. |
| Protected Course Access | Course certificates depend on backend completion and archived-course restrictions. | PASS - no protected video/file URLs exposed. |
| Premium UI/UX | Admin, public, and mobile surfaces reuse AMG patterns. | PASS - UI requirements included. |
| Component/Module Structure | Add feature modules without mixing business logic into UI. | PASS - API/web/mobile module boundaries planned. |
| States & Navigation | Loading/empty/error/permission/invalid states required. | PASS - included in spec and tasks. |
| Performance | Lists, verification, wallet, and future chat have explicit performance goals. | PASS - measurable targets included. |
| Critical Flow Testing | Certificate generation/approval/verification/wallet are critical. | PASS - verification commands and smoke tests required. |
| Accessibility/Usability | Public verification and admin actions need accessible status/action semantics. | PASS - requirements included. |
| App Store/Environment Readiness | Mobile certificate wallet affects APK validation but no new permissions. | PASS - Expo validation included. |
| Existing Web/API Regression | Events/courses/payments/QR should not regress. | PASS - certificate module integrates without rewriting core flows. |

**Post-design re-check**: PASS. Design artifacts preserve backend authority and stage future community phases safely.

---

## Project Structure

### Documentation

```text
specs/006-community-certificates/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── tasks.md
├── checklists/
│   ├── requirements.md
│   └── implementation.md
└── contracts/
    └── community-certificates-api-contracts.md
```

### Source Code

```text
apps/api/src/modules/certificates/
apps/api/src/modules/case-discussions/       # later phase
apps/api/src/modules/study-groups/           # later phase
apps/web/src/app/admin/certificates/
apps/web/src/app/certificates/verify/[code]/
apps/mobile/src/features/certificates/
packages/shared/src/types/
packages/shared/src/enums/
packages/shared/src/schemas/
```

---

## Phase 0: Research

See [research.md](research.md).

## Phase 1: Design and Contracts

See [data-model.md](data-model.md) and [contracts/community-certificates-api-contracts.md](contracts/community-certificates-api-contracts.md).

## Implementation Order

1. Certificate shared contracts and Prisma migration.
2. Certificate backend module: generation, admin review, user wallet, public verification, PDF download.
3. Admin certificate queue and public verification page.
4. Mobile certificate wallet.
5. Verification pass.
6. Case Discussion implementation.
7. Study Groups implementation with real-time chat.
