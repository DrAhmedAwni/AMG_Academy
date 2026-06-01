# Research: AMG Academy Mobile App V2

**Date**: 2026-05-29
**Feature**: AMG Academy Mobile App V2
**Spec**: [spec.md](spec.md)

---

## Decision: React Native with Expo

**Decision**: Build the mobile app with React Native and Expo inside `apps/mobile`.

**Rationale**:
- Matches the PRD recommendation.
- Supports Android and iOS development builds from one TypeScript codebase.
- Provides first-party modules for secure storage, camera, notifications, app metadata, icons, splash, and build workflows.
- Fits the existing npm workspace monorepo.

**Alternatives considered**:
- Bare React Native: More native control, but more setup and app-store build friction.
- Native Swift/Kotlin: Best platform control, but duplicates product work and slows V2 delivery.
- Mobile web/PWA: Faster to ship, but does not meet the native mobile app goal.

---

## Decision: Expo Router for Navigation

**Decision**: Use Expo Router with route groups for auth, tabs, events, courses, payments, scanner, notifications, and settings.

**Rationale**:
- Matches the PRD folder structure.
- Keeps route files discoverable in `apps/mobile/app`.
- Supports protected route patterns and role-aware route groups.
- Makes deep links to event, payment, course, lesson, and scanner screens easier to reason about.

**Alternatives considered**:
- React Navigation manual stacks: Mature, but route structure is less aligned with the requested file-based layout.
- Custom navigation state: Rejected because it adds risk and maintenance cost.

---

## Decision: TanStack Query for Server State

**Decision**: Use TanStack Query for backend server state, caching, mutations, refetch, pagination, and loading/error/success states.

**Rationale**:
- The web platform already planned TanStack Query for server state.
- It provides predictable query invalidation after login, logout, payment actions, registrations, enrollment, notification read state, and scans.
- It avoids ad hoc loading and cache logic in screens.

**Alternatives considered**:
- Global state store for all API data: Rejected because it encourages stale security-sensitive state.
- Custom `useEffect` data fetching: Rejected because caching, refetching, and mutation states would be duplicated across screens.

---

## Decision: SecureStore for Auth Session Material

**Decision**: Store mobile auth token/session material only in Expo SecureStore through a narrow storage wrapper.

**Rationale**:
- Constitution requires secure token storage.
- SecureStore maps to platform-backed secure storage.
- A wrapper allows auth cleanup, key naming, migration, and test substitution.

**Alternatives considered**:
- AsyncStorage: Rejected for auth material because it is not secure enough.
- Plain local files: Rejected for the same reason.
- Keeping auth only in memory: Safer but would log users out on every app restart.

---

## Decision: Existing NestJS API Remains Source of Truth

**Decision**: Mobile consumes existing `/api/v1` APIs and does not implement payment, registration, QR, scanner, course, lesson, notification, or RBAC business rules locally.

**Rationale**:
- Constitution and PRD both require backend reuse.
- PostgreSQL and Prisma-backed services already own the domain state.
- One source of truth prevents payment bypass, invalid QR tickets, and unauthorized lessons.

**Alternatives considered**:
- Mobile-local eligibility checks: Allowed only for display hints, rejected for authoritative decisions.
- Direct database access: Rejected for security and architecture reasons.
- Separate mobile backend: Rejected because it would duplicate business logic.

---

## Decision: Mobile Auth Transport Compatibility

**Decision**: Use existing auth endpoints and backend auth service. If native clients cannot reliably persist httpOnly cookie values, add a backwards-compatible mobile transport extension that returns token values for SecureStore while preserving web cookies and backend guards.

**Rationale**:
- Current backend login writes web cookies.
- The PRD and constitution require SecureStore on mobile.
- A transport extension does not duplicate auth business logic; it only exposes the existing backend session material in a native-app-compatible way.

**Alternatives considered**:
- Rely only on native cookie persistence: Possible, but unreliable across Expo/runtime combinations and harder to inspect.
- Store user profile without tokens: Rejected because protected API calls need authenticated requests.

---

## Decision: Expo Camera or Compatible QR Scanner

**Decision**: Start with Expo Camera for scanner mode, with the option to use a compatible QR scanner library if Expo Camera does not meet scan reliability.

**Rationale**:
- Expo Camera is aligned with Expo development builds and app permissions.
- Scanner mode is camera-first and must be fast.
- Keeping the scanner dependency small supports performance and app-store readiness.

**Alternatives considered**:
- Heavy all-in-one scanner SDK: Rejected unless Expo Camera proves insufficient.
- Manual QR token entry only: Rejected because scanner staff need camera-first check-in.

---

## Decision: Expo Notifications Preparation

**Decision**: Prepare Expo Notifications structure and permission handling, but keep production push delivery optional for this phase.

**Rationale**:
- PRD requires push preparation.
- Backend notification abstraction already exists and can add push later.
- This avoids blocking the mobile app on final push provider decisions.

**Alternatives considered**:
- Full push implementation in initial release: Deferred to avoid coupling release to provider credentials and production device tokens.
- No push preparation: Rejected because future push is a stated V2 objective.

---

## Decision: AMG Dark Theme Tokens in `src/theme`

**Decision**: Define colors, typography, spacing, radii, shadows/elevation, and status mappings in `apps/mobile/src/theme`.

**Rationale**:
- Constitution requires premium dark AMG UI consistency.
- Mobile components need the same cyan/teal, glass card, dark surface, and status badge language as web.
- Central tokens prevent one-off styling.

**Alternatives considered**:
- Copy web Tailwind classes directly: Rejected because React Native styling is different.
- Per-screen inline colors: Rejected because it causes drift.

---

## Decision: No Mobile Database or Business Rule Duplication

**Decision**: Do not add a mobile database or offline-first mode in V2 planning.

**Rationale**:
- PRD says offline-first is out of scope.
- Backend state is required for payments, QR, scanner, RBAC, and protected lessons.
- Local persistence beyond secure auth state risks stale sensitive decisions.

**Alternatives considered**:
- SQLite cache: Deferred until a concrete offline requirement exists.
- Full offline scanner: Rejected because QR validity must come from backend.
