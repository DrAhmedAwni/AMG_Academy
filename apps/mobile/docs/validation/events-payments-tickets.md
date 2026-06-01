# Events, Payments, and QR Tickets Validation

Feature: Phase 4 - User Story 2
Date: 2026-05-30

## Automated Validation

- `npm run typecheck -w @amg/mobile`: passed
- `npm run lint -w @amg/mobile`: passed
- `npm run test -w @amg/mobile -- --runInBand`: passed
- `npm run typecheck -w @amg/api`: passed
- `npm run typecheck -w @amg/shared`: passed

## Manual Flow Checklist

- Login with a real backend user before opening protected event, payment, or ticket screens.
- Events tab loads published backend events with search, free/paid filters, loading, empty, error, and refresh states.
- Event detail uses backend `registrationStatus`, `paymentStatus`, `qrTicketStatus`, and `paymentId` for CTA state.
- Free event registration posts to `/registrations` and appears in My Reservations.
- Paid event registration posts to `/registrations` and redirects to `/payments/:paymentId` when the backend returns a pending payment.
- Mock payment screen is clearly labeled and calls backend `mock-success`, `mock-fail`, and `mock-cancel` endpoints.
- QR wallet shows QR codes only when backend ticket state is active, registration is approved, payment is satisfied, and `qrPayload` is present.
- Ticket wallet clearly shows active, not issued, used, expired, revoked, unpaid, and unapproved states.
- Existing web and backend payment, event, registration, and QR flows remain compatible.

## Device Validation

- Android: not run in this environment.
- iOS: not run in this environment.
