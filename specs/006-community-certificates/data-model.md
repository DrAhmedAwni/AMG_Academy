# Data Model: Community Learning and Certificates

**Date**: 2026-06-01
**Feature**: Community Learning and Certificates
**Plan**: [plan.md](plan.md)

---

## Certificate

Official credential issued to a user for an event or course.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary identifier |
| certificateNumber | string | Human-friendly unique certificate ID |
| verificationCode | string | Unique public verification code for QR link |
| userId | uuid | Recipient |
| sourceType | enum | `event` or `course` |
| eventId | uuid? | Event source when applicable |
| courseId | uuid? | Course source when applicable |
| templateId | uuid? | Template used for generated PDF |
| status | enum | `draft`, `pending_review`, `released`, `revoked`, `voided` |
| learnerName | string | Printed recipient name |
| sourceTitle | string | Printed course/event title |
| issuerName | string | AMG Academy issuer text |
| issuedAt | datetime? | Date printed on certificate |
| releasedAt | datetime? | Date made visible to user |
| revokedAt | datetime? | Revocation timestamp |
| voidedAt | datetime? | Void timestamp |
| hours | decimal? | Event/course hours |
| credits | decimal? | CE credits if configured |
| pdfStorageProvider | string? | `google_drive`, `vps`, or local provider |
| pdfStorageKey | string? | Private storage identifier |
| reviewNotes | string? | Internal admin notes |
| createdById | uuid? | System/admin creator |
| reviewedById | uuid? | Admin reviewer |

**Rules**:
- One active certificate per user/source pair.
- Draft and pending certificates are not visible to users.
- Released certificates are visible and downloadable.
- Revoked/voided certificates remain auditable but verify as invalid.

---

## CertificateTemplate

AMG-branded PDF layout configuration.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary identifier |
| name | string | Admin display name |
| sourceType | enum | `event`, `course`, or `both` |
| isDefault | boolean | Default template for source type |
| status | enum | `active` or `archived` |
| layoutConfig | json | Branding, signature, footer, color, text positions |
| createdById | uuid? | Admin creator |

**Rules**:
- At least one active default template should exist before release.
- Archived templates remain linked to already issued certificates.

---

## CasePost

Moderated case discussion post.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary identifier |
| authorId | uuid | User who submitted |
| categoryId | uuid | Specialty/category |
| title | string | Case title |
| description | text | Case details |
| tags | string[] | Search/filter tags |
| status | enum | `pending_review`, `approved`, `rejected`, `archived` |
| deidentifiedAcknowledgedAt | datetime | Upload safety acknowledgement |
| reviewedById | uuid? | Admin reviewer |
| reviewedAt | datetime? | Review timestamp |
| rejectionReason | string? | Author-visible rejection reason |

**Rules**:
- Pending/rejected posts are hidden from public forum.
- Authors can see their own review status.
- Only admins approve/reject.

---

## CaseImage

Private image attached to a case post.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary identifier |
| casePostId | uuid | Parent case |
| storageProvider | string | Storage backend |
| storageKey | string | Private key |
| caption | string? | Optional image caption |
| orderIndex | number | Display order |

---

## CaseComment

Immediate discussion reply with post-moderation support.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary identifier |
| casePostId | uuid | Parent case |
| authorId | uuid | Comment author |
| parentCommentId | uuid? | Threaded reply parent |
| body | text | Comment content |
| status | enum | `visible`, `hidden`, `removed` |
| hiddenById | uuid? | Admin/moderator who hid it |
| hiddenReason | string? | Internal moderation reason |

---

## CaseCategory

Specialty/category taxonomy for cases.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary identifier |
| name | string | Display label |
| slug | string | URL/filter label |
| status | enum | `active` or `archived` |

---

## StudyGroup

Student-created or instructor-led group.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary identifier |
| ownerId | uuid | Group owner |
| courseId | uuid? | Required for instructor-led group |
| type | enum | `student` or `instructor_led` |
| joinMode | enum | `open`, `request`, `invite_only` |
| title | string | Group name |
| description | text? | Purpose |
| status | enum | `active`, `archived` |

**Rules**:
- Instructor-led groups tied to a course are managed by that course instructor or admins.
- Student groups are managed by owner/moderators unless admin intervention is needed.

---

## StudyGroupMember

Membership and role state.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary identifier |
| groupId | uuid | Study group |
| userId | uuid | Member/requesting user |
| role | enum | `owner`, `moderator`, `member` |
| status | enum | `pending`, `active`, `rejected`, `removed`, `left` |
| approvedById | uuid? | Approver |

---

## StudyGroupMessage

Saved real-time chat message.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary identifier |
| groupId | uuid | Study group |
| authorId | uuid | Message author |
| body | text | Message content |
| status | enum | `visible`, `hidden`, `removed` |
| createdAt | datetime | Sent timestamp |

---

## StudyGroupFile

Private file shared inside a group.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary identifier |
| groupId | uuid | Study group |
| uploadedById | uuid | Uploader |
| fileName | string | Display filename |
| mimeType | string | Content type |
| sizeBytes | number | File size |
| storageProvider | string | `google_drive`, `vps`, or local provider |
| storageKey | string | Private storage identifier |
| status | enum | `active`, `removed` |

---

## StudyGroupSession

Scheduled group session.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary identifier |
| groupId | uuid | Study group |
| createdById | uuid | Organizer |
| title | string | Session title |
| startsAt | datetime | Start time |
| endsAt | datetime? | Optional end time |
| location | string? | Physical location |
| onlineUrlNote | string? | Optional meeting note, not a public credential |
| status | enum | `scheduled`, `cancelled`, `completed` |

