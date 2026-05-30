# AMG Academy Platform v1.0 — Product Requirements Document

## 1. Project Identity

| Field | Value |
|---|---|
| Project Name | AMG Academy Platform v1.0 |
| Project ID | PRD-001 |
| Version | v1.0 |
| Status | Draft |
| Priority | High |
| Created Date | 2026-05-25 |
| Last Updated | 2026-05-25 |
| Owner / PM | Ahmed Developer |
| Primary Approver | Ahmed Developer |
| Team Members | Frontend Dev / Backend Dev / Designer / QA |
| Tech Stack | Frontend: Next.js + React + TypeScript + Tailwind CSS; Backend: NestJS + TypeScript; Database: PostgreSQL; Hosting: Hostinger VPS initially |
| Repository | [TBD] |
| Git Branch Prefix | NNN-feature-name |
| PRD File Path | docs/PRD.md |

---

## 2. Problem & Purpose

### Problem Statement

AMG Academy currently needs one centralized platform to manage users, events, approvals, QR tickets, attendance, notifications, payments, and online courses. AMG is mainly active in the dental field in Egypt as a dental supplier selling materials, devices, and related products to dentists. AMG Academy will operate as a separate or daughter academy brand focused on educational events, offline courses, conference booths, online courses, webinars, product learning, and digital workflow tutorials for dentists.

The current operational model risks becoming fragmented because events, registrations, approvals, payments, QR tickets, attendance, course access, and announcements may be handled across disconnected tools or manual processes.

### Project Purpose

The purpose of the AMG Academy Platform is to give AMG Academy staff, instructors, dentists, students, and event attendees one professional system for:

- Creating and managing events, congress registrations, booths, offline courses, webinars, and online courses.
- Allowing users to register for free or paid events and courses.
- Managing admin approval, rejection, payment status, and attendance.
- Issuing secure QR tickets after approval and payment validation.
- Enabling QR-based event check-in by admins or scanner-only staff.
- Delivering recorded course videos and future live learning experiences.
- Supporting future mobile applications using the same backend and API.

### Business Value

The platform will centralize AMG Academy operations, reduce manual admin work, improve event attendance tracking, support paid and free learning experiences, and create a scalable academy platform for dentists in Egypt and later broader markets.

### Opportunity

AMG Academy can use V1 web to validate the backend, database, admin workflows, registration system, QR ticketing, payment flow, notifications, and course module before investing in V2 mobile applications for Android and iOS.

---

## 3. Goals & Objectives

### Primary Goal

Launch a stable V1 web platform in 4 weeks that validates user accounts, events, approvals, QR tickets, attendance scanning, payment tracking, notifications, course/video access, reporting, and the full admin dashboard before V2 mobile development.

### Objectives

1. Enable dentists and AMG Academy users to create accounts, sign in, manage profiles, register for events, receive QR tickets, attend events, and access online courses.
2. Enable AMG Academy staff to manage users, events, registrations, payments, QR tickets, attendance, announcements, courses, reports, and content without developer support for daily operations.
3. Support free and paid events, including AMG Congress registration, booths, offline courses, and academy events.
4. Support free and paid recorded courses, with a future path for live courses, webinars, certificates, CME tracking, in-app purchases, and subscriptions.
5. Build the backend and API in a reusable way so V2 React Native mobile apps can use the same PostgreSQL database, authentication, business logic, and API endpoints.

### Success Definition

The project is successful when V1 launches within 4 weeks, users can complete event registration, admins can approve or reject registrations, QR tickets are generated correctly, event staff can scan QR codes successfully, course videos are accessible only to authorized users, and AMG Academy staff can perform daily platform operations from the admin dashboard without developer involvement.

### Non-Goals

- V1 does not include the full React Native mobile app.
- V1 does not include advanced certificates or complete CME tracking.
- V1 does not include advanced quizzes or complex LMS features.
- V1 does not include AI dentistry assistant functionality.
- V1 does not include community forums.
- V1 does not include native in-app purchases or mobile subscriptions.
- V1 does not include offline mobile functionality.
- V1 does not include multi-organization support.

---

## 4. Scope

### In Scope for V1 Web App

- Public web application.
- User registration and login.
- Email verification.
- Password reset.
- User profile.
- User dashboard.
- Event listing.
- Event details page.
- Free and paid event registration.
- Admin approval and rejection of registrations.
- Payment status tracking.
- Manual/offline payment tracking if needed.
- QR code generation after approval and payment validation.
- QR code delivery by email and user dashboard.
- Admin QR scanner/check-in page.
- Attendance tracking.
- Announcements.
- Basic notification system.
- Basic course and recorded video module.
- Full admin dashboard.
- User management.
- Role and permission management.
- Course management.
- Video lesson management.
- Basic reports and CSV/Excel exports.
- Basic website/app content management.
- Terms, privacy policy, refund policy, FAQ, and support content management.
- Audit logs for important admin actions.

### In Scope for V1.5 Optional Enhancements

- Improved dashboards and analytics.
- Course progress tracking enhancements.
- Event reminders.
- Promo codes and discounts.
- Waiting lists.
- Certificate preparation.
- CME tracking preparation.
- Advanced notification segmentation.
- Improved video protection and watermarking.
- Better content management workflows.

### In Scope for V2 Mobile App

- React Native mobile application for Android and iOS.
- Same backend and API as V1.
- User login/signup.
- User profile.
- Event browsing.
- Event registration.
- Payment support where applicable.
- QR ticket wallet.
- Push notifications.
- Announcements.
- Recorded course viewing.
- Course progress.
- Admin/event staff QR scanner.
- Mobile attendance check-in.
- Screenshot and screen-recording blocking for course screens where technically supported.
- Android deployment to Google Play Store.
- iOS deployment to Apple App Store.

### Future V3 Scope

- Live courses and webinars.
- Certificates.
- CME tracking.
- Case discussions.
- AI assistant for dentistry.
- Product learning hub expansion.
- Digital workflow tutorial library.
- Community/forums.
- Arabic and English full localization.
- In-app purchases.
- Subscriptions.
- Advanced memberships.
- Advanced analytics.
- Multi-organization or partner academy support.

### Out of Scope for V1

- Full React Native mobile app.
- Advanced certificates.
- Advanced CME tracking.
- Advanced quizzes.
- Complex memberships.
- AI features.
- Full community/forums.
- Native in-app purchases.
- Mobile subscriptions.
- Multi-organization support.
- Offline mobile functionality.
- Advanced LMS features beyond recorded video lessons and course access.
- DRM-grade video protection unless a supported streaming provider is selected before launch.

### Assumptions

- AMG Academy will start with a web-first launch to validate operations before mobile development.
- AMG Academy’s main audience is dentists in Egypt.
- Events may include AMG Congress registration, booths, offline courses, webinars, and academy activities.
- Courses may be uploaded by AMG Academy admin staff or instructors.
- Events and courses may be free or paid.
- PostgreSQL will be used as the primary database.
- Hostinger VPS will be used initially for hosting.
- VPS server storage may be used initially for files and early video testing.
- Dedicated video hosting will be evaluated after launch for better scalability and content protection.

### Constraints

- V1 launch target is 4 weeks.
- Full admin dashboard scope is large for a 4-week release.
- Video download prevention can be implemented strongly, but full screen-recording prevention is limited on web.
- React Native V2 can block screenshots and screen recording on protected course screens where supported by Android/iOS.
- Payment gateway selection depends on AMG Academy’s operating region and preferred payment providers.
- Large videos should not remain on the main VPS long term.

### Dependencies

- Final payment gateway selection.
- Hostinger VPS server setup.
- Domain and SSL configuration.
- Email provider setup.
- QR scanning device/browser compatibility.
- AMG Academy branding and design assets.
- Event categories and course categories.
- Legal content for privacy policy, terms, refund policy, and support.
- Video hosting strategy after initial validation.
- Staff training for admin dashboard operations.

---

## 5. Users & Personas

### Primary Users

#### Persona 1: Dentist / AMG Academy Student

| Attribute | Description |
|---|---|
| Name | Dentist / AMG Academy Student |
| Role | Primary platform user, event attendee, course learner |
| Goal | Register for events, receive QR tickets, attend AMG Academy activities, access free or paid courses, and receive announcements. |
| Pain Point | Current workflows may be fragmented, manual, and lack one dashboard for tickets, attendance, announcements, and course access. |
| Tech Level | Medium |
| Frequency | Weekly or monthly, depending on events and courses |
| Success Definition | The dentist can register for an event or course, complete payment if required, receive access or QR ticket, and attend or learn without admin support. |

### Secondary Users

#### Persona 2: AMG Academy Admin

| Attribute | Description |
|---|---|
| Name | AMG Academy Admin |
| Role | Operations manager for users, events, courses, payments, registrations, and content |
| Goal | Manage the platform independently without needing developer support for normal daily operations. |
| Pain Point | Manual approvals, payment tracking, QR ticket management, attendance logs, and reports are time-consuming without one admin dashboard. |
| Tech Level | Medium |
| Frequency | Daily |
| Success Definition | The admin can create events, approve registrations, issue QR tickets, manage courses, send announcements, and export reports without technical help. |

#### Persona 3: Event Staff / Scanner

| Attribute | Description |
|---|---|
| Name | Event Staff / Scanner |
| Role | Check-in operator at events, booths, congresses, and offline courses |
| Goal | Scan QR tickets quickly and confirm attendance. |
| Pain Point | Manual attendee lists are slow and error-prone during busy events. |
| Tech Level | Low to Medium |
| Frequency | During events |
| Success Definition | The scanner can validate tickets, prevent duplicate check-ins, and show clear success/error messages in real time. |

#### Persona 4: Instructor

| Attribute | Description |
|---|---|
| Name | Instructor |
| Role | Course creator or course manager |
| Goal | Upload or manage course content, video lessons, and learner access where permitted. |
| Pain Point | Needs a controlled way to publish educational content without accessing sensitive admin areas. |
| Tech Level | Medium |
| Frequency | Weekly or monthly |
| Success Definition | The instructor can manage assigned courses and video lessons without accessing payments, roles, or unrelated admin data. |

#### Persona 5: Manager / Viewer

| Attribute | Description |
|---|---|
| Name | Manager / Viewer |
| Role | Stakeholder who reviews status, results, and reports |
| Goal | Get visibility into platform performance, event registrations, attendance, payments, and course adoption. |
| Pain Point | No single place to see current status and results. |
| Tech Level | Low to Medium |
| Frequency | Weekly |
| Success Definition | The manager can view dashboards and exports without changing operational data. |

---

## 6. MoSCoW Feature Prioritization

### Must Have — P0

| ID | Feature | Status | Description | Assigned To | Sprint |
|---|---|---|---|---|---|
| P0-F001 | User Authentication and Account Management | TODO | Users can register, verify email, log in, reset password, and manage basic profile details. | Backend Dev / Frontend Dev | Sprint 1 |
| P0-F002 | Event Registration | TODO | Users can browse events, view event details, and submit registration for free or paid events. | Backend Dev / Frontend Dev | Sprint 1 |
| P0-F003 | Payment Tracking | TODO | System tracks payment status for paid events and courses, including pending, successful, failed, refunded, and manual/offline payments. | Backend Dev | Sprint 2 |
| P0-F004 | Admin Approval and Rejection | TODO | Admins can approve or reject event and course registrations with status updates and notifications. | Backend Dev / Frontend Dev | Sprint 2 |
| P0-F005 | QR Ticket Generation | TODO | System generates unique QR tickets only after approval and payment conditions are met. | Backend Dev | Sprint 2 |
| P0-F006 | QR Scanning and Attendance Check-In | TODO | Admins and scanner staff can scan QR tickets, validate eligibility, prevent duplicate use, and record attendance. | Backend Dev / Frontend Dev | Sprint 3 |
| P0-F007 | Course and Video Access | TODO | Users can access enrolled recorded courses and video lessons, with protected access and download prevention controls. | Backend Dev / Frontend Dev | Sprint 3 |
| P0-F008 | Full Admin Dashboard | TODO | AMG Academy staff can manage users, roles, events, registrations, payments, QR tickets, courses, content, reports, and audit logs without developer support. | Full Team | Sprint 1–4 |

### Should Have — P1

| ID | Feature | Status | Description | Assigned To | Sprint |
|---|---|---|---|---|---|
| P1-F001 | Search and Filtering | TODO | Users and admins can search and filter events, users, registrations, payments, courses, and reports. | Frontend Dev / Backend Dev | Sprint 3 |
| P1-F002 | Reports and Exports | TODO | Admins can export users, registrations, attendance, payments, and course reports as CSV or Excel. | Backend Dev / Frontend Dev | Sprint 4 |
| P1-F003 | Announcements | TODO | Admins can create, edit, delete, and publish announcements to all users or selected groups. | Backend Dev / Frontend Dev | Sprint 3 |
| P1-F004 | Email Notifications | TODO | System sends transactional emails for registration, approval, rejection, payment, QR ticket, event reminders, and announcements. | Backend Dev | Sprint 3 |
| P1-F005 | Basic Reports Dashboard | TODO | Admins can view totals for users, registrations, attendance, revenue, and course enrollments. | Frontend Dev / Backend Dev | Sprint 4 |
| P1-F006 | User Profile | TODO | Users can view and update their personal profile, registrations, QR tickets, courses, and notifications. | Frontend Dev / Backend Dev | Sprint 2 |
| P1-F007 | Course Progress Tracking | TODO | System tracks lesson progress for recorded courses where supported. | Backend Dev / Frontend Dev | Sprint 4 |

### Could Have — P2

| ID | Feature | Status | Description | Assigned To | Sprint |
|---|---|---|---|---|---|
| P2-F001 | Dark Mode | TODO | Users and admins can switch between light and dark interface themes. | Frontend Dev | Post-V1 |
| P2-F002 | Keyboard Shortcuts | TODO | Admin users can use keyboard shortcuts for common admin dashboard actions. | Frontend Dev | Post-V1 |
| P2-F003 | Bulk Actions | TODO | Admins can approve, reject, export, or update multiple records at once. | Backend Dev / Frontend Dev | V1.5 |
| P2-F004 | Waiting List | TODO | Events can support waiting lists when capacity is full. | Backend Dev / Frontend Dev | V1.5 |
| P2-F005 | Promo Codes and Discounts | TODO | Admins can create discount codes for paid events or courses. | Backend Dev / Frontend Dev | V1.5 |
| P2-F006 | Arabic and English Localization Structure | TODO | Platform content and interface are prepared for Arabic and English support. | Frontend Dev / Backend Dev | V1.5 |

### Won't Have — P3

| ID | Feature | Status | Description | Assigned To | Sprint |
|---|---|---|---|---|---|
| P3-F001 | React Native Mobile App in V1 | SKIPPED | Full Android/iOS app is deferred to V2 after V1 web validation. | Mobile Dev | V2 |
| P3-F002 | Advanced Certificates | SKIPPED | Automated advanced certificate generation is deferred. | Backend Dev / Frontend Dev | Future V3 |
| P3-F003 | Advanced Quizzes | SKIPPED | Complex quizzes, exams, and grading are not part of V1. | Backend Dev / Frontend Dev | Future V3 |
| P3-F004 | Complex Memberships | SKIPPED | Tiered memberships and subscription access models are deferred. | Backend Dev | Future V3 |
| P3-F005 | AI Dentistry Assistant | SKIPPED | AI assistant for dentistry is deferred to future roadmap. | AI Dev | Future V3 |
| P3-F006 | Multi-Organization Support | SKIPPED | Multiple organizations or academy tenants are not supported in V1. | Backend Dev | Future V3 |
| P3-F007 | Offline Mobile Functionality | SKIPPED | Offline functionality is deferred until after V2 mobile validation. | Mobile Dev | Future V3 |
| P3-F008 | Community Forums | SKIPPED | Case discussions and community forums are deferred to future roadmap. | Full Team | Future V3 |
| P3-F009 | In-App Purchases and Subscriptions | SKIPPED | Native mobile purchases and subscriptions are deferred to V2/V3. | Mobile Dev / Backend Dev | V2/V3 |

---

## 7. Functional Requirements

### P0-F001 — User Authentication and Account Management

**Description:**  
The platform must allow dentists, students, instructors, staff, and admins to securely access the system through registration, login, email verification, password reset, and profile management.

**User Story:**  
As a dentist, the user wants to create an account and sign in securely so that they can register for AMG Academy events and access online courses.

**Trigger:**  
A user opens the platform and chooses to sign up, log in, verify email, or reset password.

**Preconditions:**

- User has access to the web app.
- Email service is configured.
- Authentication API is available.
- User is not already blocked or disabled.

**Postconditions:**

- User account is created or authenticated.
- Email verification status is stored.
- User session is created securely.
- User is redirected to the correct dashboard based on role.

**Main Flow:**

1. User opens the AMG Academy Platform.
2. User selects sign up.
3. System displays registration form.
4. User enters name, email, phone number, password, and required profile data.
5. System validates inputs.
6. System creates user account with default User / Student role.
7. System sends verification email.
8. User verifies email.
9. User logs in.
10. System redirects user to dashboard.

**Alternate Flows:**

- If email already exists, system shows duplicate account error.
- If email is not verified, system prompts user to verify before full access.
- If password is forgotten, user requests password reset.
- If account is disabled, system blocks access and shows support message.
- If admin logs in, system routes to admin dashboard based on permissions.

**Acceptance Criteria:**

- [ ] User can register with valid name, email, phone, and password.
- [ ] System rejects invalid email format.
- [ ] System rejects weak passwords.
- [ ] System prevents duplicate email registration.
- [ ] Verification email is sent after registration.
- [ ] User cannot access protected features before authentication.
- [ ] User can reset password through email.
- [ ] Disabled users cannot log in.
- [ ] Authenticated users are redirected according to their role.
- [ ] All protected endpoints require authentication.

---

### P0-F002 — Event Registration

**Description:**  
Users must be able to browse AMG Academy events, congresses, booths, offline courses, and event-based academy activities, then register for free or paid events.

**User Story:**  
As a dentist, the user wants to browse and register for an AMG Academy event so that they can attend conferences, booths, offline courses, or academy activities.

**Trigger:**  
User selects an event and clicks register.

**Preconditions:**

- User is authenticated.
- Event is published.
- Registration deadline has not passed.
- Event capacity is available unless waiting list is enabled.
- Event registration rules are configured.

**Postconditions:**

- Registration record is created.
- Registration status is set to pending, approved, rejected, payment pending, or waiting list based on event settings.
- Admin can review registration.
- User can see registration status in dashboard.

**Main Flow:**

1. User opens event listing page.
2. System displays published events with filters.
3. User selects event details.
4. System shows date, time, location, price, capacity, description, image/banner, and registration deadline.
5. User clicks register.
6. System checks login status.
7. System validates capacity and deadline.
8. System creates registration.
9. If free event requires approval, registration status becomes pending approval.
10. If paid event requires payment, registration status becomes payment pending.
11. User sees confirmation and next steps.

**Alternate Flows:**

- If event capacity is full, system blocks registration or offers waiting list if enabled.
- If deadline passed, system blocks registration.
- If user already registered, system shows existing registration status.
- If payment is required, system redirects user to payment or shows payment instructions.
- If event is cancelled, system prevents registration.

**Acceptance Criteria:**

- [ ] User can view event list.
- [ ] User can open event details.
- [ ] User can register for a published free event.
- [ ] User can start registration for a paid event.
- [ ] System prevents duplicate registrations for the same event.
- [ ] System blocks registration after deadline.
- [ ] System blocks registration when capacity is full unless waiting list is enabled.
- [ ] Admin can view submitted registrations.
- [ ] User can see registration status in dashboard.

---

### P0-F003 — Payment Tracking

**Description:**  
The platform must track payment status for paid events and paid courses. Payment gateway options may include Stripe, Paymob, Fawry, PayPal, or another suitable regional provider based on AMG Academy’s operating region. Manual/offline payment may be supported if needed.

**User Story:**  
As an admin, the user wants to track payments accurately so that paid event and course access is granted only after payment conditions are met.

**Trigger:**  
A user registers for a paid event or course.

**Preconditions:**

- Event or course is marked as paid.
- Price and currency are configured.
- Payment method is configured or manual payment mode is enabled.
- User has submitted registration or enrollment request.

**Postconditions:**

- Payment record is created.
- Payment status is tracked.
- Registration or course access is approved only when payment rules are satisfied.
- Payment report is available to admin.

**Main Flow:**

1. User selects paid event or course.
2. System creates registration or enrollment request.
3. System creates payment record with pending status.
4. User completes payment through configured gateway or follows offline payment instructions.
5. Payment gateway sends webhook confirmation or admin marks manual payment.
6. System updates payment status to successful, failed, pending, refunded, or cancelled.
7. System updates registration or enrollment eligibility.
8. Admin can view payment status in dashboard.
9. User receives payment confirmation or failure message.

**Alternate Flows:**

- If payment fails, status remains failed and user can retry.
- If webhook signature is invalid, system rejects payment update.
- If admin marks manual payment, audit log records the admin action.
- If refund occurs, status becomes refunded and access rules are updated based on policy.
- If payment remains pending, QR ticket or course access is not issued until resolved.

**Acceptance Criteria:**

- [ ] Paid event registration creates payment record.
- [ ] Paid course enrollment creates payment record.
- [ ] Payment status supports pending, successful, failed, refunded, cancelled, and manual verified.
- [ ] QR ticket is not generated before payment success when payment is required.
- [ ] Course access is not granted before payment success when payment is required.
- [ ] Admin can view and filter payments by status.
- [ ] Admin can export payment report.
- [ ] Payment webhook verification is required for gateway updates.
- [ ] Manual payment changes are stored in audit logs.

---

### P0-F004 — Admin Approval and Rejection

**Description:**  
Admins must be able to approve or reject registrations and enrollments, with clear status changes and user notifications.

**User Story:**  
As an AMG Academy admin, the user wants to approve or reject registrations so that only eligible users receive QR tickets or course access.

**Trigger:**  
A registration or enrollment is submitted and requires admin review.

**Preconditions:**

- Admin is authenticated.
- Admin has permission to manage registrations or enrollments.
- Registration or enrollment exists.
- Payment conditions are known.

**Postconditions:**

- Registration or enrollment status is updated.
- QR ticket is generated if approved and payment conditions are met.
- User receives notification.
- Admin action is logged.

**Main Flow:**

1. Admin opens registration management page.
2. System displays pending registrations.
3. Admin opens a registration.
4. System shows user details, event details, payment status, and current registration status.
5. Admin clicks approve or reject.
6. System validates admin permission.
7. System updates registration status.
8. If approved and payment conditions are met, system triggers QR ticket generation.
9. System sends user notification.
10. System records action in audit log.

**Alternate Flows:**

- If payment is unpaid, admin approval may set status to approved pending payment.
- If admin rejects, system requests optional rejection reason.
- If registration was already processed, system prevents duplicate action.
- If admin lacks permission, system denies action.
- If notification fails, status still updates and failure is logged.

**Acceptance Criteria:**

- [ ] Admin can approve pending registration.
- [ ] Admin can reject pending registration.
- [ ] Admin can add rejection reason.
- [ ] System prevents unauthorized approval/rejection.
- [ ] Approved paid registration does not generate QR until payment condition is met.
- [ ] Approved free registration generates QR if event requires QR.
- [ ] User receives status notification.
- [ ] Action appears in audit log.

---

### P0-F005 — QR Ticket Generation

**Description:**  
The platform must generate one unique QR ticket per approved event registration after all approval and payment conditions are satisfied.

**User Story:**  
As a registered event attendee, the user wants to receive a QR ticket after approval so that they can check in at the event quickly.

**Trigger:**  
A registration becomes approved and payment conditions are satisfied.

**Preconditions:**

- Event requires QR ticket.
- Registration is approved.
- Payment status is successful or not required.
- User is linked to registration.
- QR ticket does not already exist for the same registration.

**Postconditions:**

- Unique QR ticket is generated.
- QR ticket is linked to one user and one event.
- QR ticket is available in user dashboard.
- QR ticket can be emailed to user.
- QR ticket status is active until used, cancelled, expired, or revoked.

**Main Flow:**

1. System detects approved registration with satisfied payment conditions.
2. System generates secure unique QR token.
3. System stores QR ticket record.
4. System links QR ticket to user, event, and registration.
5. System generates QR image or encoded QR payload.
6. System sends QR ticket by email and/or makes it available in user dashboard.
7. User opens ticket from dashboard or email.
8. System displays event name, user name, QR code, and ticket status.

**Alternate Flows:**

- If QR ticket already exists, system does not create duplicate.
- If registration is cancelled, QR ticket is revoked.
- If event is cancelled, QR ticket becomes invalid.
- If email fails, ticket remains available in dashboard.
- If admin resends QR, system sends existing active ticket, not a duplicate.

**Acceptance Criteria:**

- [ ] QR ticket is generated only after approval.
- [ ] QR ticket is generated only after successful payment when payment is required.
- [ ] Each QR ticket is unique.
- [ ] QR ticket links to one user and one event.
- [ ] Duplicate QR ticket generation is prevented.
- [ ] User can view QR ticket in dashboard.
- [ ] Admin can resend QR ticket.
- [ ] Cancelled registrations invalidate QR tickets.
- [ ] QR token is not predictable.

---

### P0-F006 — QR Scanning and Attendance Check-In

**Description:**  
Admins and scanner-only event staff must be able to scan QR tickets at events and record attendance with clear validation feedback.

**User Story:**  
As event staff, the user wants to scan an attendee’s QR ticket so that the system can verify ticket validity and mark the attendee as checked in.

**Trigger:**  
Event staff opens scanner page and scans QR code.

**Preconditions:**

- Scanner is authenticated.
- Scanner has scanner permission.
- QR ticket exists.
- Event is active or check-in window is open.
- Device camera permission is granted.

**Postconditions:**

- Valid ticket is marked as checked in.
- Attendance record is created.
- Scan time and scanner staff ID are stored.
- Duplicate scans are detected.
- Invalid scans show clear error message.

**Main Flow:**

1. Scanner opens QR scanner page.
2. Browser requests camera access.
3. Scanner scans attendee QR code.
4. System decodes QR token.
5. System validates ticket existence.
6. System checks event match, registration status, payment status, ticket expiry, and previous check-in status.
7. System displays attendee name, event name, registration status, payment status, and check-in status.
8. If valid, scanner confirms check-in.
9. System records attendance.
10. System shows success message.

**Alternate Flows:**

- If QR was already used, system shows duplicate check-in warning.
- If QR belongs to wrong event, system shows wrong-event error.
- If QR is expired, revoked, or cancelled, system shows invalid ticket error.
- If payment is unpaid, system blocks check-in.
- If scanner lacks permission, system blocks scanner page.
- If camera fails, system allows manual ticket code entry if enabled.

**Acceptance Criteria:**

- [ ] Scanner can scan QR ticket using device camera.
- [ ] System shows user name, event name, registration status, payment status, and check-in status.
- [ ] Valid QR check-in creates attendance record.
- [ ] Duplicate QR scan does not create duplicate attendance.
- [ ] Wrong-event QR is rejected.
- [ ] Expired or revoked QR is rejected.
- [ ] Scan time is stored.
- [ ] Scanner admin/staff ID is stored.
- [ ] Admin can view attendance logs.
- [ ] Admin can export attendance report.

---

### P0-F007 — Course and Video Access

**Description:**  
The platform must support recorded online courses with video lessons. Courses may be free or paid and can be uploaded or managed by AMG Academy admin staff or instructors based on permissions.

**User Story:**  
As a dentist, the user wants to enroll in and watch AMG Academy recorded courses so that they can learn dental materials, devices, workflows, and clinical/product education online.

**Trigger:**  
User selects a course and starts enrollment or opens an enrolled course.

**Preconditions:**

- Course is published.
- User is authenticated.
- Course access rules are configured.
- Payment status is successful if course is paid.
- Video content is uploaded or linked through supported storage/streaming.

**Postconditions:**

- User enrollment is created.
- User gains access if free or paid conditions are satisfied.
- Video access is restricted to authorized users.
- Progress is tracked if enabled.
- Unauthorized download is prevented as much as technically possible.

**Main Flow:**

1. User opens course listing page.
2. System displays published courses.
3. User opens course details page.
4. System shows course title, description, instructor, price, lessons, and access requirements.
5. User enrolls in free course or starts payment for paid course.
6. System validates access conditions.
7. User opens course dashboard.
8. User selects video lesson.
9. System verifies authorization.
10. System loads protected video player.
11. System tracks lesson progress if enabled.

**Alternate Flows:**

- If paid course payment fails, access remains blocked.
- If user is not enrolled, system blocks lesson playback.
- If video file is missing, system shows controlled error and logs issue.
- If access expires or is revoked, system blocks course.
- If direct video URL is accessed, system denies access.
- If mobile V2 protected course screen is used, screenshots and screen recording are blocked where OS-level support allows.

**Acceptance Criteria:**

- [ ] User can view course listing.
- [ ] User can view course details.
- [ ] User can enroll in free course.
- [ ] Paid course access requires successful payment.
- [ ] User cannot access unowned course videos.
- [ ] Video URLs are not public direct file links.
- [ ] Download controls are disabled where possible.
- [ ] Protected access uses session/token-based authorization.
- [ ] V2 mobile course screens block screenshots and screen recording where supported.
- [ ] Admin or instructor can manage course lessons according to permission.
- [ ] Large video hosting migration path is documented.

---

### P0-F008 — Full Admin Dashboard

**Description:**  
The admin dashboard must allow AMG Academy staff to manage daily operations independently without developer support.

**User Story:**  
As an AMG Academy admin, the user wants one dashboard to manage users, roles, events, registrations, approvals, QR tickets, payments, courses, notifications, reports, and content so that operations can run without developer intervention.

**Trigger:**  
Authorized staff logs into admin dashboard.

**Preconditions:**

- Staff user is authenticated.
- Staff user has assigned admin role and permissions.
- Admin dashboard modules are enabled.

**Postconditions:**

- Admin can complete operational tasks.
- Sensitive actions are permission-protected.
- Changes are saved and audited.
- Reports can be generated and exported.

**Main Flow:**

1. Admin logs in.
2. System validates role and permissions.
3. Admin lands on dashboard overview.
4. Admin selects module: users, roles, events, registrations, payments, QR/attendance, announcements, courses, content, reports, or audit logs.
5. System displays permitted data and actions.
6. Admin creates, updates, deletes, approves, rejects, publishes, exports, or manages records.
7. System validates inputs.
8. System saves changes.
9. System shows success or error feedback.
10. System records sensitive action in audit log.

**Alternate Flows:**

- If admin lacks permission, system hides or blocks restricted module.
- If input is invalid, system shows inline validation errors.
- If record has dependencies, system prevents destructive deletion and suggests archive/unpublish.
- If export fails, system logs error and shows retry option.
- If session expires, system requires re-authentication.

**Acceptance Criteria:**

- [ ] Admin can manage users.
- [ ] Admin can manage staff roles and permissions.
- [ ] Admin can manage events and categories.
- [ ] Admin can manage registrations.
- [ ] Admin can approve and reject registrations.
- [ ] Admin can manage payment statuses.
- [ ] Admin can resend QR tickets.
- [ ] Admin can scan QR tickets or assign scanner-only role.
- [ ] Admin can manage announcements.
- [ ] Admin can manage courses and video lessons.
- [ ] Admin can manage static content pages.
- [ ] Admin can view and export reports.
- [ ] Sensitive actions are audit logged.
- [ ] Staff cannot access modules outside assigned permissions.

---

### P1-F001 — Search and Filtering

**Description:**  
The platform must provide search and filtering across users, events, registrations, payments, courses, and reports.

**User Story:**  
As an admin, the user wants to search and filter records so that they can quickly find users, registrations, payments, and courses.

**Trigger:**  
Admin or user enters search keyword or applies filter.

**Preconditions:**

- User is authenticated where required.
- Records exist.
- Search endpoint is available.

**Postconditions:**

- Matching results are displayed.
- Filters are applied.
- Empty state appears if no results match.

**Main Flow:**

1. User opens a list page.
2. User enters keyword or selects filter.
3. System validates query parameters.
4. System returns matching paginated results.
5. User clears or changes filters if needed.

**Alternate Flows:**

- If no results exist, system shows empty state.
- If query is invalid, system shows validation error.
- If request fails, system shows retry option.

**Acceptance Criteria:**

- [ ] Admin can search users.
- [ ] Admin can filter registrations by event and status.
- [ ] Admin can filter payments by status.
- [ ] User can search published events and courses.
- [ ] Empty states are clear and useful.

---

### P1-F002 — Reports and Exports

**Description:**  
Admins must be able to export operational data as CSV or Excel.

**User Story:**  
As an admin, the user wants to export attendance, payment, and registration reports so that AMG Academy can analyze event and course performance.

**Trigger:**  
Admin clicks export button.

**Preconditions:**

- Admin has export permission.
- Report data exists.
- Export service is available.

**Postconditions:**

- Export file is generated.
- Download is available.
- Export action is logged.

**Main Flow:**

1. Admin opens reports page.
2. Admin selects report type.
3. Admin applies date, event, course, or status filters.
4. Admin clicks export.
5. System generates CSV or Excel.
6. Admin downloads file.
7. System logs export action.

**Alternate Flows:**

- If no data matches filters, system exports empty report with headers or shows empty state.
- If export fails, system shows retry option.
- If admin lacks permission, export button is hidden or disabled.

**Acceptance Criteria:**

- [ ] Admin can export event registrations.
- [ ] Admin can export attendance reports.
- [ ] Admin can export payment reports.
- [ ] Admin can export course enrollment reports.
- [ ] Export includes applied filters.
- [ ] Export action is audit logged.

---

### P1-F003 — Announcements

**Description:**  
Admins must be able to create and manage announcements for users or selected groups.

**User Story:**  
As an AMG Academy admin, the user wants to publish announcements so that dentists and students receive important academy updates.

**Trigger:**  
Admin creates or publishes announcement.

**Preconditions:**

- Admin has announcement permission.
- Target audience is selected.
- Announcement content is valid.

**Postconditions:**

- Announcement is saved.
- Target users can view announcement.
- Notification may be sent if enabled.

**Main Flow:**

1. Admin opens announcement management.
2. Admin creates announcement title and body.
3. Admin selects audience.
4. Admin saves draft or publishes.
5. System validates content.
6. System displays announcement to target users.
7. System stores notification history if sent.

**Alternate Flows:**

- If content is empty, system blocks publishing.
- If target group has no users, system shows warning.
- If notification send fails, announcement remains published and send failure is logged.

**Acceptance Criteria:**

- [ ] Admin can create announcement.
- [ ] Admin can edit announcement.
- [ ] Admin can delete announcement.
- [ ] Admin can publish announcement.
- [ ] Users can view relevant announcements.
- [ ] Notification history is stored when notifications are sent.

---

### P1-F004 — Email Notifications

**Description:**  
The system must send important transactional emails for registration, payment, QR tickets, events, courses, and announcements.

**User Story:**  
As a user, the user wants to receive email updates so that they know the status of registrations, payments, QR tickets, courses, and announcements.

**Trigger:**  
A registration, payment, approval, rejection, QR ticket, announcement, or event update occurs.

**Preconditions:**

- Email provider is configured.
- User has valid email.
- Notification template exists.

**Postconditions:**

- Email is sent or failure is logged.
- Notification history is stored.

**Main Flow:**

1. System receives notification event.
2. System selects email template.
3. System fills template data.
4. System sends email.
5. System records email status.

**Alternate Flows:**

- If email provider fails, system retries or logs failure.
- If user email is invalid, system logs bounce or invalid address.
- If template is missing, system logs configuration error.

**Acceptance Criteria:**

- [ ] Registration submitted email is sent.
- [ ] Registration approved email is sent.
- [ ] Registration rejected email is sent.
- [ ] Payment successful email is sent.
- [ ] QR code issued email is sent.
- [ ] Event reminder email can be sent.
- [ ] Event cancelled email is sent.
- [ ] New announcement email can be sent.

---

### P1-F005 — Basic Reports Dashboard

**Description:**  
The admin dashboard must show basic analytics for users, events, attendance, revenue, and courses.

**User Story:**  
As AMG Academy management, the user wants to see summary reports so that they can monitor platform performance.

**Trigger:**  
Admin opens reports dashboard.

**Preconditions:**

- Admin has reports permission.
- System has collected operational data.

**Postconditions:**

- Admin sees current metrics.
- Admin can filter metrics where supported.

**Main Flow:**

1. Admin opens reports dashboard.
2. System loads totals and charts.
3. Admin reviews users, registrations, attendance, revenue, and courses.
4. Admin applies filters.
5. System updates dashboard.

**Alternate Flows:**

- If no data exists, system shows empty state.
- If report query fails, system shows retry message.
- If admin lacks permission, system blocks access.

**Acceptance Criteria:**

- [ ] Dashboard shows total users.
- [ ] Dashboard shows event registrations.
- [ ] Dashboard shows attendance rate.
- [ ] Dashboard shows paid vs free event revenue.
- [ ] Dashboard shows course enrollments.
- [ ] Dashboard shows course completion rate if progress tracking is enabled.

---

### P1-F006 — User Profile

**Description:**  
Users must be able to view and manage basic profile information, registrations, QR tickets, course enrollments, and notifications.

**User Story:**  
As a dentist, the user wants one profile dashboard so that they can manage AMG Academy registrations, tickets, and courses.

**Trigger:**  
User opens profile or dashboard page.

**Preconditions:**

- User is authenticated.
- User account is active.

**Postconditions:**

- User views or updates allowed profile fields.
- User sees registrations, QR tickets, courses, and notifications.

**Main Flow:**

1. User logs in.
2. User opens dashboard.
3. System displays profile summary.
4. System displays registrations and QR tickets.
5. System displays courses and progress where available.
6. User updates editable profile fields.
7. System validates and saves changes.

**Alternate Flows:**

- If required field is invalid, system shows inline error.
- If user has no registrations, system shows empty state.
- If user has no courses, system shows course discovery action.
- If save fails, system shows retry option.

**Acceptance Criteria:**

- [ ] User can view profile.
- [ ] User can update allowed profile fields.
- [ ] User can view event registrations.
- [ ] User can view QR tickets.
- [ ] User can view course enrollments.
- [ ] User can view notifications.
- [ ] User cannot edit restricted account fields without verification.

---

### P1-F007 — Course Progress Tracking

**Description:**  
The system should track lesson progress for recorded courses.

**User Story:**  
As a learner, the user wants course progress to be saved so that they can resume learning later.

**Trigger:**  
User watches or completes a lesson.

**Preconditions:**

- User is enrolled in course.
- Lesson is published.
- Progress tracking is enabled.

**Postconditions:**

- Lesson progress is saved.
- Course progress percentage is updated.
- User can resume from last progress state.

**Main Flow:**

1. User opens enrolled course.
2. User starts video lesson.
3. System records lesson start.
4. System periodically saves progress.
5. User completes lesson.
6. System marks lesson complete.
7. Course progress updates.

**Alternate Flows:**

- If video tracking fails, system retries.
- If user opens course from another device, latest progress is loaded.
- If lesson is unpublished, progress is hidden but retained.

**Acceptance Criteria:**

- [ ] System tracks lesson started.
- [ ] System tracks lesson completed.
- [ ] System calculates course progress percentage.
- [ ] User can resume from saved progress where supported.
- [ ] Admin can view course completion rate if enabled.

---

## 8. Non-Functional Requirements

### Performance

| Requirement | Target |
|---|---|
| Initial page load | < 2 seconds for optimized pages under normal network conditions |
| API response time | < 500ms for standard CRUD endpoints under normal load |
| QR scan validation | < 1 second after QR token is submitted |
| Dashboard list loading | < 2 seconds for paginated data |
| Export generation | < 30 seconds for standard filtered reports |

### Security

- Authentication is required for all protected endpoints.
- Admin routes must be protected by role-based access control.
- Passwords must be hashed using strong industry-standard hashing.
- Inputs must be validated on frontend and backend.
- QR tokens must be secure, random, non-predictable, and revocable.
- Payment webhook signatures must be verified.
- TLS must be used in transit.
- Sensitive admin actions must be audit logged.
- Admin permissions must protect payments, user data, role management, exports, and QR scanning.
- Rate limiting must be applied to login, registration, password reset, payment callbacks, and QR validation endpoints.
- Direct public access to private files and course videos must be blocked.

### Video Security

- Course videos must not expose public direct file URLs.
- Download controls must be disabled where possible.
- Video access must require active user authorization.
- Signed URLs, tokenized access, or session-based authorization must be used where possible.
- Watermarking with user identifier should be evaluated for V1.5.
- DRM-capable providers should be evaluated after V1 launch if high-value course content requires stronger protection.
- V2 React Native course screens must block screenshots and screen recording where technically supported by Android and iOS.
- Web V1 must reduce unauthorized download and sharing as much as technically possible, but full screen-recording prevention cannot be guaranteed on web browsers.

### Availability

| Requirement | Target |
|---|---|
| Uptime | 99.9% target after production launch |
| Backups | Daily database backups |
| Backup retention | Minimum 30 days |
| Recovery plan | Database restore procedure documented before launch |

### Scalability

- PostgreSQL schema must support growth in users, events, registrations, payments, tickets, attendance records, courses, and lessons.
- Pagination must be used for admin lists.
- File/video storage must be designed with future migration from VPS storage to streaming/CDN provider.
- Backend API must be reusable for V2 React Native mobile app.

### Accessibility

- Interface should target WCAG 2.1 AA.
- Forms must include labels, validation messages, and keyboard accessibility.
- Error states must be readable and actionable.
- QR scanner must provide clear visual feedback.

### Compatibility

| Area | Requirement |
|---|---|
| Desktop Browsers | Latest Chrome, Safari, Firefox, Edge |
| Mobile Web | Responsive access on modern mobile browsers |
| Admin Scanner | Must work on modern devices with camera access |
| Future Mobile | React Native for Android and iOS |

### Data and Compliance

- Egypt-focused data protection and standard privacy compliance are required.
- GDPR-ready structure should be considered if AMG Academy later serves EU users.
- Privacy policy, terms and conditions, refund policy, and support/contact pages must be manageable.
- Account deletion request workflow must be documented or supported.
- Payment compliance depends on selected gateway.

### Observability

- Backend must use structured logging.
- Error rate > 1% should trigger alert.
- Payment webhook failures must be logged.
- QR validation failures must be logged.
- Admin actions must be audit logged.
- Export actions must be audit logged.

---

## 9. Technical Architecture

### Frontend V1

| Item | Decision |
|---|---|
| Framework | Next.js |
| UI Library | React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Main Areas | Public site, user dashboard, admin dashboard, scanner page |
| Deployment | Hostinger VPS initially |
| Rationale | Next.js is React with production routing, SEO benefits, structured pages, and better support for public event/course pages. |

### Backend

| Item | Decision |
|---|---|
| Framework | NestJS |
| Language | TypeScript |
| API Style | REST |
| Versioning | /api/v1 |
| Authentication | Secure custom JWT/session-based auth or selected auth package |
| Authorization | Role-based access control with flexible permissions |
| Deployment | Hostinger VPS initially |

### Database Architecture

| Item | Decision |
|---|---|
| Database | PostgreSQL |
| ORM | Prisma or TypeORM |
| Migrations | Version-controlled database migrations |
| Backup | Daily backups with retention |
| Data Access | Backend-only access, no direct client database access |

### Storage Architecture

| Storage Type | V1 Decision | Future Direction |
|---|---|---|
| Images / banners | VPS server storage initially | S3-compatible storage, Cloudflare R2, or similar |
| Static files | VPS server storage initially | CDN-backed object storage |
| Course videos | VPS storage only for early testing | Cloudflare Stream, Bunny Stream, Vimeo, Mux, or AWS S3 + CloudFront |
| Sensitive files | Protected backend access | Signed URLs or provider-based secure access |

### Auth and Authorization Design

- Users authenticate through email and password.
- Email verification is required.
- Password reset is supported.
- Roles include Super Admin, AMG Admin, Event Staff / Scanner, Instructor, and User / Student.
- Permissions are flexible and can be assigned or limited without developer support.
- Scanner-only access is supported.
- Instructor access is limited to assigned course management.
- Sensitive areas such as payments, user data, role management, exports, and audit logs require explicit permissions.

### Infrastructure and Deployment

| Layer | V1 Plan |
|---|---|
| Hosting | Hostinger VPS |
| Web Server | Nginx or equivalent reverse proxy |
| SSL | TLS certificate required |
| Process Management | PM2 or containerized process manager |
| Database | PostgreSQL on VPS or managed PostgreSQL if selected |
| CI/CD | GitHub Actions recommended |
| Monitoring | Server logs, app logs, uptime monitor, error alerts |
| Backups | Automated database backup jobs |

### External Integrations

| Integration | Options |
|---|---|
| Payment Gateway | Paymob, Fawry, Stripe, PayPal, or suitable regional provider |
| Email | SendGrid, Resend, Mailgun, SMTP, or Hostinger-compatible email service |
| Video Hosting Future | Cloudflare Stream, Bunny Stream, Vimeo, Mux, AWS S3 + CloudFront |
| Mobile Push V2 | Firebase Cloud Messaging |
| App Store V2 | Google Play Store and Apple App Store |

---

## 10. Implementation Phases

### Phase 1 — Foundation

| Field | Value |
|---|---|
| Goal | Establish project foundation, authentication, database, roles, core layouts, and initial admin structure. |
| Duration | Week 1 |

Tasks:

- [ ] Set up Next.js + React + TypeScript + Tailwind frontend.
- [ ] Set up NestJS + TypeScript backend.
- [ ] Set up PostgreSQL database.
- [ ] Configure migrations.
- [ ] Configure Hostinger VPS environment.
- [ ] Implement authentication.
- [ ] Implement email verification.
- [ ] Implement password reset.
- [ ] Implement base role and permission system.
- [ ] Implement user dashboard shell.
- [ ] Implement admin dashboard shell.
- [ ] Implement audit log foundation.

Validation:

- [ ] User can register, verify email, log in, reset password, and access correct dashboard.
- [ ] Admin can log in and access admin dashboard according to role.

### Phase 2 — Events, Registrations, Payments, and Approvals

| Field | Value |
|---|---|
| Goal | Build event management, event registration, payment status tracking, and admin approval workflow. |
| Duration | Week 2 |

Tasks:

- [ ] Implement event categories.
- [ ] Implement event CRUD.
- [ ] Implement publish/unpublish/cancel event actions.
- [ ] Implement event listing and details pages.
- [ ] Implement free event registration.
- [ ] Implement paid event registration.
- [ ] Implement payment status model.
- [ ] Implement manual/offline payment status option.
- [ ] Implement admin registration management.
- [ ] Implement approval/rejection workflow.
- [ ] Implement user registration status dashboard.

Validation:

- [ ] User can register for free and paid events.
- [ ] Admin can approve or reject registrations.
- [ ] Payment status controls QR eligibility.

### Phase 3 — QR, Attendance, Courses, and Notifications

| Field | Value |
|---|---|
| Goal | Build QR ticketing, scanner check-in, recorded course access, and notifications. |
| Duration | Week 3 |

Tasks:

- [ ] Implement QR ticket generation.
- [ ] Implement QR ticket user dashboard view.
- [ ] Implement QR resend from admin dashboard.
- [ ] Implement QR scanner page.
- [ ] Implement attendance check-in.
- [ ] Implement duplicate/wrong-event/expired QR detection.
- [ ] Implement course categories.
- [ ] Implement course CRUD.
- [ ] Implement video lesson management.
- [ ] Implement protected video access.
- [ ] Implement basic announcements.
- [ ] Implement email notification templates.

Validation:

- [ ] Approved and paid registrations generate QR tickets.
- [ ] Scanner can check in valid attendees.
- [ ] Invalid QR scans show clear errors.
- [ ] Users can access enrolled courses only.

### Phase 4 — Reports, Content, QA, and Launch Hardening

| Field | Value |
|---|---|
| Goal | Complete admin independence, reports, exports, content management, QA, security review, and production launch. |
| Duration | Week 4 |

Tasks:

- [ ] Implement reports dashboard.
- [ ] Implement CSV/Excel exports.
- [ ] Implement static content pages management.
- [ ] Implement FAQ management.
- [ ] Implement privacy policy, terms, refund policy, and support content management.
- [ ] Implement admin audit logs views.
- [ ] Test role and permission boundaries.
- [ ] Test event registration flow end-to-end.
- [ ] Test payment status rules.
- [ ] Test QR scan flow.
- [ ] Test course access security.
- [ ] Optimize page load and API response times.
- [ ] Configure production backups.
- [ ] Configure monitoring and alerts.
- [ ] Prepare launch checklist.

Validation:

- [ ] AMG Academy staff can perform daily admin tasks without developer support.
- [ ] V1 is ready for production launch.

---

## 11. User Flow, Edge Cases, API Design, Data Model, Build Order, UX Rules

### User Flow — Event Registration and QR Check-In

1. Dentist opens AMG Academy Platform.
2. Dentist creates account or logs in.
3. Dentist verifies email if required.
4. Dentist opens event listing.
5. Dentist selects an AMG Academy event, congress, booth activity, or offline course.
6. System displays event date, location, description, capacity, price, and registration deadline.
7. Dentist submits registration.
8. If event is free, registration becomes pending approval or approved depending on event settings.
9. If event is paid, system creates payment record and marks registration as payment pending.
10. Admin reviews registration and payment status.
11. Admin approves or rejects registration.
12. System generates QR ticket only after approval and payment conditions are satisfied.
13. Dentist receives QR ticket by email and dashboard.
14. Dentist attends event.
15. Event staff opens scanner page.
16. Event staff scans QR ticket.
17. System validates ticket, event, payment, approval, expiry, and duplicate status.
18. System records check-in.
19. System displays success message.
20. Admin views attendance report and exports attendee list.

### User Flow — Course Enrollment and Video Access

1. Dentist logs in.
2. Dentist opens course listing.
3. Dentist selects recorded course.
4. System displays course details, lessons, instructor, and price.
5. Dentist enrolls in free course or starts payment for paid course.
6. System confirms access conditions.
7. Dentist opens course dashboard.
8. Dentist selects video lesson.
9. System checks enrollment and payment authorization.
10. System loads protected video player.
11. System tracks progress where enabled.
12. Dentist resumes course later from dashboard.

### Admin Flow — Full Dashboard Management

1. Admin logs in.
2. System verifies role and permissions.
3. Admin lands on overview dashboard.
4. Admin manages users, staff roles, permissions, events, registrations, payments, QR tickets, attendance, announcements, courses, content, reports, and audit logs.
5. System validates each action.
6. System saves changes.
7. System shows success or error feedback.
8. System records sensitive actions in audit logs.

### Edge Cases

| Condition | System Behavior | User Feedback |
|---|---|---|
| Invalid registration input | Reject submission and keep entered data | Inline validation message explains required correction |
| Duplicate event registration | Prevent second registration | “You are already registered for this event.” |
| Empty event list | Show empty state | “No published events are available right now.” |
| Empty course list | Show empty state | “No courses are available right now.” |
| Event capacity full | Block registration or offer waiting list if enabled | “This event is full.” |
| Registration deadline passed | Block registration | “Registration deadline has passed.” |
| Payment failed | Keep payment status failed and allow retry | “Payment failed. Please try again or contact support.” |
| Payment webhook invalid | Reject webhook and log security event | No user-facing change; admin sees payment still pending/failed |
| Admin approval conflict | Prevent action if registration already processed | “This registration was already updated.” |
| QR already used | Do not create second check-in | “Ticket already checked in.” |
| QR for wrong event | Reject scan | “This ticket is not valid for this event.” |
| QR expired or revoked | Reject scan | “This ticket is expired, cancelled, or invalid.” |
| Unauthorized admin module | Hide or block module | “You do not have permission to access this area.” |
| Network/API failure | Preserve page state and allow retry | “Something went wrong. Please try again.” |
| Missing video file | Block playback and log issue | “This lesson is temporarily unavailable.” |
| Direct video URL access | Deny request | “Access denied.” |
| Export with no data | Generate headers only or show empty state | “No records match the selected filters.” |

### API Design

#### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/v1/auth/register | Create user account |
| POST | /api/v1/auth/login | Authenticate user |
| POST | /api/v1/auth/logout | End session |
| POST | /api/v1/auth/verify-email | Verify email |
| POST | /api/v1/auth/forgot-password | Request password reset |
| POST | /api/v1/auth/reset-password | Reset password |
| GET | /api/v1/auth/me | Get current authenticated user |

#### Users, Roles, and Permissions

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/v1/users | List users |
| POST | /api/v1/users | Create user manually |
| GET | /api/v1/users/:id | View user |
| PUT | /api/v1/users/:id | Update user |
| PATCH | /api/v1/users/:id/disable | Disable user |
| DELETE | /api/v1/users/:id | Delete user if allowed |
| GET | /api/v1/roles | List roles |
| POST | /api/v1/roles | Create role |
| PUT | /api/v1/roles/:id | Update role |
| GET | /api/v1/permissions | List permissions |
| PUT | /api/v1/roles/:id/permissions | Update role permissions |

#### Events and Registrations

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/v1/events | List published events |
| POST | /api/v1/events | Create event |
| GET | /api/v1/events/:id | View event details |
| PUT | /api/v1/events/:id | Update event |
| DELETE | /api/v1/events/:id | Delete/archive event |
| PATCH | /api/v1/events/:id/publish | Publish event |
| PATCH | /api/v1/events/:id/unpublish | Unpublish event |
| PATCH | /api/v1/events/:id/cancel | Cancel event |
| GET | /api/v1/event-categories | List event categories |
| POST | /api/v1/event-categories | Create event category |
| POST | /api/v1/events/:id/register | Register for event |
| GET | /api/v1/registrations | Admin list registrations |
| GET | /api/v1/my/registrations | User list own registrations |
| PATCH | /api/v1/registrations/:id/approve | Approve registration |
| PATCH | /api/v1/registrations/:id/reject | Reject registration |
| PATCH | /api/v1/registrations/:id/cancel | Cancel registration |

#### Payments

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/v1/payments/initiate | Start payment |
| GET | /api/v1/payments | List payments |
| GET | /api/v1/payments/:id | View payment |
| PATCH | /api/v1/payments/:id/manual-verify | Mark manual/offline payment |
| PATCH | /api/v1/payments/:id/refund-status | Update refund status |
| POST | /api/v1/payments/webhook/:provider | Receive payment webhook |

#### QR Tickets and Attendance

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/v1/registrations/:id/qr-ticket | Generate QR ticket |
| GET | /api/v1/my/qr-tickets | User list own QR tickets |
| POST | /api/v1/qr-tickets/:id/resend | Resend QR ticket |
| POST | /api/v1/qr/validate | Validate scanned QR token |
| POST | /api/v1/qr/check-in | Check in attendee |
| GET | /api/v1/attendance | List attendance records |
| GET | /api/v1/events/:id/attendance | Event attendance report |

#### Courses and Lessons

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/v1/courses | List courses |
| POST | /api/v1/courses | Create course |
| GET | /api/v1/courses/:id | View course |
| PUT | /api/v1/courses/:id | Update course |
| DELETE | /api/v1/courses/:id | Delete/archive course |
| PATCH | /api/v1/courses/:id/publish | Publish course |
| PATCH | /api/v1/courses/:id/unpublish | Unpublish course |
| POST | /api/v1/courses/:id/enroll | Enroll in course |
| GET | /api/v1/my/courses | User list own courses |
| POST | /api/v1/courses/:id/lessons | Create lesson |
| PUT | /api/v1/lessons/:id | Update lesson |
| DELETE | /api/v1/lessons/:id | Delete lesson |
| GET | /api/v1/lessons/:id/playback | Get protected playback access |
| POST | /api/v1/lessons/:id/progress | Save lesson progress |

#### Announcements, Notifications, Content, Reports, Audit Logs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/v1/announcements | List announcements |
| POST | /api/v1/announcements | Create announcement |
| PUT | /api/v1/announcements/:id | Update announcement |
| DELETE | /api/v1/announcements/:id | Delete announcement |
| GET | /api/v1/notifications | List user notifications |
| PATCH | /api/v1/notifications/:id/read | Mark notification as read |
| GET | /api/v1/content-pages | List static content pages |
| PUT | /api/v1/content-pages/:slug | Update static content page |
| GET | /api/v1/reports/overview | Admin overview metrics |
| GET | /api/v1/reports/export | Export report |
| GET | /api/v1/audit-logs | View audit logs |

### Data Model

#### User

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| full_name | String | Required |
| email | String | Unique |
| phone | String | Optional/required based on business rules |
| password_hash | String | Hashed |
| email_verified_at | DateTime | Nullable |
| status | Enum | active, disabled, deleted |
| role_id | UUID | FK to Role |
| created_at | DateTime | System field |
| updated_at | DateTime | System field |

#### Role

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | String | Super Admin, AMG Admin, Event Staff / Scanner, Instructor, User / Student |
| description | Text | Optional |
| is_system_role | Boolean | Protects default roles |
| created_at | DateTime | System field |

#### Permission

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| key | String | Example: events.create |
| module | String | users, roles, events, payments, courses |
| description | Text | Optional |

#### RolePermission

| Field | Type | Notes |
|---|---|---|
| role_id | UUID | FK to Role |
| permission_id | UUID | FK to Permission |

#### Event

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| category_id | UUID | FK to EventCategory |
| title | String | Required |
| description | Text | Required |
| image_url | String | Optional |
| start_datetime | DateTime | Required |
| end_datetime | DateTime | Required |
| location | String | Required for offline events |
| capacity | Integer | Optional |
| price | Decimal | 0 for free |
| currency | String | Example: EGP |
| registration_deadline | DateTime | Required |
| status | Enum | draft, published, unpublished, cancelled |
| requires_approval | Boolean | Default true |
| created_by | UUID | FK to User |
| created_at | DateTime | System field |

#### EventCategory

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | String | Required |
| description | Text | Optional |
| status | Enum | active, inactive |

#### EventRegistration

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| event_id | UUID | FK to Event |
| user_id | UUID | FK to User |
| status | Enum | pending, approved, rejected, cancelled, waiting_list |
| payment_status | Enum | not_required, pending, successful, failed, refunded, manual_verified |
| rejection_reason | Text | Nullable |
| approved_by | UUID | FK to User |
| approved_at | DateTime | Nullable |
| created_at | DateTime | System field |

#### Payment

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | FK to User |
| event_registration_id | UUID | Nullable |
| course_enrollment_id | UUID | Nullable |
| provider | String | Paymob, Fawry, Stripe, PayPal, manual |
| amount | Decimal | Required |
| currency | String | EGP or configured currency |
| status | Enum | pending, successful, failed, refunded, cancelled, manual_verified |
| provider_reference | String | Nullable |
| receipt_url | String | Nullable |
| created_at | DateTime | System field |
| updated_at | DateTime | System field |

#### QRTicket

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| registration_id | UUID | FK to EventRegistration |
| user_id | UUID | FK to User |
| event_id | UUID | FK to Event |
| token_hash | String | Secure stored token hash |
| status | Enum | active, used, expired, revoked |
| issued_at | DateTime | Required |
| expires_at | DateTime | Nullable |
| last_sent_at | DateTime | Nullable |

#### AttendanceCheckIn

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| qr_ticket_id | UUID | FK to QRTicket |
| registration_id | UUID | FK to EventRegistration |
| event_id | UUID | FK to Event |
| user_id | UUID | FK to User |
| scanned_by | UUID | FK to User |
| scanned_at | DateTime | Required |
| result | Enum | success, duplicate, invalid, wrong_event, expired, unpaid |
| device_info | Text | Optional |

#### Course

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| category_id | UUID | FK to CourseCategory |
| title | String | Required |
| description | Text | Required |
| instructor_id | UUID | FK to User |
| price | Decimal | 0 for free |
| currency | String | Example: EGP |
| status | Enum | draft, published, unpublished, archived |
| created_by | UUID | FK to User |
| created_at | DateTime | System field |

#### CourseCategory

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | String | Required |
| description | Text | Optional |
| status | Enum | active, inactive |

#### Lesson

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| course_id | UUID | FK to Course |
| title | String | Required |
| description | Text | Optional |
| video_id | UUID | FK to Video |
| sort_order | Integer | Required |
| status | Enum | draft, published, unpublished |

#### Video

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| storage_provider | String | vps, cloudflare_stream, bunny, vimeo, mux, s3 |
| storage_key | String | Internal reference |
| playback_url | String | Protected or generated URL |
| duration_seconds | Integer | Optional |
| download_allowed | Boolean | Default false |
| created_at | DateTime | System field |

#### CourseEnrollment

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| course_id | UUID | FK to Course |
| user_id | UUID | FK to User |
| status | Enum | pending, active, revoked, completed |
| payment_status | Enum | not_required, pending, successful, failed, refunded, manual_verified |
| enrolled_at | DateTime | System field |

#### CourseProgress

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| course_enrollment_id | UUID | FK to CourseEnrollment |
| lesson_id | UUID | FK to Lesson |
| status | Enum | not_started, in_progress, completed |
| progress_seconds | Integer | Optional |
| completed_at | DateTime | Nullable |
| updated_at | DateTime | System field |

#### Announcement

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| title | String | Required |
| body | Text | Required |
| target_type | Enum | all_users, event_users, course_users, role_users |
| status | Enum | draft, published, archived |
| created_by | UUID | FK to User |
| published_at | DateTime | Nullable |

#### Notification

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | FK to User |
| type | String | registration, payment, qr, event, course, announcement |
| title | String | Required |
| body | Text | Required |
| channel | Enum | in_app, email, push |
| read_at | DateTime | Nullable |
| created_at | DateTime | System field |

#### StaticContentPage

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| slug | String | privacy-policy, terms, refund-policy, faq, support |
| title | String | Required |
| body | Text | Required |
| status | Enum | draft, published |
| updated_by | UUID | FK to User |
| updated_at | DateTime | System field |

#### AdminAuditLog

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| actor_id | UUID | FK to User |
| action | String | Example: registration.approved |
| entity_type | String | Example: EventRegistration |
| entity_id | UUID | Target entity |
| old_value | JSON | Nullable |
| new_value | JSON | Nullable |
| ip_address | String | Optional |
| created_at | DateTime | System field |

### Build Order

1. Authentication and role-based access.
2. User dashboard and admin dashboard shell.
3. Event and category management.
4. Event registration.
5. Payment status tracking.
6. Admin approval and rejection.
7. QR ticket generation.
8. QR scanner and attendance.
9. Course and video module.
10. Notifications and announcements.
11. Reports and exports.
12. Content management.
13. Audit logs.
14. QA, security hardening, launch.

### UX Rules

- All forms must validate instantly on the client and again on the backend.
- Required fields must be clearly marked.
- Errors must be shown inline beside the relevant field.
- Destructive actions require confirmation.
- Loading states must appear on all submit, approve, reject, payment, export, upload, and scan actions.
- Success feedback must appear after save, approval, QR generation, check-in, export, or publish.
- Empty states must explain what is missing and show the next action when possible.
- Admin dashboard tables must support pagination.
- Scanner page must use large, clear success/error states suitable for event environments.
- Payment and QR statuses must be visually distinct.
- Permission-restricted actions must be hidden or disabled with clear messaging.
- Video lesson pages must avoid exposing direct downloadable links.
- V2 mobile course playback screens must use platform-level protections against screenshots and screen recording where supported.

---

## 12. Success Metrics and KPIs

| Category | Metric | Target | Measurement Method | Owner |
|---|---|---|---|---|
| Delivery | V1 launch timeline | Launch within 4 weeks | Compare production launch date against kickoff date | Ahmed Developer |
| Product | Event registration completion rate | > 80% | Completed registrations ÷ started registrations | Product / Admin |
| Product | QR check-in success rate | > 95% | Successful scans ÷ total valid scan attempts | Product / Admin |
| Product | Duplicate QR prevention | 100% duplicate check-ins blocked | Attendance logs and duplicate scan events | Backend Dev |
| Admin | Admin independence | 90% of daily tasks completed without developer support | Staff task review after launch | Ahmed Developer |
| Payment | Payment tracking accuracy | > 99% | Payment status reconciliation against gateway/manual records | Backend Dev |
| Course | Authorized video access | 100% protected course videos require enrollment/access | QA test cases and access logs | Backend Dev |
| Course | Direct video download prevention | 100% of course videos avoid public direct file links | Security QA review | Backend Dev |
| Technical | API response time | < 500ms for standard endpoints | Application monitoring | Backend Dev |
| Technical | Error rate | < 0.1% critical user-facing errors | Error logs and monitoring | QA / Backend Dev |
| User | Task completion | > 80% for registration and course access tasks | QA scenarios and analytics | Product / QA |
| Localization Readiness | Arabic + English content structure | Data model supports bilingual content expansion | Schema and CMS review | Product / Frontend Dev |

### Tracking Tool

PostHog, Mixpanel, or server-side analytics may be used after launch. Initial V1 can use database reports, structured logs, and admin dashboard metrics.

### Review Frequency

| Review Point | Purpose |
|---|---|
| 1 week post-launch | Validate registration, QR, payment tracking, and admin workflows |
| 2 weeks post-launch | Review course access, reports, and operational issues |
| 30 days post-launch | Decide V1.5 improvements and V2 mobile readiness |

---

## 13. Timeline and Milestones

| Field | Value |
|---|---|
| Start Date | 2026-05-25 |
| Target Launch Date | 2026-06-22 |
| Total Duration | 4 weeks |
| Approval Owner | Ahmed Developer |

| Milestone | Description | Due Date | Status | Owner |
|---|---|---|---|---|
| Kickoff | Confirm PRD, scope, tech stack, and delivery plan | 2026-05-25 | TODO | Ahmed Developer |
| PRD Approved | Final PRD approved before development execution | 2026-05-26 | TODO | Ahmed Developer |
| Phase 1 Done | Foundation, auth, roles, database, dashboard shell complete | 2026-06-01 | TODO | Ahmed Developer |
| Phase 2 Done | Events, registration, payment tracking, approval workflow complete | 2026-06-08 | TODO | Ahmed Developer |
| Phase 3 Done | QR tickets, scanner, attendance, courses, notifications complete | 2026-06-15 | TODO | Ahmed Developer |
| Phase 4 Done | Reports, exports, content, audit logs, QA, security hardening complete | 2026-06-21 | TODO | Ahmed Developer |
| Beta Launch | Internal AMG Academy testing on production-like environment | 2026-06-21 | TODO | Ahmed Developer |
| Public Launch | V1 web platform released for users | 2026-06-22 | TODO | Ahmed Developer |

---

## 14. Risk Register

| ID | Description | Likelihood | Impact | Score | Mitigation | Owner |
|---|---|---|---|---:|---|---|
| R001 | 4-week timeline is aggressive for full admin dashboard, events, QR, payments, and courses. | High | High | 9 | Freeze V1 scope, prioritize P0, defer P1/P2 where needed. | Ahmed Developer |
| R002 | Admin dashboard scope may become too complex. | High | High | 9 | Build role-based modules incrementally and focus on daily operations first. | Ahmed Developer |
| R003 | Payment gateway selection may delay development. | Medium | High | 6 | Start with payment status abstraction and manual payment support; integrate selected gateway later. | Backend Dev |
| R004 | QR code security risk if tokens are predictable or reusable. | Medium | High | 6 | Use secure random tokens, token hashing, expiry, revocation, event matching, and duplicate detection. | Backend Dev |
| R005 | Video hosting on VPS may not scale and may increase bandwidth cost. | High | Medium | 6 | Use VPS only for early validation and plan migration to Cloudflare Stream, Bunny Stream, Vimeo, Mux, or CDN storage. | Ahmed Developer |
| R006 | Web cannot fully prevent screen recording of videos. | High | Medium | 6 | Prevent direct download, use protected playback, evaluate DRM provider, and use mobile OS-level screenshot/screen-record blocking in V2. | Backend Dev / Mobile Dev |
| R007 | Hostinger VPS configuration may require careful DevOps setup. | Medium | Medium | 4 | Set up Nginx, SSL, backups, process manager, monitoring, and deployment checklist early. | Backend Dev |
| R008 | App Store and Play Store requirements may affect V2 features such as in-app purchases and content policies. | Medium | High | 6 | Review store rules before V2 implementation and design mobile payment/subscription strategy accordingly. | Mobile Dev |
| R009 | Push notification limitations in web V1 may reduce notification effectiveness. | Medium | Medium | 4 | Use email and in-app notifications in V1; add Firebase Cloud Messaging push in V2. | Backend Dev |
| R010 | Scope creep from live webinars, certificates, CME, AI assistant, forums, and subscriptions may delay V1. | High | High | 9 | Place these items in V2/V3 roadmap unless explicitly approved as V1 changes. | Ahmed Developer |
| R011 | Staff may need training to manage platform independently. | Medium | Medium | 4 | Create simple admin flows, clear labels, and operational training checklist. | Product / QA |
| R012 | Bilingual Arabic + English needs may expand content and UI complexity. | Medium | Medium | 4 | Prepare content model for localization but defer full bilingual UI if needed. | Frontend Dev |

---

## 15. Stakeholders and Approvals

### Stakeholders

| Name | Role | Involvement | Contact |
|---|---|---|---|
| Ahmed Developer | Owner / PM / Primary Approver | Owns PRD, approves scope, approves development decisions, validates launch readiness | [TBD] |
| AMG Academy Decision Maker / Owner | Business Stakeholder | Confirms business requirements, payment preferences, academy operations, and launch approval if needed | [TBD] |
| AMG Academy Admin Staff | Operations Users | Manage users, events, registrations, approvals, courses, payments, announcements, and reports | [TBD] |
| Instructors | Course Managers | Upload or manage courses and lessons if given permission | [TBD] |
| Event Staff / Scanner | Event Operations | Scan QR codes and manage attendance check-in during events | [TBD] |
| Dentists / Students | End Users | Register for events, attend activities, and access courses | [TBD] |
| Development Team | Implementation Team | Design, build, test, deploy, and maintain platform | [TBD] |

### Approval Gates

| Gate | Approver | Required By | Status |
|---|---|---|---|
| PRD Approval | Ahmed Developer | 2026-05-26 | TODO |
| UI/UX Direction Approval | Ahmed Developer | 2026-05-29 | TODO |
| Technical Architecture Approval | Ahmed Developer | 2026-05-29 | TODO |
| Payment Flow Approval | Ahmed Developer | 2026-06-07 | TODO |
| Admin Dashboard Acceptance | Ahmed Developer | 2026-06-18 | TODO |
| Security and QR Flow Acceptance | Ahmed Developer | 2026-06-19 | TODO |
| Course Video Access Acceptance | Ahmed Developer | 2026-06-19 | TODO |
| Production Launch Approval | Ahmed Developer | 2026-06-22 | TODO |

---

## 16. References and Links

| Item | Link / Value | Notes |
|---|---|---|
| Design Files | [TBD] | Figma or design source |
| Repository | [TBD] | Git repository |
| API Documentation | [TBD] | Swagger/OpenAPI recommended |
| Architecture Diagrams | [TBD] | To be created during technical planning |
| Staging Environment | [TBD] | Required before launch |
| Production Environment | [TBD] | Hostinger VPS |
| CI/CD Pipeline | [TBD] | GitHub Actions recommended |
| Monitoring Dashboard | [TBD] | Error logs, uptime, server metrics |
| Payment Gateway Documentation | [TBD] | Paymob, Fawry, Stripe, PayPal, or selected provider |
| Video Hosting Documentation | [TBD] | Cloudflare Stream, Bunny Stream, Vimeo, Mux, or selected provider |
| Email Provider Documentation | [TBD] | SendGrid, Resend, Mailgun, SMTP, or selected provider |
| Related PRDs | [TBD] | Future V2 mobile PRD |
| Slack / Communication Channel | [TBD] | Team communication |
| Meeting Notes | [TBD] | Client and internal decisions |
| Legal Content | [TBD] | Privacy policy, terms, refund policy, support |

### Open Questions Before Development

1. Which payment gateway will be used first in Egypt: Paymob, Fawry, PayPal, Stripe, or manual/offline payment only?
2. Will V1 require actual online payment collection, or only payment status tracking/manual verification?
3. Should all event registrations require admin approval, or only selected events?
4. Should paid course access require admin approval after payment, or automatic access after payment success?
5. What user profile fields are required for dentists?
6. Will AMG Academy require Arabic + English UI in V1 or only content structure prepared for bilingual support?
7. Which email provider will be used?
8. What is the expected number of users, events, and course videos in the first 3 months?
9. Should course videos use VPS storage only for testing, or should a streaming provider be selected before public launch?
10. Should V1 include waiting lists and promo codes, or defer them to V1.5?
11. Which staff members need Super Admin, AMG Admin, Scanner, and Instructor access?
12. What reports are legally or operationally required by AMG Academy?
13. What refund policy should apply to paid events and paid courses?
14. What App Store and Play Store account ownership will be used for V2?
15. Will CME tracking and certificates be formal compliance features or basic internal tracking in future phases?

---

## 17. Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| v1.0 | 2026-05-25 | Ahmed Developer | Initial PRD created |