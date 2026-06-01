# Final QA Validation

Feature: AMG Academy Mobile App V2
Date: 2026-05-30

## Automated Checks

- `npm run typecheck -w @amg/mobile`: passed
- `npm run lint -w @amg/mobile`: passed
- `npm run test -w @amg/mobile -- --runInBand`: passed; 11 suites, 59 tests
- `npm run typecheck -w @amg/api`: passed
- `npm run test -w @amg/api -- --runInBand`: did not pass because the API workspace currently has no `*.spec.ts` tests; Jest exited with `No tests found`
- `npm run typecheck -w @amg/shared`: passed
- `npm run typecheck -w @amg/web`: passed

## Backend-Derived State Confirmation

- Mobile auth uses `/auth/login`, `/auth/register`, `/auth/me`, `/auth/refresh`, `/auth/logout`, and SecureStore token/session material.
- Events and reservations use `/events` and `/registrations`; CTA states are display helpers only.
- Paid event and paid course payment screens use `/payments/:id` and backend mock action endpoints.
- Mock payment actions are available only when the backend payment provider is mock and `EXPO_PUBLIC_ENABLE_MOCK_PAYMENTS` is not `false`.
- QR wallet uses `/qr-tickets` and displays QR payload only when backend ticket state allows it.
- Scanner mode uses `/qr/scan`; success, duplicate, wrong-event, unpaid, unapproved, expired, revoked, not-found, and invalid states are mapped from backend responses.
- Course enrollment uses `/enrollments`; paid lesson locks depend on backend enrollment/payment state.
- Notifications and profile use backend notification/profile endpoints.
- Scanner tab and routes are hidden/guarded from normal users based on backend role/permissions from `/auth/me`.

## Protected Lesson And Video Confirmation

- Lesson rows open the lesson player with the backend `videoId`, not a public provider URL.
- Lesson player calls `GET /videos/:id/stream` through the authenticated API client before showing a ready state.
- The UI no longer prints or stores the stream endpoint in visible text.
- The mobile video access helper returns only provider/availability state, not a public or tokenized video URL.
- The removed `buildAuthorizedVideoUrl(videoId, token)` helper prevents tokenized URLs from being assembled in mobile code.
- The backend stream endpoint remains guarded by `JwtAuthGuard` and `VideosGuard`.

## Existing Web Compatibility

- `apps/web/src/app/(user)/payment/[paymentId]/page.tsx` still calls existing `/payments/:paymentId` and `/payments/:paymentId/mock-success|mock-fail|mock-cancel` endpoints.
- `apps/web/src/app/(user)/my-qr-tickets/page.tsx` still reads `/qr-tickets` and tolerates the enriched wallet payload by using the existing `id`, `event`, `status`, `fallbackCode`, and `issuedAt` fields.
- Web typecheck result: passed.

## Device Validation Gaps

- Android device validation remains not run in this environment.
- iOS device validation remains not run in this environment.
- Camera timing, QR scan latency, native push prompt behavior, and native app store screenshots require a real device or simulator pass.
