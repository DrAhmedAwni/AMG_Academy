# Scanner Validation

Feature: Phase 7 - User Story 5
Date: 2026-05-30

## Automated Validation

- `npm run typecheck -w @amg/mobile`: passed
- `npm run lint -w @amg/mobile`: passed
- `npm run test -w @amg/mobile -- --runInBand`: passed
- `npm run typecheck -w @amg/api`: passed
- `npm run typecheck -w @amg/shared`: passed

## Manual Role And Access Checklist

- Normal users do not see the scanner tab.
- Normal users opening `/scanner`, `/scanner/scan`, `/scanner/result`, or `/scanner/recent` see a permission denied state.
- Scanner, staff, or admin users see the scanner tab and can open scanner event selection.
- Scanner event selection loads backend events and supports loading, empty, error, and refresh states.
- Scanner recent scans use the backend attendance endpoint guarded by scanner permission.

## Manual Scan Result Checklist

- Camera permission prompt appears before scanning.
- Camera denial shows a clear permission state and does not call the scan endpoint.
- Valid QR scan calls `/qr/scan` and shows success with attendee, event, and check-in time.
- Duplicate scan shows already checked in / duplicate state.
- Wrong event scan shows wrong-event state.
- Pending or missing paid payment shows unpaid state.
- Pending registration approval shows unapproved state.
- Expired ticket shows expired state.
- Revoked ticket shows revoked state.
- Unknown or malformed QR shows invalid or not-found state.
- Result screen allows fast scan-again and recent-scan navigation.
- Scan to backend result timing should remain under 1 second on local/staging under normal conditions.

## Device Validation

- Android normal-user scanner hiding and scanner/admin route access: not run in this environment.
- Android scan result states and QR validation timing: not run in this environment.
- iOS camera permission and scanner flow readiness: not run in this environment.
