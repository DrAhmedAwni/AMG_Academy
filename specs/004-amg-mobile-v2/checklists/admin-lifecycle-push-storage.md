# Admin Lifecycle, Push, QR, Roles, And Storage Checklist

**Purpose**: Track implementation of the agreed product rules for admin actions, event/course lifecycle, QR validity, duplicate prevention, mobile push notifications, role scoping, and protected course video storage.
**Created**: 2026-06-01
**Feature**: [AMG Academy Mobile App V2](../spec.md)

## Lifecycle And Destructive Actions

- [x] CHK001 Event delete behavior archives/cancels/ends records instead of hard-deleting free or paid events.
- [x] CHK002 Cancelled events notify registered users automatically and move related payments to a refund-review state where applicable.
- [x] CHK003 Refunded payments can be marked refunded by an admin after review.
- [x] CHK004 Archived or ended events no longer accept new registrations.
- [x] CHK005 Archived courses are hidden from catalog and block access for existing enrolled users.
- [ ] CHK006 Admin UI labels match the real action: archive, cancel, disable, revoke, refund, or delete.
- [ ] CHK007 Hard delete remains unavailable or guarded for records with payments, registrations, attendance, QR tickets, enrollments, or progress.

## Duplicate Prevention

- [x] CHK008 A user cannot register twice for the same event.
- [x] CHK009 A user cannot enroll twice in the same course.
- [x] CHK010 Duplicate attempts return a clear conflict error and do not create duplicate payments.

## QR Tickets

- [x] CHK011 QR tickets expire from backend event timing, not from stored images.
- [x] CHK012 QR tickets become invalid when their event is cancelled, archived, ended, or past the configured grace period.
- [x] CHK013 Scanner validation rejects expired, revoked, wrong-event, unpaid, unapproved, and cancelled-event tickets.
- [x] CHK014 User ticket wallet shows expired/revoked/cancelled tickets clearly and never shows them as active.
- [x] CHK015 QR images are generated dynamically from backend-approved payloads unless a future storage requirement explicitly needs persisted images.

## Announcements And Push

- [x] CHK016 Announcement creation supports selected target roles/groups.
- [x] CHK017 Publishing an announcement creates in-app notifications for targeted users.
- [x] CHK018 Publishing an announcement sends mobile push notifications to registered device tokens.
- [x] CHK019 Mobile app registers and unregisters Expo push tokens for the signed-in user.
- [x] CHK020 Invalid/stale push tokens are ignored or cleaned up safely.

## Roles And Permissions

- [x] CHK021 Scanner role sees and accesses only scanner/attendance surfaces.
- [x] CHK022 Instructor role manages only their own courses and lessons.
- [x] CHK023 User/admin navigation hides irrelevant modules per role.
- [x] CHK024 Backend guards enforce the same permissions that the UI hides.

## Course Video Storage

- [x] CHK025 Google Drive can be used first as the storage backend for lesson videos.
- [x] CHK026 Google Drive links are never exposed directly to mobile users.
- [x] CHK027 Lesson playback goes through backend authorization before streaming.
- [ ] CHK028 Mobile lesson player only offers play, pause, seek/progress, and playback speed controls.
- [x] CHK029 Storage is abstracted so Google Drive can later be replaced by VPS storage without rewriting mobile playback.
- [x] CHK030 Archived courses block video playback even for previously enrolled users.

## Verification

- [x] CHK031 Typecheck, lint, tests, and builds pass after implementation.
- [x] CHK032 Web admin smoke checks cover lifecycle wording and role navigation.
- [x] CHK033 Mobile checks cover QR/ticket states, push token registration, and lesson access states.
