# Tasks: Community Learning and Certificates

**Input**: Design documents from `/specs/006-community-certificates/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/community-certificates-api-contracts.md](contracts/community-certificates-api-contracts.md)

**Tests**: Required for certificate-critical flows because credentials affect official user records and public verification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup and Documentation

- [x] T001 Update `AGENTS.md` SpecKit context to include `specs/006-community-certificates/plan.md`
- [x] T002 [P] Add certificate requirements checklist in `specs/006-community-certificates/checklists/implementation.md`
- [x] T003 [P] Document certificate API contract in `specs/006-community-certificates/contracts/community-certificates-api-contracts.md`

---

## Phase 2: Foundational Certificate Infrastructure

- [x] T004 Add certificate enums/models/migration in `apps/api/prisma/schema.prisma`
- [x] T005 [P] Add certificate status/source shared types in `packages/shared/src/enums/status.enums.ts` and `packages/shared/src/types/domain.types.ts`
- [x] T006 [P] Add certificate permissions to seed/permission setup in `apps/api/src/modules/permissions` or Prisma seed files
- [x] T007 Install or configure PDF/QR generation dependencies in `apps/api/package.json`
- [x] T008 Create certificate module skeleton in `apps/api/src/modules/certificates/`
- [x] T009 Register certificate module in `apps/api/src/app.module.ts`

---

## Phase 3: User Story 1 - Certificate Wallet and Verification (Priority: P1) MVP

**Goal**: Generate certificate drafts, release them through admin review, show them to users, download PDFs, and verify QR links publicly.

**Independent Test**: Complete one event/course eligibility scenario, release certificate as admin, view/download as user, and open public verification URL.

### Tests for User Story 1

- [ ] T010 [P] [US1] Add API tests for duplicate certificate prevention and safe public verification in `apps/api/src/modules/certificates/`
- [ ] T011 [P] [US1] Add mobile certificate mapping tests in `apps/mobile/src/features/certificates/__tests__/`
- [ ] T012 [P] [US1] Add web smoke/e2e coverage for admin queue and public verification in `apps/web/e2e/`

### Implementation for User Story 1

- [x] T013 [US1] Implement `CertificatesService` generation, list, release, revoke, void, download, and verification logic in `apps/api/src/modules/certificates/certificates.service.ts`
- [x] T014 [US1] Implement protected/public/admin certificate controllers in `apps/api/src/modules/certificates/certificates.controller.ts`
- [x] T015 [US1] Trigger certificate generation from attendance and enrollment progress in `apps/api/src/modules/qr-tickets/qr-tickets.service.ts` and `apps/api/src/modules/enrollments/enrollments.service.ts`
- [x] T016 [US1] Add certificate PDF generation/storage helper in `apps/api/src/modules/certificates/`
- [x] T017 [US1] Add admin certificate queue UI in `apps/web/src/app/admin/certificates/page.tsx`
- [x] T018 [US1] Add public verification page in `apps/web/src/app/certificates/verify/[code]/page.tsx`
- [x] T019 [US1] Add certificate wallet API/hooks/components in `apps/mobile/src/features/certificates/`
- [x] T020 [US1] Add mobile certificate wallet/profile route in `apps/mobile/app/`
- [x] T021 [US1] Add admin navigation and middleware permission mapping for certificates in `apps/web/src/components/layouts/admin-layout.tsx` and `apps/web/src/middleware.ts`
- [x] T022 [US1] Run migration, regenerate Prisma client, and update `specs/006-community-certificates/checklists/implementation.md`

---

## Phase 4: User Story 2 - Moderated Case Discussion (Priority: P2)

- [x] T023 [P] [US2] Add case discussion schema/migration in `apps/api/prisma/schema.prisma`
- [x] T024 [US2] Implement case discussion API module in `apps/api/src/modules/case-discussions/`
- [x] T025 [US2] Add web/mobile case forum, case detail, and submission UI in `apps/web/src/` and `apps/mobile/src/`
- [x] T026 [US2] Add admin moderation queue and comment report handling in `apps/web/src/app/admin/`

---

## Phase 5: User Story 3 - Study Groups With Real-Time Chat (Priority: P3)

- [x] T027 [P] [US3] Add study group schema/migration in `apps/api/prisma/schema.prisma`
- [x] T028 [US3] Implement study group API module in `apps/api/src/modules/study-groups/`
- [x] T029 [US3] Implement authenticated real-time chat gateway in `apps/api/src/modules/study-groups/`
- [x] T030 [US3] Add study group file upload/download with private backend access in `apps/api/src/modules/study-groups/`
- [x] T031 [US3] Add web/mobile study group screens for groups, members, chat, files, and sessions

---

## Final Phase: Verification and Release Readiness

- [x] T032 Run `npm run typecheck --workspaces --if-present`
- [x] T033 Run `npm run lint --workspaces --if-present`
- [x] T034 Run `npm run test --workspaces --if-present`
- [x] T035 Run `npm run build --workspaces --if-present`
- [x] T036 Run web Playwright smoke/regression for certificate admin and public verification routes
- [x] T037 Run mobile `npx expo-doctor` and Android export/build validation
- [x] T038 Update `specs/006-community-certificates/checklists/implementation.md` with final completion status

---

## Implementation Strategy

1. Finish Phase 1 and Phase 2 setup.
2. Complete only User Story 1 for the first MVP.
3. Stop and validate certificate generation, admin release, user wallet, PDF download, and public QR verification.
4. Implement Case Discussion after certificates are stable.
5. Implement Study Groups last because real-time chat and private files are the largest new surface.
