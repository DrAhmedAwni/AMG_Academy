# Courses and Protected Lessons Validation

Feature: Phase 5 - User Story 3
Date: 2026-05-30

## Automated Validation

- `npm run typecheck -w @amg/mobile`: passed
- `npm run lint -w @amg/mobile`: passed
- `npm run test -w @amg/mobile -- --runInBand`: passed
- `npm run typecheck -w @amg/api`: passed
- `npm run typecheck -w @amg/shared`: passed

## Manual Flow Checklist

- Courses tab loads published backend courses with search, free/paid filter, loading, empty, error, and refresh states.
- Course detail uses backend `isEnrolled`, `paymentStatus`, and `paymentId` for CTA state (enroll, pay, continue).
- Free course enrollment posts to `/enrollments` and re-fetches course detail; lessons become accessible immediately.
- Paid course enrollment posts to `/enrollments` and redirects to `/payments/:paymentId` when backend returns a pending payment.
- Payment screen (mock) offers success, fail, cancel actions; success redirects back to course detail with lessons unlocked.
- My Courses screen lists enrolled courses with progress bar, payment status badge, and Pay Now / Continue buttons.
- Locked lesson placeholder appears on course detail when payment is pending or enrollment is missing for a paid course.
- Lesson player checks backend video authorization via `GET /videos/:id/stream` before showing playback.
- Lesson player shows a permission-denied state when the backend rejects the stream request (unpaid / unenrolled).
- Lesson player shows a playback-ready state when the backend authorizes the stream.
- No durable public video URLs are stored or exposed; all streaming is authorized per-request.

## Device Validation

- Android: not run in this environment.
- iOS: not run in this environment.
