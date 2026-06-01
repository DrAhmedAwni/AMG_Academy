# Implementation Checklist: Community Learning and Certificates

**Purpose**: Track implementation completion for the staged feature
**Created**: 2026-06-01
**Feature**: [spec.md](../spec.md)

## Certificates MVP

- [x] CHK001 Prisma schema includes Certificate, CertificateTemplate, certificate status/source enums, unique user/source constraints, and migration.
- [x] CHK002 Shared package exposes certificate source/status types and wallet/verification DTO types.
- [x] CHK003 API certificate module lists the current user's released certificates.
- [x] CHK004 API certificate module exposes public verification with safe limited details.
- [x] CHK005 API certificate module supports admin review queue, release, revoke, void, and repair generation.
- [x] CHK006 API certificate generation is triggered by event attendance and course completion without duplicate active certificates.
- [x] CHK007 Certificate PDFs are generated with AMG branding and stored behind backend-controlled access.
- [x] CHK008 Admin certificate queue page supports filtering, review actions, empty/loading/error states, and permission handling.
- [x] CHK009 Public verification page supports valid, invalid, revoked/voided, and missing states.
- [x] CHK010 Mobile certificate wallet/profile section displays released certificates and download/verification actions.
- [x] CHK011 Audit logs capture admin certificate release/revoke/void actions.
- [x] CHK012 Tests/builds pass for API, web, mobile, and shared packages.

## Case Discussion (Complete)

- [x] CHK013 Prisma schema includes CasePost, CaseImage, CaseComment, CaseCategory, votes, bookmarks, and reports.
- [x] CHK014 API supports case submit, admin approve/reject, public approved browsing, comments, reports, upvotes, bookmarks, and notifications.
- [x] CHK015 Web/mobile case forum includes de-identification reminders and moderation states.
- [x] CHK016 Admin moderation queue supports approve/reject/hide/remove flows.

## Study Groups (Complete)

- [x] CHK017 Prisma schema includes StudyGroup, StudyGroupMember, StudyGroupMessage, StudyGroupFile, and StudyGroupSession.
- [x] CHK018 API supports student-created open/closed groups and instructor-led course groups.
- [x] CHK019 Real-time chat is authenticated, membership-guarded, persisted, and push-notification aware.
- [x] CHK020 Study group files use backend-controlled private access without public storage links.
- [x] CHK021 Web/mobile study group screens support groups, members, chat, files, and sessions.
