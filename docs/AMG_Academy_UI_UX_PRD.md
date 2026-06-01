# AMG Academy Platform v1.0 — UI/UX Product Requirements Document

## 1. Project Identity

| Field | Value |
|---|---|
| Product | AMG Academy Platform v1.0 |
| Document Type | UI/UX Product Requirements Document |
| Document Version | v1.0 |
| Status | Draft |
| Owner / PM | Ahmed Developer |
| Primary Approver | Ahmed Developer |
| Product Scope | V1 Web App, with responsive mobile web behavior and future V2 React Native alignment |
| Design Direction | Premium Corporate Medical Academy |
| Primary Audience | Dentists, AMG Academy students, event attendees, AMG Academy admins, instructors, and event scanner staff |
| Design Output Target | Ready for implementation in VS Code using Codex / Claude Code / design-to-code workflow |
| Source Product PRD | AMG Academy Platform v1.0 PRD |
| File Path Recommendation | docs/UI_UX_PRD.md |

---

## 2. Executive Summary

AMG Academy Platform is a premium digital academy and event management platform for the dental field in Egypt. It supports dentists and AMG Academy users in registering for events, receiving QR tickets, attending offline and online events, accessing recorded courses, receiving announcements, and managing their learning profile.

This UI/UX PRD defines the product experience, interface structure, design system, screen requirements, responsive behavior, accessibility standards, and interaction rules for the platform. It intentionally does **not** include Stitch AI prompts. The purpose is to guide designers and developers while implementing the interface directly in code using VS Code, Codex, Claude Code, or a similar development workflow.

The visual identity must align with the AMG / Allam Medical Group logo: black, white, silver, premium, corporate, medical, and high-trust. Blue must be used only as a restrained digital action accent, not as the main brand identity.

---

## 3. UI/UX Goals

### Business Goals

- Present AMG Academy as a premium, professional medical academy brand.
- Build trust with dentists and medical professionals.
- Reduce manual admin work through a clear, self-service admin dashboard.
- Improve conversion for event registration and course enrollment.
- Support free and paid events and courses without confusing the user.
- Prepare the product interface for future V2 React Native mobile app expansion.

### User Goals

- Register or log in easily.
- Discover relevant dental events, offline courses, congress activities, and online courses.
- Understand event/course pricing, access requirements, and status clearly.
- Complete registration and payment with confidence.
- Receive and present QR tickets easily.
- Access course videos securely.
- Track reservations, learning progress, announcements, and account settings.

### Admin Goals

- Manage daily operations without developer support.
- Create and update users, events, courses, announcements, payments, and content.
- Approve/reject registrations quickly.
- Scan QR tickets with clear success/error feedback.
- Export reports easily.
- Control roles and permissions safely.
- See system status and operational metrics at a glance.

### UX Quality Goals

- Fast, clear, mobile-first flows.
- High contrast and readable dark UI.
- Consistent status language across user and admin screens.
- Minimal cognitive load during payment, registration, and QR scanning.
- Clear distinction between pending, approved, rejected, paid, unpaid, checked-in, expired, and cancelled states.
- Interface must feel premium, not generic.

---

## 4. Brand and Visual Identity

### Brand Personality

The UI must communicate:

- Premium
- Medical
- Corporate
- Precise
- High-trust
- Modern
- Minimal
- Operationally reliable

The product should feel like a professional medical academy platform, not a casual consumer learning app.

### AMG Identity Interpretation

The uploaded AMG / Allam Medical Group logo uses a black base with white and silver identity. The UI should therefore use:

- Black as the primary environment.
- White as the strongest brand color.
- Silver/gray as the supporting brand language.
- Blue only as a controlled digital/action accent.
- Minimal glow and tonal layering instead of heavy shadows.
- Clean medical typography and structured layouts.

### Visual Rules

- Avoid bright purple-heavy or generic SaaS palettes.
- Avoid overusing blue on every card or badge.
- Avoid playful gradients and decorative illustrations unless very subtle.
- Use real dental, medical, academy, event, and product-learning imagery.
- Use black/silver surfaces for a premium AMG feel.
- Keep screens clean, precise, and professional.

---

## 5. Design System

### Color Tokens

| Token | Hex | Usage |
|---|---:|---|
| Primary Brand | `#FFFFFF` | AMG white, brand contrast, high-priority identity, strong text |
| Primary Action | `#2563EB` | CTAs, active navigation, checkout, reserve buttons, scanner actions |
| Secondary Brand | `#C7CBD1` | Silver accents, secondary icons, metadata, secondary buttons |
| Background Main | `#05070A` | Main app background |
| Surface | `#10141B` | Cards, forms, lists, dashboard panels |
| Elevated Surface | `#1A202A` | Modals, selected states, checkout panels, bottom sheets |
| Text Primary | `#F8FAFC` | Headings, primary body text, important labels |
| Text Secondary | `#A8B0BD` | Descriptions, subtitles, metadata, helper text |
| Text Muted | `#6B7280` | Placeholders, disabled states, low-priority labels |
| Border / Divider | `#2A303A` | Card borders, input borders, table dividers |
| Premium Highlight | `#D9DEE7` | Certificate badges, premium labels, subtle AMG identity accents |
| Success | `#22C55E` | Approved, confirmed, paid, valid QR, completed |
| Error | `#EF4444` | Failed, rejected, invalid QR, destructive actions |
| Warning | `#F59E0B` | Pending, limited seats, payment pending, deadlines |

### Color Usage Rules

- Use `#05070A` as the default app canvas.
- Use `#10141B` for normal cards and panels.
- Use `#1A202A` for elevated or selected containers.
- Use `#2563EB` only for clear action states.
- Use `#FFFFFF` / `#F8FAFC` for strong brand presence and readability.
- Use semantic colors consistently for system states.
- Do not rely on color alone. Always pair status color with text labels or icons.

### Typography

| Use Case | Font | Weight | Notes |
|---|---|---:|---|
| Page titles | Hanken Grotesk | 700 | Strong, premium, editorial feel |
| Section headings | Hanken Grotesk | 600–700 | Clear hierarchy |
| Card titles | Hanken Grotesk | 600 | Course/event cards |
| Body text | Inter | 400 | Long-form readability |
| Labels | Inter | 500–600 | Forms, metadata, buttons |
| Tables | Inter | 400–600 | Admin dashboard readability |
| Numbers / KPIs | Hanken Grotesk | 700 | Dashboard metric emphasis |

### Type Scale

| Token | Size | Line Height | Usage |
|---|---:|---:|---|
| Display | 40px | 48px | Desktop hero titles |
| H1 | 32px | 40px | Main desktop page titles |
| H2 | 24px | 32px | Section titles |
| H3 | 20px | 28px | Card and modal titles |
| Body Large | 16px | 24px | Main paragraphs |
| Body Medium | 14px | 20px | Standard UI text |
| Label | 12px | 16px | Badges, metadata, helper text |

### Spacing

- Base spacing scale: 8px.
- Mobile side margin: 16px.
- Desktop content margin: 24px–32px.
- Gap between related elements: 8px–12px.
- Gap between sections: 24px.
- Card padding: 16px mobile, 20px–24px desktop.
- Form field vertical gap: 16px.
- Dashboard grid gap: 16px–24px.

### Radius

| Component | Radius |
|---|---:|
| Buttons | 8px |
| Inputs | 8px |
| Small cards | 12px |
| Large cards | 16px |
| Modals / bottom sheets | 16px |
| Avatars | Full radius |
| Badges | 4px–6px |

### Elevation

- Prefer tonal layering and borders over heavy shadows.
- Use `#2A303A` borders for most cards.
- Use subtle silver/white glow only for premium cards, active states, or logo areas.
- Avoid colorful shadows.
- Modals use elevated surface `#1A202A` plus backdrop overlay.

### Iconography

- Use Lucide Icons or equivalent outlined icon system.
- Stroke: 1.75px–2px.
- Icons must be simple, medical/professional, and consistent.
- Avoid mixed icon styles.
- All icon-only buttons must have accessible labels.

---

## 6. Navigation Architecture

### User Web / Mobile Navigation

Primary mobile bottom navigation:

1. Dashboard
2. Courses
3. Events
4. Reservations / Tickets
5. Profile

Optional secondary items:

- Announcements
- Notifications
- Help Center
- Settings

### Desktop User Navigation

For desktop web, use either:

- Top navigation for public/marketing pages.
- Left sidebar or compact dashboard navigation after login.

Recommended logged-in desktop navigation:

- Dashboard
- Courses
- Events
- My Reservations
- Announcements
- Profile

### Admin Navigation

Admin dashboard must use a left sidebar on desktop:

1. Dashboard
2. Users
3. Roles & Permissions
4. Events
5. Event Categories
6. Registrations
7. Payments
8. QR Scanner
9. Attendance Logs
10. Courses
11. Lessons / Videos
12. Announcements
13. Content Pages
14. Reports
15. Export Center
16. Audit Logs
17. Settings

### Mobile Admin Navigation

- Use hamburger drawer.
- Scanner-only staff must see only:
  - QR Scanner
  - Attendance Logs if permitted
  - Logout

### Navigation State Rules

- Active item uses `#2563EB`.
- Inactive item uses `#A8B0BD`.
- Disabled/unavailable item uses `#6B7280`.
- Critical badges use semantic colors.
- Navigation must remain consistent across screens.

---

## 7. Information Architecture

### Public / Authentication Area

- Splash / Welcome
- Login
- Register
- Forgot Password
- Reset Password
- Email Verification
- Terms / Privacy / Refund pages

### User Area

- User Dashboard
- Course Catalog
- Course Details
- Course Video Player
- My Learning
- Event Listing
- Event Details
- Event Registration
- Checkout
- Payment Result
- My Reservations
- QR Ticket
- Announcements
- Notifications
- Profile
- Settings
- Help / Support

### Admin Area

- Admin Overview
- User Management
- Role and Permission Management
- Event Management
- Registration Management
- Payment Management
- QR Scanner
- Attendance Logs
- Course Management
- Lesson / Video Management
- Announcement Management
- Content Management
- Reports
- Export Center
- Audit Logs

---

## 8. Screen Inventory

### Authentication Screens

| ID | Screen | Priority |
|---|---|---|
| UX-001 | Splash / Welcome | P0 |
| UX-002 | Login | P0 |
| UX-003 | Register / Sign Up | P0 |
| UX-004 | Forgot Password | P0 |
| UX-005 | Reset Password | P0 |
| UX-006 | Email Verification | P0 |
| UX-007 | Session Expired | P1 |

### User Screens

| ID | Screen | Priority |
|---|---|---|
| UX-008 | User Dashboard | P0 |
| UX-009 | Course Catalog | P0 |
| UX-010 | Course Details | P0 |
| UX-011 | Course Video Player | P0 |
| UX-012 | My Learning | P1 |
| UX-013 | Event Listing | P0 |
| UX-014 | Event Details | P0 |
| UX-015 | Event Registration | P0 |
| UX-016 | Checkout / Payment | P0 |
| UX-017 | Payment Success | P0 |
| UX-018 | Payment Failed | P0 |
| UX-019 | My Reservations | P0 |
| UX-020 | QR Ticket | P0 |
| UX-021 | Announcements List | P1 |
| UX-022 | Announcement Details | P1 |
| UX-023 | Notifications | P1 |
| UX-024 | User Profile | P0 |
| UX-025 | Edit Profile | P1 |
| UX-026 | Account Settings | P1 |
| UX-027 | Notification Preferences | P1 |
| UX-028 | Help / Support | P1 |
| UX-029 | Terms / Privacy / Refund Content | P0 |

### Admin Screens

| ID | Screen | Priority |
|---|---|---|
| UX-030 | Admin Dashboard Overview | P0 |
| UX-031 | Admin User Management List | P0 |
| UX-032 | Admin User Details | P0 |
| UX-033 | Admin Create / Edit User | P0 |
| UX-034 | Admin Role and Permission Management | P0 |
| UX-035 | Admin Event Management List | P0 |
| UX-036 | Admin Create / Edit Event | P0 |
| UX-037 | Admin Event Details | P0 |
| UX-038 | Admin Event Categories | P1 |
| UX-039 | Admin Registration Management | P0 |
| UX-040 | Admin Registration Details / Approval | P0 |
| UX-041 | Admin Payment Management | P0 |
| UX-042 | Admin QR Scanner | P0 |
| UX-043 | Admin Attendance Logs | P0 |
| UX-044 | Admin Announcements Management | P1 |
| UX-045 | Admin Create / Edit Announcement | P1 |
| UX-046 | Admin Course Management List | P0 |
| UX-047 | Admin Create / Edit Course | P0 |
| UX-048 | Admin Course Details | P0 |
| UX-049 | Admin Lesson / Video Management | P0 |
| UX-050 | Admin Content Management | P1 |
| UX-051 | Admin Reports Dashboard | P1 |
| UX-052 | Admin Export Center | P1 |
| UX-053 | Admin Audit Logs | P1 |

### Utility Screens

| ID | Screen | Priority |
|---|---|---|
| UX-054 | 404 Not Found | P1 |
| UX-055 | 403 Access Denied | P0 |
| UX-056 | 500 Server Error | P1 |
| UX-057 | Offline / No Connection | P1 |
| UX-058 | Empty State Template | P0 |

---

## 9. Core User Flows

### Flow 1 — New User Registration

1. User opens AMG Academy.
2. User taps Get Started.
3. User creates an account.
4. User verifies email.
5. User lands on dashboard.
6. User can browse events and courses.

### Flow 2 — Event Registration

1. User opens Events.
2. User searches or filters events.
3. User opens Event Details.
4. User taps Reserve Spot.
5. User completes registration form.
6. If free, registration goes to pending approval or approved state.
7. If paid, user goes to Checkout.
8. User receives confirmation state.
9. After approval/payment, QR ticket appears in My Reservations.

### Flow 3 — QR Ticket Check-In

1. User opens My Reservations.
2. User opens QR Ticket.
3. Event staff opens Admin QR Scanner.
4. Staff scans QR.
5. System validates event, payment, approval, expiry, and duplicate use.
6. System shows clear success or error.
7. Attendance is recorded.

### Flow 4 — Course Enrollment

1. User opens Course Catalog.
2. User filters/searches courses.
3. User opens Course Details.
4. User enrolls or buys course.
5. User completes checkout if paid.
6. User opens course player.
7. System verifies access.
8. User watches lesson and progress is saved.

### Flow 5 — Admin Event Creation

1. Admin opens Events.
2. Admin clicks Create Event.
3. Admin adds title, description, image, date/time, location, capacity, price, and deadline.
4. Admin saves draft or publishes.
5. Event appears in public listing if published.

### Flow 6 — Admin Registration Approval

1. Admin opens Registrations.
2. Admin filters pending registrations.
3. Admin opens registration details.
4. Admin checks user, event, and payment status.
5. Admin approves or rejects.
6. System updates status.
7. QR ticket is generated if conditions are met.

### Flow 7 — Admin Course Creation

1. Admin opens Courses.
2. Admin creates course.
3. Admin adds course details, price, instructor, and thumbnail.
4. Admin adds lessons/videos.
5. Admin publishes course.
6. Course appears in catalog.

---

## 10. Screen Requirements

## 10.1 Authentication Screens

### UX-001 — Splash / Welcome

**Purpose:** Introduce AMG Academy and guide users to sign up or log in.

**Required UI Elements:**

- AMG logo.
- Headline: “AMG Academy”.
- Subheadline focused on dental learning and events.
- Primary button: Get Started.
- Secondary link: Log In.
- Premium dark background.
- Subtle silver glow behind logo.

**States:**

- Loading.
- App initialization error.
- Default.

**Acceptance Criteria:**

- User can start onboarding/sign-up.
- Returning user can log in.
- Logo is clearly visible.
- Screen matches AMG black/white/silver identity.

### UX-002 — Login

**Purpose:** Allow users and staff to sign in securely.

**Required UI Elements:**

- AMG logo.
- Email or phone input.
- Password input.
- Show/hide password toggle.
- Forgot password link.
- Sign In button.
- Create Account link.
- Error banner.

**States:**

- Empty.
- Filled.
- Loading.
- Invalid credentials.
- Disabled account.
- Success redirect.

**Acceptance Criteria:**

- Inputs are clearly labeled.
- Password can be shown/hidden.
- Login errors are understandable.
- User is redirected by role after login.

### UX-003 — Register / Sign Up

**Purpose:** Allow dentists and users to create an account.

**Required UI Elements:**

- First name.
- Last name.
- Email.
- Phone.
- Profession/specialty.
- Password.
- Confirm password.
- Terms checkbox.
- Create Account button.
- Login link.

**States:**

- Empty.
- Validation error.
- Duplicate email.
- Loading.
- Success/email verification required.

**Acceptance Criteria:**

- Required fields are obvious.
- Password rules are visible.
- Terms must be accepted.
- User receives verification direction.

### UX-004 — Forgot Password

**Purpose:** Let users request reset instructions.

**Required UI Elements:**

- Email input.
- Send Reset Link button.
- Back to Login link.
- Success message after sending.

**Acceptance Criteria:**

- Valid email is required.
- Success state does not expose whether email exists for security.
- User can return to login.

### UX-005 — Reset Password

**Purpose:** Let users create a new password from reset link.

**Required UI Elements:**

- New password.
- Confirm new password.
- Password strength indicator.
- Reset Password button.
- Expired link message.

**Acceptance Criteria:**

- Password rules are enforced.
- Mismatch is shown inline.
- Expired link gives request-new-link action.

### UX-006 — Email Verification

**Purpose:** Inform users to verify their email.

**Required UI Elements:**

- Verification message.
- Email address display.
- Resend email button.
- Open email app button.
- Change email link.

**Acceptance Criteria:**

- User understands verification is required.
- Resend has cooldown.
- Success redirects to dashboard.

### UX-007 — Session Expired

**Purpose:** Tell users their session expired.

**Required UI Elements:**

- Lock/clock icon.
- Message.
- Sign In Again button.

**Acceptance Criteria:**

- User can return to login.
- No protected data remains visible.

---

## 10.2 User Screens

### UX-008 — User Dashboard

**Purpose:** Show personalized home content.

**Required UI Elements:**

- Header with user greeting.
- Notifications shortcut.
- Latest announcements.
- Upcoming events.
- Top courses.
- Quick links to QR tickets, courses, reservations.
- Bottom mobile tab navigation.

**Acceptance Criteria:**

- User can quickly access events and courses.
- Empty states appear when no data exists.
- Mobile navigation is always clear.

### UX-009 — Course Catalog

**Purpose:** Let users browse courses.

**Required UI Elements:**

- Search bar.
- Category filters.
- Course cards.
- Course image.
- Course title.
- Instructor.
- Price/free label.
- Rating or metadata if available.
- Premium subscription / pass card if applicable.

**Acceptance Criteria:**

- User can search and filter courses.
- Free and paid courses are visually clear.
- Course cards open details.

### UX-010 — Course Details

**Purpose:** Explain course value and drive enrollment.

**Required UI Elements:**

- Hero image.
- Course title.
- Instructor.
- Price.
- Rating.
- Course overview.
- Lessons count.
- Duration.
- Level.
- Certificate indicator.
- Curriculum list.
- Buy Course / Enroll / Start Learning button.

**Acceptance Criteria:**

- User knows whether course is free or paid.
- Locked/free preview lessons are clear.
- CTA changes based on enrollment state.

### UX-011 — Course Video Player

**Purpose:** Let enrolled users watch lessons securely.

**Required UI Elements:**

- Video player.
- Lesson title.
- Course progress.
- Curriculum list.
- Next/previous controls.
- Mark Complete button.
- Protected playback notice if needed.

**Acceptance Criteria:**

- Download button is not shown.
- Direct video links are not exposed in UI.
- Unauthorized users see access denied.
- Mobile V2 must support screen recording/screenshot blocking where technically possible.

### UX-012 — My Learning

**Purpose:** Show active courses and progress.

**Required UI Elements:**

- Active course cards.
- Progress bars.
- Saved lessons.
- Certificates entry point.
- Continue Learning CTA.

**Acceptance Criteria:**

- User can resume learning.
- Empty state links to course catalog.
- Progress is understandable.

### UX-013 — Event Listing

**Purpose:** Let users browse events.

**Required UI Elements:**

- Search.
- Category filters.
- Event cards.
- Date/time.
- Location.
- Price/free label.
- Seats remaining.
- Reserve/Details CTA.

**Acceptance Criteria:**

- User can distinguish webinars, congresses, booths, and offline courses.
- Full events show correct disabled state.
- Paid/free status is clear.

### UX-014 — Event Details

**Purpose:** Show full event information and registration CTA.

**Required UI Elements:**

- Event hero image.
- Event badges.
- Title.
- Date/time.
- Location.
- Seats remaining.
- Price.
- About section.
- Speakers section if available.
- Location map preview.
- Sticky Reserve Spot bar.

**Acceptance Criteria:**

- User understands event details before registering.
- CTA is always easy to reach.
- Cancelled/sold-out/past events show correct state.

### UX-015 — Event Registration

**Purpose:** Collect attendee information.

**Required UI Elements:**

- Event summary.
- Attendee details form.
- Professional details.
- Notes.
- Terms agreement.
- Submit Registration / Continue to Payment button.

**Acceptance Criteria:**

- Required fields validate inline.
- Duplicate registration is prevented.
- User sees next step clearly.

### UX-016 — Checkout / Payment

**Purpose:** Complete payment for paid courses/events.

**Required UI Elements:**

- Order summary.
- Payment method selection.
- Card/payment form.
- Paymob/Fawry/manual option if enabled.
- Total due.
- Secure payment notice.
- Pay Now button.

**Acceptance Criteria:**

- Total price is clear.
- Payment method selection is clear.
- Failed payment gives retry.
- Pending offline payment gives instructions.

### UX-017 — Payment Success

**Purpose:** Confirm payment and guide next action.

**Required UI Elements:**

- Success icon.
- Payment summary.
- Receipt reference.
- Next action:
  - View QR Ticket.
  - Go to Reservations.
  - Start Course.

**Acceptance Criteria:**

- User knows payment result.
- User can continue to relevant next step.

### UX-018 — Payment Failed

**Purpose:** Explain failure and allow retry.

**Required UI Elements:**

- Error icon.
- Failure reason.
- Order summary.
- Try Again button.
- Choose Another Method button.
- Contact Support link.

**Acceptance Criteria:**

- User can retry payment.
- User understands no access is granted until payment succeeds.

### UX-019 — My Reservations

**Purpose:** Show user event registrations.

**Required UI Elements:**

- Upcoming/Past tabs.
- Reservation cards.
- Status badges.
- Event date/location.
- View QR Code button.
- View Access Link button for virtual events.

**Acceptance Criteria:**

- User can find upcoming tickets quickly.
- Past events are separated.
- Pending/rejected/confirmed states are clear.

### UX-020 — QR Ticket

**Purpose:** Display QR ticket for event check-in.

**Required UI Elements:**

- Event title.
- Attendee name.
- Date/time.
- QR code.
- Registration status.
- Payment status.
- Ticket status.
- Ticket code fallback.

**Acceptance Criteria:**

- QR is large enough to scan.
- Invalid/expired/used ticket state is visible.
- User can access event details.

### UX-021 — Announcements List

**Purpose:** Show academy updates.

**Required UI Elements:**

- Announcement cards.
- Category badges.
- Time/date.
- Title.
- Snippet.
- Read More action.

**Acceptance Criteria:**

- User can browse announcements.
- Important/system announcements stand out.

### UX-022 — Announcement Details

**Purpose:** Show full announcement.

**Required UI Elements:**

- Title.
- Category.
- Date.
- Image if available.
- Full content.
- Related CTA if applicable.

**Acceptance Criteria:**

- Content is readable.
- Links and CTAs are clear.

### UX-023 — Notifications

**Purpose:** Show personal notifications.

**Required UI Elements:**

- Notification list.
- Filters: All, Unread, Events, Courses, Payments.
- Mark all read.
- Unread indicator.

**Acceptance Criteria:**

- User can distinguish unread notifications.
- Tapping notification opens related item.

### UX-024 — User Profile

**Purpose:** Show user identity and account sections.

**Required UI Elements:**

- Avatar.
- Name.
- Role/profession.
- Stats.
- Learning section.
- Account section.
- Preferences.
- Support.
- Logout.

**Acceptance Criteria:**

- User can access settings and support.
- Logout is clear and confirmed if needed.

### UX-025 — Edit Profile

**Purpose:** Update profile information.

**Required UI Elements:**

- Avatar upload.
- Full name.
- Email.
- Phone.
- Specialty.
- Clinic/hospital.
- City.
- Save Changes button.

**Acceptance Criteria:**

- Changes validate.
- User sees success toast.
- Unsaved changes warning appears.

### UX-026 — Account Settings

**Purpose:** Manage account controls.

**Required UI Elements:**

- Profile settings.
- Security.
- Notifications.
- Billing/payment methods.
- Language.
- Privacy.
- Danger zone.

**Acceptance Criteria:**

- Settings are grouped logically.
- Danger actions are protected by confirmation.

### UX-027 — Notification Preferences

**Purpose:** Manage notification preferences.

**Required UI Elements:**

- Event notification toggles.
- Course notification toggles.
- Payment notification toggles.
- Announcement toggles.
- Email and in-app channels.
- V2 push notification note.

**Acceptance Criteria:**

- Toggles save correctly.
- Disabled future push option is clear.

### UX-028 — Help / Support

**Purpose:** Provide support access.

**Required UI Elements:**

- Search help.
- FAQ categories.
- Contact support.
- Support form.
- Common topics.

**Acceptance Criteria:**

- User can find help topics.
- User can submit support request.

### UX-029 — Terms / Privacy / Refund Content

**Purpose:** Display legal content.

**Required UI Elements:**

- Page title.
- Last updated.
- Content sections.
- Contact support link.

**Acceptance Criteria:**

- Content is readable on mobile.
- Admin-managed updates display correctly.

---

## 10.3 Admin Screens

### UX-030 — Admin Dashboard Overview

**Purpose:** Show operational overview.

**Required UI Elements:**

- Left sidebar.
- Top header.
- KPI cards.
- Recent registrations.
- Payment status.
- Upcoming events.
- Quick actions.

**Acceptance Criteria:**

- Admin can see platform status quickly.
- Quick actions link to core modules.

### UX-031 — Admin User Management List

**Purpose:** Manage users.

**Required UI Elements:**

- Search.
- Filters.
- User table.
- Role/status badges.
- Create User button.
- Bulk actions.
- Pagination.

**Acceptance Criteria:**

- Admin can find users quickly.
- User status is clear.
- Bulk actions are permission-controlled.

### UX-032 — Admin User Details

**Purpose:** View one user.

**Required UI Elements:**

- User profile header.
- Contact info.
- Role/status.
- Registrations tab.
- Courses tab.
- Payments tab.
- Activity tab.
- Admin actions.

**Acceptance Criteria:**

- Admin can review user activity.
- Sensitive actions are permission-based.

### UX-033 — Admin Create / Edit User

**Purpose:** Create/edit user accounts.

**Required UI Elements:**

- User form.
- Role select.
- Status toggle.
- Send invite/reset access option.
- Save button.

**Acceptance Criteria:**

- Required fields validate.
- Role changes are logged.

### UX-034 — Admin Role and Permission Management

**Purpose:** Manage flexible permissions.

**Required UI Elements:**

- Role list.
- Permission matrix.
- Module groups.
- Sensitive permission warnings.
- Save button.

**Acceptance Criteria:**

- Admin can assign permissions without developer support.
- Scanner-only and instructor roles can be limited.

### UX-035 — Admin Event Management List

**Purpose:** Manage events.

**Required UI Elements:**

- Search.
- Filters.
- Event table.
- Status badges.
- Create Event button.
- Publish/unpublish actions.
- Export attendees.

**Acceptance Criteria:**

- Admin can manage event lifecycle.
- Event status is clear.

### UX-036 — Admin Create / Edit Event

**Purpose:** Configure events.

**Required UI Elements:**

- Title.
- Description.
- Banner image.
- Category.
- Date/time.
- Location.
- Capacity.
- Price.
- Registration deadline.
- Approval rule.
- Publish button.

**Acceptance Criteria:**

- Admin can create free and paid events.
- Required fields validate.
- Publish readiness is clear.

### UX-037 — Admin Event Details

**Purpose:** Monitor one event.

**Required UI Elements:**

- Event summary.
- Metrics.
- Registrations tab.
- Payments tab.
- Attendance tab.
- QR tickets tab.
- Activity timeline.
- Open Scanner button.

**Acceptance Criteria:**

- Admin can manage event operations from one page.

### UX-038 — Admin Event Categories

**Purpose:** Manage event categories.

**Required UI Elements:**

- Category list.
- Create/edit drawer.
- Status toggle.
- Event count.

**Acceptance Criteria:**

- Categories cannot be deleted if actively used unless archived.

### UX-039 — Admin Registration Management

**Purpose:** Review registrations.

**Required UI Elements:**

- Filters.
- Registration table.
- Status badges.
- Approve/reject actions.
- Bulk actions.
- Export.

**Acceptance Criteria:**

- Admin can process pending registrations efficiently.
- Rejection supports reason.

### UX-040 — Admin Registration Details / Approval

**Purpose:** Review one registration.

**Required UI Elements:**

- User info.
- Event info.
- Payment status.
- QR status.
- Approval readiness checklist.
- Approve / Reject buttons.
- Rejection reason.

**Acceptance Criteria:**

- QR is only generated after approval/payment rules.
- Decisions are audit logged.

### UX-041 — Admin Payment Management

**Purpose:** Track payments.

**Required UI Elements:**

- Revenue KPIs.
- Payment table.
- Status filters.
- Payment provider.
- Manual verify action.
- Refund status action.
- Export.

**Acceptance Criteria:**

- Payment status is clear.
- Sensitive changes require permission and audit log.

### UX-042 — Admin QR Scanner

**Purpose:** Scan event QR tickets.

**Required UI Elements:**

- Camera preview.
- Event selector.
- Scan guide.
- Manual ticket input.
- Scan result card.
- Check-in button.
- Clear success/error feedback.

**Acceptance Criteria:**

- Valid QR checks in attendee.
- Duplicate/wrong-event/expired/unpaid QR errors are clear.
- Scanner-only role can access scanner without full admin.

### UX-043 — Admin Attendance Logs

**Purpose:** View check-in history.

**Required UI Elements:**

- Summary cards.
- Filters.
- Attendance table.
- Scan result badges.
- Export.

**Acceptance Criteria:**

- Admin can export attendance.
- Scanner identity and scan time are visible.

### UX-044 — Admin Announcements Management

**Purpose:** Manage announcements.

**Required UI Elements:**

- Announcement list.
- Status badges.
- Audience.
- Publish/archive actions.
- Create button.

**Acceptance Criteria:**

- Admin can manage announcements independently.

### UX-045 — Admin Create / Edit Announcement

**Purpose:** Write announcements.

**Required UI Elements:**

- Title.
- Category.
- Image.
- Body editor.
- Audience targeting.
- Notification channel selection.
- Save draft / publish.

**Acceptance Criteria:**

- Required content validates.
- Publish sends notifications if selected.

### UX-046 — Admin Course Management List

**Purpose:** Manage courses.

**Required UI Elements:**

- Course table.
- Filters.
- Instructor.
- Price.
- Enrollment count.
- Status.
- Create Course button.

**Acceptance Criteria:**

- Admin/instructor can manage permitted courses.

### UX-047 — Admin Create / Edit Course

**Purpose:** Configure course details.

**Required UI Elements:**

- Course title.
- Description.
- Category.
- Thumbnail.
- Instructor.
- Free/paid toggle.
- Price.
- Access rules.
- Publish button.

**Acceptance Criteria:**

- Course can be saved as draft or published.
- Paid/free status is clear.

### UX-048 — Admin Course Details

**Purpose:** Monitor course performance.

**Required UI Elements:**

- Course header.
- Enrollment metrics.
- Revenue.
- Completion.
- Lessons tab.
- Enrollments tab.
- Payments tab.
- Activity timeline.

**Acceptance Criteria:**

- Admin can access lessons and enrollments from this page.

### UX-049 — Admin Lesson / Video Management

**Purpose:** Manage course lessons and videos.

**Required UI Elements:**

- Lesson list.
- Add lesson.
- Lesson editor.
- Video upload/link.
- Sort order.
- Free preview toggle.
- Security notice.
- Publish status.

**Acceptance Criteria:**

- Videos are not presented as public links.
- Lesson ordering is manageable.
- Upload/processing states are clear.

### UX-050 — Admin Content Management

**Purpose:** Manage legal/support content.

**Required UI Elements:**

- Content pages list.
- Editor.
- Preview.
- Publish controls.

**Acceptance Criteria:**

- Admin can update terms, privacy, refund, FAQ, and support content.

### UX-051 — Admin Reports Dashboard

**Purpose:** Show analytics.

**Required UI Elements:**

- Date filters.
- KPI cards.
- Charts.
- Top events.
- Top courses.
- Attendance rate.
- Revenue.

**Acceptance Criteria:**

- Metrics are readable and exportable.
- Charts have text summaries.

### UX-052 — Admin Export Center

**Purpose:** Generate reports.

**Required UI Elements:**

- Report type selector.
- Filters.
- Format selector CSV/Excel.
- Generate button.
- Recent exports table.

**Acceptance Criteria:**

- Admin can generate exports.
- Export status is visible.

### UX-053 — Admin Audit Logs

**Purpose:** Review admin actions.

**Required UI Elements:**

- Filters.
- Audit table.
- Actor.
- Action.
- Entity.
- Timestamp.
- IP/device if available.
- Details drawer.

**Acceptance Criteria:**

- Sensitive actions are traceable.
- Logs are read-only.

---

## 10.4 Utility Screens

### UX-054 — 404 Not Found

**Purpose:** Handle missing routes.

**Required UI Elements:**

- 404 title.
- Message.
- Go to Dashboard button.
- Go Back button.

### UX-055 — 403 Access Denied

**Purpose:** Handle permission issues.

**Required UI Elements:**

- Lock icon.
- Access denied message.
- Go to Dashboard.
- Contact support.

### UX-056 — 500 Server Error

**Purpose:** Handle server failures.

**Required UI Elements:**

- Error icon.
- Try Again button.
- Go to Dashboard.
- Error reference if available.

### UX-057 — Offline / No Connection

**Purpose:** Handle internet loss.

**Required UI Elements:**

- Offline icon.
- Retry button.
- Explanation that courses, payments, QR validation, and updates require connection.

### UX-058 — Empty State Template

**Purpose:** Reusable empty state for empty lists.

**Required UI Elements:**

- Icon.
- Headline.
- Short explanation.
- Contextual CTA.
- Optional Clear Filters action.

---

## 11. Components

### Buttons

| Type | Usage | Style |
|---|---|---|
| Primary | Main CTA | `#2563EB` background, `#F8FAFC` text |
| Secondary | Supporting action | Transparent, `#C7CBD1` border/text |
| Ghost | Low-priority action | Transparent, text only |
| Danger | Delete/reject/destructive | `#EF4444` text or border |
| Success | Confirmed state only | `#22C55E`, use sparingly |

### Inputs

- Background: `#1A202A`.
- Border: `#2A303A`.
- Focus border: `#D9DEE7`.
- Error border: `#EF4444`.
- Placeholder: `#6B7280`.
- Labels above fields.
- Helper text below fields.

### Cards

- Background: `#10141B`.
- Border: `#2A303A`.
- Radius: 12px.
- Padding: 16px mobile, 20px–24px desktop.
- Hover: slight `#1A202A` elevation.
- Avoid heavy shadows.

### Badges

| Status | Color |
|---|---|
| Approved / Confirmed / Paid | `#22C55E` |
| Pending / Payment Pending | `#F59E0B` |
| Rejected / Failed / Invalid | `#EF4444` |
| Premium / Certificate / QR Issued | `#D9DEE7` |
| Draft / Disabled | `#6B7280` |
| Active navigation / Selected | `#2563EB` |

### Tables

- Use sticky header where useful.
- Row hover: `#1A202A`.
- Dividers: `#2A303A`.
- Status badges must include text.
- Action menu uses three-dot icon.
- Bulk actions appear only after selection.
- Pagination at bottom.

### Modals

- Backdrop: black overlay.
- Surface: `#1A202A`.
- Border: `#2A303A`.
- Radius: 16px.
- Primary action right side.
- Cancel left side.
- Destructive modals require strong warning.

### Toasts

- Bottom-right desktop.
- Top or bottom mobile depending on screen.
- Success, error, warning variants.
- Auto-dismiss non-critical toasts.
- Critical errors remain until closed.

---

## 12. Status and Feedback Rules

### Registration Status

| Status | UI Treatment |
|---|---|
| Pending Approval | Amber badge, explanation text |
| Approved | Green badge |
| Rejected | Red badge, rejection reason if available |
| Cancelled | Muted badge |
| Waiting List | Amber badge with position if available |

### Payment Status

| Status | UI Treatment |
|---|---|
| Not Required | Silver badge |
| Pending | Amber badge |
| Successful | Green badge |
| Failed | Red badge |
| Refunded | Muted badge |
| Manual Verified | Silver/premium badge |

### QR Status

| Status | UI Treatment |
|---|---|
| Not Issued | Muted text |
| Issued | Silver badge |
| Active | Green badge |
| Used | Muted/green completed state |
| Expired | Amber or red depending context |
| Revoked | Red badge |

### Course Status

| Status | UI Treatment |
|---|---|
| Not Enrolled | CTA visible |
| Enrolled | Start/Continue Learning |
| Payment Pending | Amber badge |
| Access Revoked | Red badge |
| Completed | Green badge |

---

## 13. Form UX Rules

- Validate required fields inline.
- Do not clear user input after validation errors.
- Show one clear error per field.
- Use helper text for complex fields.
- Use disabled states only when action is truly unavailable.
- Use loading states on every async submit.
- Save buttons must be disabled during submission.
- Long forms must be divided into sections.
- Unsaved changes warning required for admin create/edit screens.
- Required fields must be marked consistently.
- Form success must show toast or success screen.

---

## 14. Empty, Loading, Error, and Success States

### Loading

- Use skeleton loaders matching final layout.
- Avoid full-page spinners unless the whole page is blocked.
- Buttons show inline spinner and disabled state.

### Empty

Every empty state must include:

- Icon.
- Clear title.
- Short explanation.
- Primary next action.
- Optional secondary action.

Examples:

- “No courses found.”
- “No upcoming events.”
- “No registrations pending.”
- “No payments match this filter.”

### Error

Every error state must include:

- Human-readable explanation.
- Retry action when possible.
- Support link when issue blocks user progress.
- No technical stack traces.

### Success

Success feedback must include:

- Clear confirmation.
- What changed.
- Next recommended action.

---

## 15. Responsive Requirements

### Mobile

- Mobile-first layout for user app screens.
- Bottom tab navigation for main user areas.
- Sticky bottom CTA for payment, event registration, and course purchase.
- Cards stack vertically.
- Tables become cards.
- Forms become single-column.
- Touch targets minimum 44px height.
- QR code must be large enough for scanning.

### Tablet

- Use two-column layouts where useful.
- Sidebar may collapse.
- Cards can appear in two-column grids.
- Admin tables may use horizontal scroll if needed.

### Desktop

- Admin uses left sidebar.
- User dashboard can use sidebar or wider grid.
- Data-heavy screens use tables.
- Detail screens may use sticky side panels.
- Forms can use two columns.

---

## 16. Accessibility Requirements

- Target WCAG 2.1 AA.
- Maintain high text contrast on dark backgrounds.
- All form fields must have visible labels.
- Error messages must be linked to inputs.
- Icon-only buttons need accessible labels.
- Status cannot rely on color only.
- Keyboard navigation must work for forms, modals, dropdowns, tabs, and tables.
- Focus states must be visible.
- Modals must trap focus.
- Tables must use semantic headers.
- Video player must support captions where available.
- QR code must include text fallback ticket code.
- Charts must include text summaries.

---

## 17. Security and Privacy UX

### Authentication

- Password fields include show/hide toggle.
- Password strength indicator shown in sign-up and reset.
- Email verification status shown clearly.
- Session expired screen protects user data.

### Admin Permissions

- Restricted actions are hidden or disabled with explanation.
- Access denied screen used for unauthorized pages.
- Sensitive actions require confirmation.

### Payments

- Checkout must show secure payment message.
- Payment status must be clear.
- Failed payment must not imply access is granted.
- Manual payment status must show pending instructions.

### Video Protection

- Do not show download controls.
- Do not expose direct public video URLs.
- Show protected playback UI.
- Mobile V2 should block screenshots and screen recording where supported.
- Web V1 should reduce unauthorized download/share but cannot guarantee full screen-recording prevention.

### QR Tickets

- QR screen must avoid unnecessary sharing/download actions if security policy requires.
- Expired/revoked/used states must be obvious.
- Scanner result must never be ambiguous.

---

## 18. Content and Microcopy Guidelines

### Tone

- Professional.
- Clear.
- Direct.
- Medical academy appropriate.
- Avoid casual slang.
- Avoid exaggerated marketing language.

### Examples

| Context | Recommended Copy |
|---|---|
| Registration submitted | “Your registration has been submitted for review.” |
| Registration approved | “Your registration is approved. Your QR ticket is ready.” |
| Payment pending | “Payment is pending. Access will be enabled after confirmation.” |
| QR duplicate scan | “This ticket has already been checked in.” |
| Wrong event QR | “This ticket is not valid for the selected event.” |
| Course locked | “Enroll or complete payment to access this lesson.” |
| No events | “No upcoming events are available right now.” |
| Empty courses | “No courses match your filters.” |

### Arabic and English Readiness

V1 may be dark-mode English-first, but UI structure must support future Arabic:

- Avoid hardcoded layout assumptions that break in RTL.
- Keep icons compatible with RTL where needed.
- Text containers must handle longer Arabic labels.
- Admin content pages should support future bilingual content fields.

---

## 19. Admin UX Requirements

### Admin Dashboard Principles

- Admin must always know what status an item is in.
- Admin must be able to complete daily operations without developer help.
- Every admin list needs search, filter, status, and action controls.
- Destructive actions must be protected.
- Sensitive actions must be audit logged.
- Scanner-only role must not see unrelated admin features.

### Admin Tables

Every admin table should include:

- Search.
- Filters.
- Sort where relevant.
- Pagination.
- Status badges.
- Action menu.
- Empty state.
- Loading skeleton.
- Export action where applicable.
- Bulk actions where useful and safe.

### Admin Forms

Every create/edit admin form should include:

- Sectioned layout.
- Required field markers.
- Save draft where relevant.
- Publish action where relevant.
- Preview action where relevant.
- Unsaved changes warning.
- Validation errors.
- Success toast.

---

## 20. Visual Reference Direction from Attached Screens

The attached visual screens show useful structure:

- Mobile-first dark app.
- Course catalog cards.
- Event detail pages with sticky reservation CTA.
- Checkout screen with payment methods.
- Profile sections grouped into cards.
- Announcement cards.
- Bottom navigation.
- Login and welcome screens.

However, the final AMG UI must adjust the palette to better match AMG identity:

- Replace heavy generic digital blue/navy dominance with black, white, and silver.
- Keep blue only for action emphasis.
- Increase premium medical/corporate feeling.
- Reduce decorative blue glow unless subtle.
- Keep the strong mobile-first structure and content hierarchy.

---

## 21. Do / Don’t Guidelines

### Do

- Use black/silver/white as the AMG identity.
- Use blue only for important actions.
- Keep layouts structured and premium.
- Use strong hierarchy.
- Use clear status badges.
- Use skeleton loading states.
- Make admin workflows efficient.
- Design mobile screens first for user experience.
- Design admin screens desktop-first.

### Don’t

- Do not make the UI look like a generic AI/tech app.
- Do not overuse cobalt/blue on every surface.
- Do not use playful colors.
- Do not use weak contrast.
- Do not hide payment/approval/QR statuses.
- Do not allow scanner results to be visually unclear.
- Do not expose direct video download links.
- Do not rely only on color to communicate status.

---

## 22. UI Acceptance Criteria

### Global Acceptance Criteria

- [ ] All screens use the AMG black/white/silver identity.
- [ ] Primary action color `#2563EB` is used consistently and sparingly.
- [ ] All cards use dark surfaces with subtle borders.
- [ ] Typography follows Hanken Grotesk for headings and Inter for body.
- [ ] All screens include loading, empty, error, and success states where applicable.
- [ ] All forms include validation states.
- [ ] All admin tables include search/filter/status/action structure.
- [ ] Mobile user flows are usable with one hand where possible.
- [ ] Admin dashboard is efficient on desktop.
- [ ] Accessibility requirements are met.
- [ ] User can distinguish free vs paid content.
- [ ] User can distinguish pending vs approved vs rejected registrations.
- [ ] QR ticket and scanner screens are clear and reliable.
- [ ] Payment flow is trustworthy and understandable.
- [ ] Course video screens do not expose direct download behavior.
- [ ] UI is ready for future Arabic/English localization.

### P0 Screen Acceptance Criteria

- [ ] Login, register, reset password, and email verification are complete.
- [ ] User dashboard shows events, courses, announcements, and shortcuts.
- [ ] Course catalog, course details, and course player are complete.
- [ ] Event listing, event details, registration, checkout, reservations, and QR ticket are complete.
- [ ] Admin dashboard, user management, roles, events, registrations, payments, scanner, attendance, courses, and video management are complete.
- [ ] Error and access denied states are complete.

---

## 23. Implementation Notes for Developers

### Recommended Frontend Structure

Suggested route groups:

```txt
/app
  /(public)
    /welcome
    /login
    /register
    /forgot-password
    /reset-password
    /verify-email
  /(user)
    /dashboard
    /courses
    /courses/[id]
    /courses/[id]/learn
    /events
    /events/[id]
    /events/[id]/register
    /checkout
    /reservations
    /reservations/[id]/qr
    /announcements
    /notifications
    /profile
    /settings
    /support
  /(admin)
    /admin
    /admin/users
    /admin/roles
    /admin/events
    /admin/registrations
    /admin/payments
    /admin/scanner
    /admin/attendance
    /admin/courses
    /admin/content
    /admin/reports
    /admin/exports
    /admin/audit-logs
```

### Suggested Component Groups

```txt
/components
  /layout
  /navigation
  /cards
  /forms
  /tables
  /modals
  /badges
  /toasts
  /status
  /qr
  /video
  /charts
  /admin
```

### Reusable UI Components

- AppShell
- AdminShell
- BottomTabBar
- SidebarNav
- TopHeader
- StatusBadge
- MetricCard
- CourseCard
- EventCard
- AnnouncementCard
- DataTable
- FilterBar
- SearchInput
- FormField
- ConfirmModal
- EmptyState
- ErrorState
- LoadingSkeleton
- QRCodeCard
- ScannerResultCard
- PaymentMethodCard
- VideoPlayerShell

---

## 24. Risks and UX Constraints

| Risk | Impact | UX Mitigation |
|---|---|---|
| 4-week timeline | Some screens may be rushed | Prioritize P0 screens and reusable components |
| Large admin scope | Admin may feel complex | Use consistent tables/forms and clear modules |
| Payment gateway uncertainty | Checkout may change | Keep payment method UI modular |
| Video protection limitations | Users may expect impossible protection | Communicate protected access and avoid direct downloads |
| Web screen recording cannot be fully blocked | Content leakage risk | Add future DRM/mobile protection notes |
| Arabic support later | Layout may need RTL changes | Use flexible layout and localization-ready components |
| Dark UI readability | Eye strain if contrast is weak | Maintain WCAG contrast and readable typography |
| Scanner environment | Event check-in can be stressful | Use large feedback states and minimal scanner UI |

---

## 25. Open UX Questions

1. Should V1 user interface be English-only, or should Arabic labels be included from the start?
2. Should AMG Academy use the AMG / Allam Medical Group logo directly, or a separate AMG Academy logo?
3. Should course cards focus more on dental product learning, clinical education, or digital transformation?
4. Should event cards show speakers on listing cards, or only on detail pages?
5. Should QR tickets be downloadable as image/PDF, or only visible inside the dashboard for security?
6. Should payment support start with manual/offline payment UI before gateway integration?
7. Should certificate UI be visible as “coming soon” or hidden until implemented?
8. Should the user mobile web bottom navigation include Reservations as its own tab or inside Events?
9. Should admin scanner work as a standalone role-only interface separate from the full admin dashboard?
10. Should profile include dental license number, clinic name, or specialty as required fields?

---

## 26. Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| v1.0 | 2026-05-25 | Ahmed Developer | Initial UI/UX PRD created for AMG Academy Platform v1.0 |
