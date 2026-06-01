# API Contracts: Community Learning and Certificates

**Date**: 2026-06-01
**Feature**: Community Learning and Certificates
**Plan**: [../plan.md](../plan.md)

---

## Contract Policy

- All protected endpoints use the existing authenticated API envelope.
- Admin endpoints require explicit permissions.
- Public certificate verification does not require login and returns limited safe data.
- File endpoints never expose direct Google Drive or VPS links for protected assets.

---

## Certificates MVP

### User Certificate Wallet

`GET /api/v1/certificates`

Returns released certificates for the current user.

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "certificateNumber": "AMG-CERT-2026-000001",
      "sourceType": "course",
      "sourceTitle": "Advanced Endodontics",
      "learnerName": "Dr. User",
      "issuerName": "AMG Academy",
      "issuedAt": "2026-06-01T00:00:00.000Z",
      "hours": 12,
      "credits": 4,
      "verificationUrl": "https://example.com/certificates/verify/abc123",
      "downloadUrl": "/api/v1/certificates/uuid/download"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

### Download Certificate PDF

`GET /api/v1/certificates/:id/download`

Rules:
- Current user can download their own released certificate.
- Admin can download any certificate.
- Draft, pending, revoked, and voided certificates are not downloadable by normal users.

### Public Verification

`GET /api/v1/certificates/verify/:verificationCode`

```json
{
  "success": true,
  "data": {
    "valid": true,
    "certificateNumber": "AMG-CERT-2026-000001",
    "learnerName": "Dr. User",
    "sourceType": "course",
    "sourceTitle": "Advanced Endodontics",
    "issuerName": "AMG Academy",
    "issuedAt": "2026-06-01T00:00:00.000Z",
    "hours": 12,
    "credits": 4,
    "status": "released"
  }
}
```

Invalid, revoked, voided, or missing certificates must return a safe invalid response without private details.

### Admin Queue

`GET /api/v1/certificates/admin?status=pending_review&page=1&limit=20&search=`

Returns certificate drafts/review records with recipient and source context.

### Admin Release

`POST /api/v1/certificates/admin/:id/release`

```json
{
  "reviewNotes": "Attendance confirmed."
}
```

### Admin Revoke or Void

`POST /api/v1/certificates/admin/:id/revoke`

```json
{
  "reason": "Issued in error."
}
```

`POST /api/v1/certificates/admin/:id/void`

```json
{
  "reason": "Duplicate/test certificate."
}
```

### Trigger Certificate Generation

Internal service behavior:
- Event attendance completion creates or updates a pending certificate draft.
- Course 100% completion creates or updates a pending certificate draft.
- Duplicate active certificates for the same user/source are blocked.

Admin repair endpoint may be added:

`POST /api/v1/certificates/admin/generate`

```json
{
  "sourceType": "event",
  "userId": "uuid",
  "eventId": "uuid"
}
```

---

## Case Discussion Later Phase

Endpoints to add later:
- `GET /api/v1/cases`
- `POST /api/v1/cases`
- `GET /api/v1/cases/:id`
- `POST /api/v1/cases/:id/comments`
- `POST /api/v1/cases/:id/upvote`
- `POST /api/v1/cases/:id/bookmark`
- `POST /api/v1/case-comments/:id/report`
- `GET /api/v1/cases/admin/review`
- `POST /api/v1/cases/admin/:id/approve`
- `POST /api/v1/cases/admin/:id/reject`
- `POST /api/v1/case-comments/admin/:id/hide`

---

## Study Groups Later Phase

Endpoints/events to add later:
- `GET /api/v1/study-groups`
- `POST /api/v1/study-groups`
- `GET /api/v1/study-groups/:id`
- `POST /api/v1/study-groups/:id/join`
- `POST /api/v1/study-groups/:id/members/:memberId/approve`
- `GET /api/v1/study-groups/:id/messages`
- Real-time authenticated event: `study-group:message`
- `POST /api/v1/study-groups/:id/files`
- `GET /api/v1/study-group-files/:id/download`
- `POST /api/v1/study-groups/:id/sessions`

Rules:
- Every message/file/session action requires active group membership.
- Instructor-led course group management requires admin or owning course instructor.
- Offline members may receive push notifications according to preferences.
