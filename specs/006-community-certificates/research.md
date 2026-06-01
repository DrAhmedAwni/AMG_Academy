# Research: Community Learning and Certificates

**Date**: 2026-06-01
**Feature**: Community Learning and Certificates
**Plan**: [plan.md](plan.md)

---

## Decision: Start With Certificates as MVP

**Rationale**: Certificates reuse current event attendance and course completion state and deliver immediate business value. Case discussion and study groups add larger moderation and real-time surfaces, so they should follow once the credential path is stable.

**Alternatives considered**:
- Build all three features together: rejected because it creates too much simultaneous backend, web, mobile, storage, and moderation surface.
- Start with study groups: rejected because real-time chat and private file sharing are the largest risk area.

---

## Decision: Auto-Generate Certificate Drafts, Then Require Admin Release

**Rationale**: Automatic generation reduces admin work, while an unreleased review queue protects against accidental credentials for cancelled events, archived courses, test data, or incorrect attendance/progress.

**Alternatives considered**:
- Fully automatic release: rejected because certificates are official credentials.
- Manual certificate creation only: rejected because it creates avoidable admin overhead and errors.

---

## Decision: Public Certificate Verification With Limited Safe Data

**Rationale**: Employers, clinics, event organizers, and external reviewers may need to verify a certificate without an AMG account. The public page should confirm authenticity while exposing only the minimum certificate details.

**Alternatives considered**:
- Verification inside mobile account only: rejected because external verifiers could not use the QR.
- Public page with full user profile: rejected for privacy.

---

## Decision: Case Posts Need Admin Approval, Comments Are Post-Moderated

**Rationale**: Posts may contain clinical images and patient context, so they must be approved before broad visibility. Comments should appear immediately to keep discussion useful, with reporting and admin removal available for safety.

**Alternatives considered**:
- Moderate every comment before display: rejected because it makes discussion slow and admin-heavy.
- No moderation: rejected because clinical discussion and images need guardrails.

---

## Decision: Study Group Chat Is Real-Time From First Release

**Rationale**: The user explicitly wants real-time study group chat. Saved messages plus authenticated membership checks are required so chat is immediate but not ephemeral or public.

**Alternatives considered**:
- Polling-only message refresh: rejected by product decision.
- External chat provider first: deferred because the existing backend can own auth and membership rules.

---

## Decision: Private Backend-Controlled File Access for Community Files

**Rationale**: Case images and study group files should follow the same direction as protected course videos: storage provider links are not exposed to users. Backend checks authorization and streams/downloads the file.

**Alternatives considered**:
- Share Google Drive links directly: rejected because links can be forwarded and are difficult to revoke safely.
- Local-only storage immediately: deferred until VPS deployment/storage is ready.
