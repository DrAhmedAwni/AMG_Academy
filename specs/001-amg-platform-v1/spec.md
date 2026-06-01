# Feature Specification: AMG Academy Platform V1

**Feature Branch**: `001-amg-platform-v1`

**Created**: 2026-05-27

**Status**: Draft

**Input**: User description: "Build the AMG Academy Platform V1 web application for AMG Academy, a dental education brand of Allam Medical Group in Egypt. The platform covers user authentication, event management and registration, QR ticketing and attendance scanning, course learning with protected video, payments, announcements and notifications, admin dashboard, role-based access control, reports and exports, content management, and audit logging."

## User Scenarios & Testing

### User Story 1 — User Registration & Authentication (Priority: P1)

Dentists, students, and event attendees can create an account, verify their email, sign in, and reset their password. Once authenticated, they can access all protected areas of the platform.

**Why this priority**: Authentication is the gateway to every user-facing feature. Without it, users cannot register for events, access courses, or use any personalized functionality. This is the foundational layer that all other stories depend on.

**Independent Test**: A first-time visitor navigates to the platform, creates a new account, verifies their email via the confirmation link, signs in with their credentials, and lands on the authenticated dashboard. This validates the complete identity lifecycle without requiring any other feature.

**Acceptance Scenarios**:

1. **Given** a visitor on the registration page, **When** they submit valid registration details (name, email, password), **Then** an account is created and a verification email is sent.
2. **Given** a registered but unverified user, **When** they click the email verification link, **Then** their account is marked as verified and they can sign in.
3. **Given** a verified user on the login page, **When** they enter correct credentials, **Then** they are signed in and redirected to the dashboard.
4. **Given** a signed-in user, **When** they choose to sign out, **Then** their session is terminated and they are redirected to the public landing page.
5. **Given** a user who forgot their password, **When** they request a password reset and follow the reset link, **Then** they can set a new password and sign in with it.
6. **Given** an expired session, **When** the user attempts a protected action, **Then** they are prompted to sign in again.

---

### User Story 2 — Event Discovery, Registration & Attendance (Priority: P1)

Users can browse published events, search and filter, view details, and register for free or paid events. Admins can create and manage events, review registrations, approve or reject them, and track payment status. Once a registration is approved and payment is satisfied, a unique QR ticket is generated. Scanner staff can validate QR tickets at the venue and record attendance.

**Why this priority**: Event management and registration is the primary business function of AMG Academy. This story covers the complete flow from event discovery through on-site check-in and is the core value proposition of the platform.

**Independent Test**: A logged-in user browses events, registers for a free event, an admin approves the registration, a QR ticket is automatically generated, a scanner validates the QR at the venue, and attendance is recorded. This end-to-end flow validates every critical component without requiring courses, reports, or content management.

**Acceptance Scenarios**:

1. **Given** a published event, **When** a user views the events page, **Then** they see event cards with title, date, time, location, price, category, and registration deadline.
2. **Given** a user viewing event details, **When** the event is free and registration is open, **Then** they can register without payment.
3. **Given** a user viewing event details, **When** the event is paid, **Then** they can register and the payment status is tracked as pending.
4. **Given** a submitted registration, **When** an admin approves it and payment conditions are met, **Then** a unique, non-predictable QR ticket is generated and becomes visible to the user.
5. **Given** a registration that is rejected by admin, **When** the user checks their reservation status, **Then** they see the rejection reason.
6. **Given** a scanner at the event venue, **When** they scan a valid QR ticket for the correct event, **Then** the check-in is recorded with timestamp and scanner identity.
7. **Given** a scanner at the event venue, **When** they scan a duplicate, expired, wrong-event, or unpaid QR ticket, **Then** the check-in is rejected with a clear reason.
8. **Given** an event registration, **When** a duplicate registration is attempted for the same event by the same user, **Then** it is blocked with a message that they are already registered.

---

### User Story 3 — Course Learning Platform (Priority: P2)

Users can browse a catalog of recorded dental courses, view details, enroll in free or paid courses, and watch protected video lessons. Instructors and admins can create and manage course content, including lessons and videos.

**Why this priority**: Course learning expands the platform beyond live events into ongoing on-demand education. It is P2 because event registration and attendance are the primary V1 launch focus, but courses provide critical long-term value.

**Independent Test**: A logged-in user browses courses, enrolls in a free course, opens a lesson, and watches the protected video. Separately, an admin can upload a new course with multiple lessons, set it as free or paid, and publish it — all without touching event or user management.

**Acceptance Scenarios**:

1. **Given** a published course, **When** a user views the course catalog, **Then** they see course cards with title, instructor, category, free or paid label, thumbnail, lesson count, and duration.
2. **Given** a free course, **When** a user enrolls, **Then** they gain immediate access to all lessons.
3. **Given** a paid course, **When** a user enrolls, **Then** access is granted only after payment conditions are satisfied.
4. **Given** an enrolled user, **When** they open a lesson, **Then** the protected video plays without visible download controls and the video URL is not publicly exposed.
5. **Given** a user who is not enrolled or has not paid, **When** they attempt to access a lesson URL directly, **Then** access is denied with a clear message.

---

### User Story 4 — Admin Dashboard & Operations (Priority: P1)

AMG Academy staff can manage the entire platform through a dedicated admin interface. This includes user management, role and permission configuration, event and course administration, announcement publishing, notification oversight, and audit log review. Role-based access ensures that scanner-only staff and instructors only see their permitted screens.

**Why this priority**: Without admin tools, staff cannot approve registrations, create events, manage users, or operate the platform day-to-day. Admin operations are P1 because they enable all other workflows and are required for the platform to function without developer support.

**Independent Test**: A super admin logs into the admin dashboard, views the user list with search and filters, changes a user's role, creates and publishes a new event with all required fields, approves a pending registration, creates and publishes an announcement, and reviews the audit log. This validates the complete admin toolset independently of the user-facing experience.

**Acceptance Scenarios**:

1. **Given** an admin user with appropriate permissions, **When** they access any admin list screen, **Then** they see search, filters, status badges, pagination, row actions, loading state, empty state, and error state.
2. **Given** an admin user, **When** they fill out any admin form and submit, **Then** inline validation is shown for required fields, a loading state appears during save, and success feedback is displayed on completion.
3. **Given** a user assigned the scanner-only role, **When** they log into the admin panel, **Then** they only see scanner and attendance screens — no user management, events, courses, or reports.
4. **Given** a user assigned the instructor role, **When** they log into the admin panel, **Then** they only see course management screens for their assigned courses.
5. **Given** an admin performing a sensitive action (role change, payment verification, registration override), **When** the action is completed, **Then** an audit log entry is created with actor, action, entity type, entity ID, timestamp, and old/new values.

---

### User Story 5 — Reports, Exports & Content Management (Priority: P3)

Admins can generate reports on users, registrations, attendance, payments, and course enrollments. Report data can be exported to CSV. Admins can also manage static content pages (privacy policy, terms, refund policy, FAQs, and support/contact information). Users receive in-app and email notifications for key events throughout the platform.

**Why this priority**: Reports and content management support ongoing operations but are not required for the initial launch of events and courses. They are P3 because the core event and course workflows can operate without them, and users can still receive notifications from primary workflows.

**Independent Test**: An admin navigates to the reports dashboard, views a summary of event registrations, exports the data to CSV, edits the privacy policy content page, and publishes it. A user can then view the updated privacy policy and see a notification in their notification list.

**Acceptance Scenarios**:

1. **Given** an admin on the reports dashboard, **When** they select a report type, **Then** they see a summary with key metrics and paginated detail rows.
2. **Given** an admin viewing a report, **When** they click export, **Then** the data is downloaded as a CSV file.
3. **Given** an admin editing a content page, **When** they save changes and publish, **Then** the updated content is immediately visible to users viewing that page.
4. **Given** a user with a notification-triggering event (e.g., registration approved, payment confirmed, new announcement), **When** they view their notification list, **Then** they see the notification with type, message, timestamp, and a link to the relevant entity.
5. **Given** an admin who requests an export estimated to take more than 30 seconds, **When** the export is triggered, **Then** it is processed asynchronously and the admin is notified when the file is ready.

---

### Edge Cases

- What happens when a user tries to register for the same event twice? Duplicate detection prevents the second registration and informs the user they are already registered.
- What happens when an event reaches capacity? Registration is blocked with a capacity-full message unless the event has a waiting list enabled.
- What happens when a user tries to register after the published deadline? Registration is blocked with a deadline-passed message.
- What happens when a QR ticket is scanned for the wrong event? The scanner rejects it and shows which event the ticket is actually for.
- What happens when a QR ticket has already been used? The scanner rejects it and displays the prior check-in timestamp and scanner identity.
- What happens when a user loses access to their verified email? Password reset still works via the registered email on file.
- What happens when a payment webhook fails or is delayed? The payment status remains pending, the system retries, and an admin is notified of the failure.
- What happens when an admin attempts to delete a user who has active registrations or enrollments? The system prevents deletion or handles orphan records by marking the user as disabled rather than deleted.
- What happens when a video upload fails or is corrupted? The admin receives an error message, the lesson remains without a video, and the course can still be browsed without access to that lesson.
- What happens when an export request exceeds 30 seconds estimated processing time? The system processes the export in the background and notifies the admin when the file is ready for download.
- What happens when an unauthenticated user tries to access a protected route? They are redirected to the login page with a message that authentication is required.
- What happens when a user without the required role tries to access an admin screen? They see a permission-denied message and the restricted content is not rendered.

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow visitors to create a user account with name, email, and password.
- **FR-002**: System MUST send a verification email after account creation and require email verification before allowing sign-in.
- **FR-003**: System MUST allow users to sign in with email and password.
- **FR-004**: System MUST allow users to reset their password via an email-based reset link.
- **FR-005**: System MUST terminate inactive sessions after a configurable timeout period.
- **FR-006**: System MUST allow authenticated users to browse published events with search and filter capabilities.
- **FR-007**: System MUST display event details including title, description, date, time, location, price, capacity, category, registration deadline, and publication status.
- **FR-008**: System MUST allow authenticated users to register for events.
- **FR-009**: System MUST prevent duplicate registrations for the same event by the same user.
- **FR-010**: System MUST prevent registration after the published deadline.
- **FR-011**: System MUST prevent registration when event capacity is full.
- **FR-012**: System MUST track payment status for paid event registrations and paid course enrollments with statuses: pending, successful, failed, refunded, and manually verified.
- **FR-013**: System MUST generate a unique, non-predictable QR ticket for each approved registration once payment conditions are satisfied.
- **FR-014**: System MUST allow scanner staff to select an event and scan QR tickets using a device camera.
- **FR-015**: System MUST support manual ticket code entry as a fallback when camera scanning is unavailable.
- **FR-016**: System MUST validate QR tickets against the event, user, registration status, payment status, ticket status, and prior check-in status.
- **FR-017**: System MUST reject QR ticket scans that are duplicate, wrong-event, expired, revoked, or unpaid.
- **FR-018**: System MUST record attendance with scan timestamp and scanner identity upon successful QR validation.
- **FR-019**: System MUST allow authenticated users to browse published courses with search and filter capabilities.
- **FR-020**: System MUST display course details including title, description, instructor, category, price or free label, lesson list, total duration, and thumbnail.
- **FR-021**: System MUST allow authenticated users to enroll in free courses immediately.
- **FR-022**: System MUST restrict paid course lesson access until payment conditions are satisfied.
- **FR-023**: System MUST protect video playback behind enrollment and payment validation — direct public video URLs MUST NOT be exposed.
- **FR-024**: System MUST NOT show video download controls on lesson playback.
- **FR-025**: System MUST provide a full admin dashboard with modules for: overview, users, roles and permissions, events, event categories, registrations, payments, QR scanner, attendance logs, announcements, courses, lessons, content pages, reports, exports, and audit logs.
- **FR-026**: System MUST enforce role-based access control on all admin screens, with backend permission checks for every action.
- **FR-027**: System MUST support the following roles: Super Admin, AMG Admin, Scanner Staff, Instructor, and User/Student, with configurable permissions.
- **FR-028**: System MUST deliver in-app notifications and email notifications for all configured notification events.
- **FR-029**: System MUST generate notifications for: registration submitted, registration approved, registration rejected, payment successful, payment failed, QR ticket issued, event reminder, event cancelled, new announcement, and new course added.
- **FR-030**: System MUST provide reports summarizing: total users, event registrations, attendance rate, paid vs free revenue, no-show users, course enrollments, course completion rate, payment status distribution, and QR scan logs.
- **FR-031**: System MUST support CSV export of users, registrations, attendance records, payments, and course enrollments.
- **FR-032**: System MUST process exports asynchronously if they are estimated to take more than 30 seconds.
- **FR-033**: System MUST allow admins to create, edit, publish, and archive content pages for privacy policy, terms and conditions, refund policy, FAQs, and support/contact information.
- **FR-034**: System MUST audit-log all sensitive admin actions including role changes, permission changes, registration approvals and rejections, QR scans and check-ins, payment status changes, manual payment verification, user disable or delete actions, event publish or cancel actions, course publish or archive actions, and content page updates.
- **FR-035**: System MUST record actor identity, action type, entity type, entity ID, timestamp, old value, new value, and IP or device info in audit logs where applicable.
- **FR-036**: System MUST allow authenticated users to view and edit their profile including name, phone, profession or specialty, clinic or hospital, and city.
- **FR-037**: System MUST allow authenticated users to view their registrations, QR tickets, course enrollments, and notifications from their account area.
- **FR-038**: System MUST present the user dashboard with latest announcements, upcoming events, recommended or top courses, and quick links to reservations, QR tickets, courses, notifications, and profile.
- **FR-039**: System MUST allow users to manage their notification preferences.
- **FR-040**: System MUST verify payment webhooks when an online payment gateway is enabled — webhook signature verification is required.
- **FR-041**: System MUST require backend permission checks for all admin operations; frontend-only permission checks are not sufficient for security-sensitive actions.
- **FR-042**: System MUST apply a consistent visual design across all screens using the approved AMG color palette and typography.
- **FR-043**: System MUST support bottom tab navigation on mobile-sized screens for the user-facing interface.
- **FR-044**: System MUST support left sidebar navigation on desktop-sized screens for the admin interface.

### Key Entities

- **User**: A platform account for any persona (dentist, student, attendee, admin, instructor, scanner). Contains identity details (name, email, phone), professional details (specialty, clinic, city), authentication credentials (hashed password, verification status), assigned role, account status (active, disabled, deleted), and timestamps.
- **Role**: A named permission set (Super Admin, AMG Admin, Scanner Staff, Instructor, User/Student). Permissions are configurable per module (create, read, update, delete, export) and are checked on the backend for every admin action.
- **Event**: A publishable academy offering that users can register for. Represents congresses, workshops, webinars, booths, offline courses, and academy events. Contains title, description, start and end date/time, location (physical or virtual), price, capacity, registration deadline, category reference, publication status, and timestamps.
- **Event Category**: A classification tag for events (Congress, Workshop, Webinar, Booth, Academy Event, etc.). Contains name, slug, and optional description.
- **Registration**: The link between a user and an event. Contains registration status (pending, approved, rejected, cancelled), admin review notes, registration timestamp, and links to user and event.
- **Payment**: A financial record tied to a registration or course enrollment. Contains amount, currency, status (pending, successful, failed, refunded, manually verified), payment provider reference, receipt or invoice reference, and timestamps.
- **QR Ticket**: A unique, cryptographically random token generated per approved, payment-eligible registration. Contains ticket code, status (active, used, expired, revoked), generation timestamp, and links to the user, event, and registration. Never exposes sensitive data in the encoded payload.
- **Attendance / Check-in**: A scan event recording successful QR validation at the venue. Contains the ticket reference, the scanner user identity, the event reference, the scan timestamp, and the validation result status.
- **Course**: A recorded educational offering composed of multiple lessons. Contains title, description, instructor reference, category reference, thumbnail reference, price or free flag, publication status, total duration, and timestamps.
- **Lesson**: A single video unit within a course. Contains title, description, video file reference or streaming URL, duration, ordinal position within the course, and optional completion tracking status for each enrolled user.
- **Enrollment**: The link between a user and a course. Contains enrollment date, payment status (for paid courses), and lesson completion records if progress tracking is enabled.
- **Announcement**: A broadcast message created and published by admins. Contains title, body, target audience scope (all users or role-based), publication status (draft, published, archived), and timestamps.
- **Notification**: A per-user message triggered by system events. Contains notification type, message text, read status, link to the triggering entity, and timestamp. Delivered via in-app notification list and email in V1.
- **Audit Log**: An immutable record of sensitive admin actions. Contains actor user reference, action type, entity type, entity ID, timestamp, serialized old value, serialized new value, and IP address or device information where available.
- **Content Page**: A static informational page whose content is managed via the admin interface. Includes privacy policy, terms and conditions, refund policy, FAQs, and support/contact. Contains title, URL slug, body content (rich text), publication status, and timestamps.
- **Report / Export**: A computed data summary generated from live platform data. Reports are not persistent entities — they are generated on demand with configurable filters and exported as CSV files.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A new visitor can create an account, verify email, and sign in within 3 minutes on a standard broadband connection.
- **SC-002**: A logged-in user can browse published events, view details, and complete a free event registration in under 2 minutes.
- **SC-003**: An admin can approve or reject a pending registration in under 30 seconds from the registration management screen.
- **SC-004**: A QR ticket is generated and becomes visible to the user within 5 seconds of registration approval and payment confirmation.
- **SC-005**: A scanner can validate a QR ticket and record attendance in under 2 seconds from scan initiation to result display.
- **SC-006**: Duplicate, expired, wrong-event, and unpaid QR tickets are rejected 100% of the time with a clear, specific error message.
- **SC-007**: A user can browse courses, enroll in a free course, and start watching a video lesson in under 3 minutes.
- **SC-008**: Unauthorized access attempts to paid course videos are blocked 100% of the time — no video plays without valid enrollment and payment.
- **SC-009**: An admin with Super Admin or AMG Admin role can manage all platform operations (users, events, registrations, payments, announcements, content) entirely through the admin interface without developer assistance.
- **SC-010**: A user assigned the Scanner Staff role can only see and access scanner and attendance screens — all other admin modules are inaccessible.
- **SC-011**: An admin can generate a report from the reports dashboard and export it to CSV in under 1 minute for datasets under 10,000 records.
- **SC-012**: Standard page loads complete in under 3 seconds on a typical broadband connection after production optimization.
- **SC-013**: Every screen in the application correctly displays loading state, empty state (when no data exists), error state (when a request fails), and success state (after completed actions) where applicable.
- **SC-014**: The platform visual design consistently uses the approved AMG color palette (black base, white brand, silver accents, blue for actions only) and typography (Hanken Grotesk for headings, Inter for body) across 100% of screens.
- **SC-015**: The web application renders and functions correctly on the latest two major versions of Chrome, Firefox, Safari, and Edge on both desktop and mobile viewports.

## Assumptions

- Payment processing will begin with a manual/offline verification flow. An online payment gateway (Paymob, Fawry, Stripe, or PayPal) will be integrated in a future phase. The payment provider will be abstracted behind an interface to support future gateway changes without business logic rewrites.
- Email notifications will be delivered via a configurable SMTP service. The notification system will be designed with channel abstraction so push notifications can be added for the V2 mobile app without restructuring the notification logic.
- Video content will be hosted on VPS storage initially. The video access layer will be abstracted to support future migration to Cloudflare Stream, Bunny Stream, Vimeo, Mux, or S3-compatible storage without changing course access logic.
- Users have a stable internet connection and use modern web browsers (Chrome, Firefox, Safari, Edge — latest two major versions).
- The platform will support English as the primary language for V1. Arabic or RTL language support is out of scope.
- Mobile users will access the platform through the responsive web interface. A native React Native mobile app is planned for V2 and will consume the same backend API.
- The admin dashboard is designed for desktop use. Mobile responsiveness for admin screens is a lower priority and may have reduced layout optimization.
- Course progress tracking, if enabled per course, will track lesson-level completion (marked as completed by the user or auto-detected on video end) rather than tracking exact viewing duration.
- The waiting list feature for events that have reached capacity is out of scope for V1 unless explicitly required for specific event types.
- User data will be retained for the duration of the account's active existence plus a reasonable post-closure period in compliance with applicable data protection regulations. Specific retention periods will be defined by AMG Academy policy.
- The platform is a single-tenant deployment for AMG Academy. Multi-organization or multi-brand support is out of scope for V1.
- QR ticket generation uses a cryptographically secure random token and does not encode sensitive user data in the QR payload itself.
