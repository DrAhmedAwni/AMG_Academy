# Feature Specification: Community Learning and Certificates

**Feature Branch**: `006-community-certificates`

**Created**: 2026-06-01

**Status**: Draft

**Input**: User description: "Add case discussion with admin approval, study groups with real-time chat and private files, and certificates with auto-generated PDFs, QR verification, admin release, and mobile profile badges."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Certificate Wallet and Verification (Priority: P1)

A learner who attends an event or completes a course receives a certificate draft automatically. An admin reviews and releases it, then the learner can view, download, and share the certificate from their profile or mobile wallet. Anyone with the QR verification link can confirm the certificate is authentic without seeing private account details.

**Why this priority**: Certificates are directly connected to the current event attendance and course completion flows, add immediate learner value, and support AMG Academy credibility.

**Independent Test**: Can be fully tested by completing one eligible event or course flow, approving the generated certificate as admin, viewing it in the user wallet, downloading the PDF, and opening the verification page from the QR code.

**Acceptance Scenarios**:

1. **Given** a user has attended an eligible event, **When** the attendance criteria are met, **Then** the system creates an unreleased certificate draft for admin review.
2. **Given** a certificate draft exists, **When** an admin approves it, **Then** the certificate becomes visible to the user and can be downloaded from web or mobile.
3. **Given** a released certificate has a QR verification code, **When** someone opens the verification link, **Then** the page confirms authenticity using limited safe certificate details only.
4. **Given** a certificate has not been approved, **When** the user opens their certificate wallet, **Then** the unreleased certificate is not shown as downloadable.

---

### User Story 2 - Moderated Case Discussion (Priority: P2)

A user can submit a dental case with title, description, category, tags, and images. The case is hidden until an admin approves it. Once approved, users can discuss the case through comments, upvotes, bookmarks, and reply notifications. Comments appear immediately but can be reported and hidden by admins.

**Why this priority**: Cases create educational engagement, but moderation and de-identification reminders are necessary before public discussion is safe.

**Independent Test**: Can be tested by submitting a case, confirming it is hidden from other users, approving it as admin, commenting as another user, bookmarking it, and reporting a comment for admin review.

**Acceptance Scenarios**:

1. **Given** a user uploads a case image, **When** the upload prompt appears, **Then** the user sees a de-identification reminder before submission.
2. **Given** a case is submitted, **When** it has not been approved, **Then** only the author and admins can see its review status.
3. **Given** an admin approves a case, **When** users browse the case forum, **Then** the case appears in the approved forum list.
4. **Given** a user posts a comment on an approved case, **When** the comment is saved, **Then** it appears immediately and can be reported if inappropriate.

---

### User Story 3 - Study Groups with Real-Time Chat (Priority: P3)

A user can join or create study groups. Student-created groups may be open or require join approval. Instructor-led groups are tied to a course and controlled by that course's instructor. Members can exchange real-time messages, share private files, and schedule study sessions.

**Why this priority**: Study groups are high value but larger in scope because they include membership rules, real-time messaging, private files, and scheduled sessions.

**Independent Test**: Can be tested by creating one open student group and one instructor-led course group, joining members, sending messages between two active users, sharing a file, and scheduling a study session.

**Acceptance Scenarios**:

1. **Given** a student-created open group exists, **When** another authenticated user joins, **Then** the user becomes a member without admin approval.
2. **Given** a closed group exists, **When** a user requests to join, **Then** the owner can approve or reject the request.
3. **Given** an instructor-led group is tied to a course, **When** the instructor manages members or materials, **Then** only that instructor or an admin can change the group.
4. **Given** two group members are online, **When** one member sends a message, **Then** the other member receives it in real time.
5. **Given** a file belongs to a study group, **When** a non-member tries to access it, **Then** access is denied.

---

### Edge Cases

- A certificate trigger fires more than once for the same user and source; only one active certificate may exist for that user/source pair.
- An event or course is archived or cancelled after certificates were created; unreleased certificates must be reviewed or voided before release.
- A certificate verification link is opened for a revoked, voided, or unreleased certificate; the page must avoid exposing private details and clearly show that it is not valid.
- A case image contains identifiable patient information; the app must warn before upload and admins must be able to reject the post.
- A case post is rejected; the author must see the status and reason while other users cannot see the post.
- A comment is reported repeatedly; admins must have a clear way to hide or remove it.
- A study group owner leaves; ownership must transfer or the group must become admin-managed before the owner can leave.
- A real-time chat connection drops; the user must see reconnect or refresh state without losing saved messages.
- A study group file is removed or access changes; existing direct links must not remain usable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST automatically create unreleased certificate drafts when a user satisfies configured event attendance or course completion criteria.
- **FR-002**: The system MUST prevent duplicate active certificates for the same user and qualifying event/course source.
- **FR-003**: Admins MUST be able to review, approve, release, revoke, and void certificates with an optional internal reason.
- **FR-004**: Users MUST be able to view released certificates in their profile and mobile certificate wallet.
- **FR-005**: Users MUST be able to download released certificate PDFs.
- **FR-006**: Each released certificate MUST include a unique QR verification link.
- **FR-007**: Certificate verification MUST be available without login and MUST show only safe certificate details: validity, certificate ID, learner display name, source title, issue date, hours or credits when available, and issuer.
- **FR-008**: Certificate verification MUST NOT show private account details such as email, phone, payment history, full profile information, or admin notes.
- **FR-009**: The system MUST support AMG-branded certificate templates for courses and events.
- **FR-010**: Any authenticated user MUST be able to submit a case discussion post with title, description, category, tags, and images.
- **FR-011**: Case discussion posts MUST remain hidden from the public forum until an admin approves them.
- **FR-012**: Only admins MUST be able to approve or reject case discussion posts.
- **FR-013**: Case image upload flows MUST include a de-identification reminder before submission.
- **FR-014**: Users MUST be able to comment on approved case posts without pre-approval.
- **FR-015**: Users MUST be able to report case comments, and admins MUST be able to hide or remove reported comments.
- **FR-016**: Users MUST be able to upvote and bookmark approved case posts.
- **FR-017**: Users MUST receive notifications for replies on their case posts or comment threads according to their notification preferences.
- **FR-018**: Users MUST be able to create student study groups with open or closed membership.
- **FR-019**: Closed study groups MUST require owner or moderator approval before a requesting user becomes a member.
- **FR-020**: Instructors MUST be able to create and manage instructor-led study groups tied to their own courses.
- **FR-021**: Study group members MUST be able to exchange real-time messages.
- **FR-022**: Study group files MUST be accessible only through authenticated backend-controlled access and never through public storage links.
- **FR-023**: Study group members MUST be able to schedule sessions with title, date/time, optional location or online meeting note, and attendee visibility.
- **FR-024**: Role and permission rules MUST prevent scanner-only users from accessing community, certificate admin, or study group management features unless explicitly granted.
- **FR-025**: Admin actions for certificates, case moderation, and study group moderation MUST be audit logged.

### Key Entities *(include if feature involves data)*

- **Certificate**: A credential issued to a user for an event or course, with lifecycle status, source, issue/release details, QR verification identifier, and PDF location.
- **CertificateTemplate**: AMG-branded layout and metadata used to generate certificate PDFs for event or course credentials.
- **CasePost**: A user-submitted dental case with moderation status, title, description, category, tags, images, and author.
- **CaseImage**: An image attached to a case post, stored privately and associated with de-identification acknowledgement.
- **CaseComment**: A reply on an approved case post, visible immediately but removable or hideable through moderation.
- **CaseCategory**: A specialty/category such as Endo, Implant, Ortho, or General Dentistry.
- **StudyGroup**: A student-created or instructor-led group with membership mode, owner, optional course, and status.
- **StudyGroupMember**: A user's membership, role, and request/approval status in a study group.
- **StudyGroupMessage**: A real-time chat message stored for group members.
- **StudyGroupFile**: A private file shared inside a study group through backend-controlled access.
- **StudyGroupSession**: A scheduled study session associated with a study group.

## UI/UX & Accessibility Requirements *(mandatory for user-facing/frontend features)*

- **Design System Compliance**: All new web and mobile screens must reuse AMG dark-first surfaces, existing status badge patterns, shared buttons/cards/modals, and restrained admin layouts.
- **Target Screens**: Admin certificate queue, public certificate verification page, user profile certificate section, mobile certificate wallet, future case forum, future case moderation queue, future study group screens.
- **Responsive Targets**: Admin pages must support desktop and tablet; public verification must support mobile web; mobile screens must be optimized for phone and usable on tablet.
- **State Coverage**: Loading, empty, error, success, permission denied, session expired, no data, unreleased, revoked, invalid verification, and validation states are required.
- **Accessibility**: Forms require labels and validation text; icon actions require accessible names; QR verification status must be readable as text; modals must have clear focus behavior and destructive confirmations.
- **Backend Scope Guardrail**: Clients may hide or disable unavailable actions, but certificate eligibility, moderation permissions, file access, and study group membership access must remain backend-owned.
- **Visual QA Evidence**: Browser verification is required for admin certificate queue and public verification; mobile certificate wallet requires Android validation before APK build.

## Mobile/API State Requirements *(mandatory for apps/mobile features)*

- **Mobile Screens/Modules**: Add profile certificate wallet first; future modules add case forum and study groups.
- **Backend Endpoints Used**: New protected certificate wallet endpoints and public certificate verification endpoint; future case and study group endpoints.
- **Shared Contracts**: Add shared certificate status/types first, then case and study group contracts as those phases begin.
- **Auth & Secure Storage**: Mobile certificate wallet requires authenticated session; public verification is not shown inside private mobile auth state unless opened through a browser/webview.
- **Role-Aware Navigation**: Certificate wallet is available to authenticated users; certificate approval is admin-only; scanner-only users do not receive admin/community management routes.
- **Payment State Source**: Certificate generation depends on backend event attendance/course completion state, not local user claims.
- **QR/Scanner State Source**: Certificate QR verification is separate from event attendance QR tickets and must not reuse attendance scan permissions.
- **Course Access Source**: Course certificates depend on backend course progress/completion and archived-course access rules.
- **Performance Plan**: Certificate wallet should paginate or lazy load PDFs; case and study group lists must use efficient list loading; chat should preserve responsiveness on mid-range phones.
- **App Store/Environment Impact**: APK builds must include push notification permission wording already added for announcements; certificate wallet does not require new device permissions.
- **Validation Evidence**: Typecheck, lint, tests, web build, mobile build/export, browser smoke tests, and mobile Android validation are required before release.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can approve and release a generated certificate in under 2 minutes from the review queue.
- **SC-002**: Users can find and download a released certificate from their profile or mobile wallet in under 3 taps/clicks after opening the relevant section.
- **SC-003**: Certificate QR verification shows a valid/invalid result in under 3 seconds under normal network conditions.
- **SC-004**: The system prevents duplicate active certificates for the same user/source in 100% of repeated trigger attempts.
- **SC-005**: Approved case posts become visible in the forum while pending/rejected posts remain hidden from non-admin users in 100% of moderation checks.
- **SC-006**: Real-time study group messages appear for online group members within 2 seconds under normal conditions.
- **SC-007**: Private study group files and case images are inaccessible to unauthorized users in 100% of permission checks.

## Assumptions

- Certificates are implemented first as the MVP; case discussion and study groups are documented and tasked but implemented in later phases.
- Event certificate eligibility starts with attended/checked-in registrations; course certificate eligibility starts with 100% course progress.
- Certificate PDFs may initially use a simple AMG-branded template and evolve later into editable admin templates.
- Public certificate verification is intentionally public because external clinics, employers, and organizers may need to verify certificate authenticity without an AMG account.
- Case comments appear immediately, with report/hide/remove moderation after posting.
- Study group chat is real-time from the first study group release.
- Study group and case files use private backend-controlled access, stored first on Google Drive and later portable to VPS storage.
- Existing authentication, role permissions, notifications, audit logging, and storage provider patterns will be reused.
