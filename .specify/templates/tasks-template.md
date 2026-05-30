---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL unless the
feature touches constitution-defined critical flows or the feature specification
explicitly requires tests/manual validation. Critical AMG flows include auth,
events, paid payments, QR wallet/scanner, courses, lessons, notifications,
profile/settings, role-aware navigation, and protected backend authorization.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **AMG API**: `apps/api/src/`
- **AMG Web app**: `apps/web/src/`
- **AMG Mobile app**: `apps/mobile/src/`
- **Shared packages**: `packages/shared/src/`, `packages/config/`
- Paths shown below assume single project - adjust based on plan.md structure

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /speckit-tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T004 Setup database schema and migrations framework
- [ ] T005 [P] Implement authentication/authorization framework
- [ ] T006 [P] Setup API routing and middleware structure
- [ ] T007 Create base models/entities that all stories depend on
- [ ] T008 Configure error handling and logging infrastructure
- [ ] T009 Setup environment configuration management
- [ ] T010 [P] Configure/upgrade shared AMG design tokens in [frontend]/tailwind.config.ts and global styles
- [ ] T011 [P] Upgrade shared UI primitives (Button, Card, Badge, Table, Modal, EmptyState, LoadingSkeleton) in [frontend]/src/components/
- [ ] T012 [P] Configure React Native / Expo `apps/mobile` structure, app shell/navigation, and shared UI/theme folders when mobile is in scope
- [ ] T013 [P] Configure mobile API environment separation for local, staging, and production URLs when mobile is in scope
- [ ] T014 [P] Configure secure mobile token storage and authenticated API client when mobile auth is in scope
- [ ] T015 [P] Wire mobile shared contracts from `packages/shared` or documented API contracts before creating feature screens

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T016 [P] [US1] Contract/API test for [endpoint] in [test path]
- [ ] T017 [P] [US1] Integration test for [user journey] in [test path]
- [ ] T018 [P] [US1] Browser/Playwright smoke test for [primary web route] at desktop and mobile viewport when web is affected
- [ ] T019 [P] [US1] Mobile validation or test for [primary mobile screen] on Android and iOS when mobile is affected
- [ ] T020 [P] [US1] Accessibility/usability check for forms, focus/tap states, icon labels, status text, and modals/sheets on [primary route/screen]

### Implementation for User Story 1

- [ ] T021 [P] [US1] Create/update shared types, schemas, or enums in `packages/shared/src/` if the API contract changes
- [ ] T022 [P] [US1] Create/update backend model/service/controller in `apps/api/src/` when backend state is required
- [ ] T023 [P] [US1] Create/update web component or route in `apps/web/src/` when web is affected
- [ ] T024 [P] [US1] Create/update mobile feature module, screen, hooks, and API service in `apps/mobile/src/` when mobile is affected
- [ ] T025 [US1] Add validation, loading, empty, error, success, permission, and session states
- [ ] T026 [US1] Confirm payment, QR, scanner, course access, and RBAC decisions come from backend state when applicable

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T027 [P] [US2] Contract/API test for [endpoint] in [test path]
- [ ] T028 [P] [US2] Integration test for [user journey] in [test path]
- [ ] T029 [P] [US2] Browser/Playwright smoke test for [primary web route] at desktop and mobile viewport when web is affected
- [ ] T030 [P] [US2] Mobile validation or test for [primary mobile screen] on Android and iOS when mobile is affected
- [ ] T031 [P] [US2] Accessibility/usability check for changed UI on [primary route/screen]

### Implementation for User Story 2

- [ ] T032 [P] [US2] Create/update shared contracts in `packages/shared/src/` if needed
- [ ] T033 [US2] Implement backend API/state changes in `apps/api/src/` if needed
- [ ] T034 [US2] Implement web UI changes in `apps/web/src/` if needed
- [ ] T035 [US2] Implement mobile UI/API integration in `apps/mobile/src/` if needed
- [ ] T036 [US2] Integrate with User Story 1 components/contracts if needed

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T037 [P] [US3] Contract/API test for [endpoint] in [test path]
- [ ] T038 [P] [US3] Integration test for [user journey] in [test path]
- [ ] T039 [P] [US3] Browser/Playwright smoke test for [primary web route] at desktop and mobile viewport when web is affected
- [ ] T040 [P] [US3] Mobile validation or test for [primary mobile screen] on Android and iOS when mobile is affected
- [ ] T041 [P] [US3] Accessibility/usability check for changed UI on [primary route/screen]

### Implementation for User Story 3

- [ ] T042 [P] [US3] Create/update shared contracts in `packages/shared/src/` if needed
- [ ] T043 [US3] Implement backend API/state changes in `apps/api/src/` if needed
- [ ] T044 [US3] Implement web UI changes in `apps/web/src/` if needed
- [ ] T045 [US3] Implement mobile UI/API integration in `apps/mobile/src/` if needed

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Responsive QA across desktop, tablet where distinct, and mobile viewports
- [ ] TXXX [P] Accessibility audit for keyboard navigation, focus states, labels, icon-only actions, modal behavior, and status text
- [ ] TXXX [P] Browser/Playwright regression pass for affected admin, user, auth, scanner, and utility routes
- [ ] TXXX [P] Console error check and screenshot/visual consistency pass for redesigned pages
- [ ] TXXX [P] Mobile Android/iOS validation pass for affected auth, events, payments, QR wallet, scanner, courses, lessons, notifications, profile/settings, and role navigation flows
- [ ] TXXX [P] Confirm secure mobile token storage, logout cleanup, protected route behavior, and session expiry behavior
- [ ] TXXX [P] Confirm mobile API loading states, caching, efficient lists, optimized images, and scanner responsiveness on representative devices/simulators
- [ ] TXXX [P] Confirm mobile app metadata, icons, splash placeholders, permissions, environment URLs, and Android/iOS quickstart docs when release/build configuration is affected
- [ ] TXXX Confirm frontend redesign did not change backend business logic without documented approval
- [ ] TXXX Confirm duplicate event registration and duplicate course enrollment CTAs are hidden or disabled when active records exist
- [ ] TXXX Confirm mobile payment, QR, scanner, course access, and RBAC states are backend-derived and not faked locally
- [ ] TXXX Confirm protected lesson/video URLs are not exposed as durable public URLs
- [ ] TXXX [P] Additional unit tests (if requested) in tests/unit/
- [ ] TXXX Security hardening
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Contract test for [endpoint] in tests/contract/test_[name].py"
Task: "Integration test for [user journey] in tests/integration/test_[name].py"

# Launch all models for User Story 1 together:
Task: "Create [Entity1] model in src/models/[entity1].py"
Task: "Create [Entity2] model in src/models/[entity2].py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
