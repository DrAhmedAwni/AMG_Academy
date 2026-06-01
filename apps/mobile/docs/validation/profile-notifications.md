# Notifications, Profile, and Settings Validation

Feature: Phase 6 - User Story 4
Date: 2026-05-30

## Automated Validation

- `npm run typecheck -w @amg/mobile`: passed
- `npm run lint -w @amg/mobile`: passed
- `npm run test -w @amg/mobile -- --runInBand`: passed
- `npm run typecheck -w @amg/api`: passed
- `npm run typecheck -w @amg/shared`: passed

## Manual Flow Checklist

- Notifications inbox loads with loading, empty, error, and success states.
- Notifications show read/unread visual state (unread has colored dot, accent title, elevated background).
- Tapping an unread notification marks it read and resets the query cache.
- "Mark All Read" button marks all notifications read with loading feedback.
- Published announcements appear in the notifications feed alongside in-app notifications.
- Tapping a notification with an entityType/entityId deep-links to the target screen.
- Profile tab loads user data from `/users/profile` with name, email, role, badges, and optional fields.
- Profile tab shows scanner/standard access badge based on backend role/permissions.
- Profile tab links to Notifications, Settings, My Courses, and My Reservations.
- Settings screen loads notification preferences from `/notifications/preferences`.
- Toggling a preference switch calls `PATCH /notifications/preferences` and refetches.
- Change Password button navigates to password change screen.
- Logout button clears SecureStore and private query cache.
- Profile, Settings, and Notifications screens show clear loading, empty, and error states.

## Device Validation

- Android: not run in this environment.
- iOS: not run in this environment.
