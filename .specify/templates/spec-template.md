# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`

**Created**: [DATE]

**Status**: Draft

**Input**: User description: "$ARGUMENTS"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently - e.g., "Can be fully tested by [specific action] and delivers [specific value]"]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- What happens when [boundary condition]?
- How does system handle [error scenario]?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST [specific capability, e.g., "allow users to create accounts"]
- **FR-002**: System MUST [specific capability, e.g., "validate email addresses"]
- **FR-003**: Users MUST be able to [key interaction, e.g., "reset their password"]
- **FR-004**: System MUST [data requirement, e.g., "persist user preferences"]
- **FR-005**: System MUST [behavior, e.g., "log all security events"]

*Example of marking unclear requirements:*

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### Key Entities *(include if feature involves data)*

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## UI/UX & Accessibility Requirements *(mandatory for user-facing/frontend features)*

<!--
  ACTION REQUIRED: Complete this section when the feature affects screens,
  layouts, forms, tables, navigation, or visual states. Use N/A only for purely
  backend/internal work and explain why.
-->

- **Design System Compliance**: [AMG tokens, dark-first surfaces, cyan/teal primary actions, typography, shared components, status variants]
- **Target Screens**: [Routes/screens affected, including admin, user, auth, scanner, or utility surfaces]
- **Responsive Targets**: [Desktop, tablet if distinct, mobile; include navigation behavior and table/card adaptation]
- **State Coverage**: [Loading, empty, error, success, permission denied, session expired, no data, and validation states]
- **Accessibility**: [Keyboard paths, focus states, form labels, icon labels, modal behavior, status text, table semantics]
- **Backend Scope Guardrail**: [Confirm existing backend APIs/business rules are preserved, or document justified backend changes]
- **Visual QA Evidence**: [Browser/Playwright routes, viewports, console checks, screenshots, or other verification expected]

## Mobile/API State Requirements *(mandatory for apps/mobile features)*

<!--
  ACTION REQUIRED: Complete this section when the feature affects the mobile app.
  Use N/A only when the feature cannot affect mobile behavior and explain why.
-->

- **Mobile Screens/Modules**: [apps/mobile Expo routes/navigation, feature modules, shared components affected]
- **Backend Endpoints Used**: [Existing `/api/v1` endpoints or justified new API work]
- **Shared Contracts**: [packages/shared schemas/types/enums or API contract sections reused]
- **Auth & Secure Storage**: [Token storage, protected routes, session expiry, logout behavior]
- **Role-Aware Navigation**: [User/admin/scanner/instructor visibility and backend authorization expectations]
- **Payment State Source**: [Backend payment records, redirect return/reconciliation, mock-payment labeling if any]
- **QR/Scanner State Source**: [Backend ticket validity and scanner result states: success, duplicate, wrong event, unpaid, unapproved, expired, revoked, not found]
- **Course Access Source**: [Backend lesson/video authorization, locked lessons, protected video URL handling]
- **Performance Plan**: [Efficient lists, optimized images, caching/loading states, mid-range Android/iOS expectations]
- **App Store/Environment Impact**: [Local/staging/production API URLs, metadata, icons, splash, camera permissions, Android/iOS quickstart updates]
- **Validation Evidence**: [Automated tests or manual validation devices/accounts/environments for critical flows]

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]
- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]
- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]

## Assumptions

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right assumptions based on reasonable defaults
  chosen when the feature description did not specify certain details.
-->

- [Assumption about target users, e.g., "Users have stable internet connectivity"]
- [Assumption about scope boundaries, e.g., "This feature affects only the web app" or "This feature adds/changes apps/mobile behavior"]
- [Assumption about data/environment, e.g., "Existing authentication system will be reused"]
- [Dependency on existing system/service, e.g., "Requires access to the existing user profile API"]
