# AMG Academy Mobile Release Checklist

Date: 2026-05-30

## Environment

- Local API URL documented in `.env.example`.
- Android emulator API URL documented as `http://10.0.2.2:4000/api/v1`.
- Staging API URL documented.
- Production API URL documented.
- Production mock payments disabled with `EXPO_PUBLIC_ENABLE_MOCK_PAYMENTS=false`.
- No private secrets are documented as `EXPO_PUBLIC_*`.

## App Metadata

- App name: `AMG Academy`.
- Slug: `amg-academy-mobile`.
- Scheme: `amgacademy`.
- iOS bundle identifier: `com.amgacademy.mobile`.
- Android package: `com.amgacademy.mobile`.
- Dark UI style enabled.

## Assets And Permissions

- Development icon placeholder exists.
- Development splash placeholder exists.
- Development adaptive icon placeholder exists.
- Notification icon placeholder exists.
- Camera permission copy explains staff QR validation.
- Notification permission copy explains event, course, ticket, and announcement updates.
- Replace SVG placeholders with production-ready PNG assets before store submission.

## Backend Authority

- Auth/session uses backend `/auth/*` and SecureStore session material.
- Events, reservations, payments, QR tickets, courses, enrollments, notifications, profile, and scanner flows consume NestJS API endpoints.
- Mobile does not directly access PostgreSQL or Prisma.
- Payment, QR, scanner, lesson, and RBAC unlock decisions are backend-derived.

## Release Gates

- Mobile TypeScript passes.
- Mobile lint passes.
- Mobile tests pass.
- API typecheck passes.
- API regression tests are run or documented if blocked.
- Shared package typecheck passes.
- Android device validation complete.
- iOS device validation complete where available.
- Web payment and QR ticket route compatibility checked.
- Manual validation docs updated for any device-only gaps.
