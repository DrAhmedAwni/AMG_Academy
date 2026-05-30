# Admin Manual

## Admin Access

Admins sign in through the standard login page, then navigate to `/admin`. Access is controlled by role permissions from the backend.

## Core Admin Areas

### Dashboard

Use the dashboard to monitor high-level platform activity, recent registrations, and operational alerts.

### Users

- Search by name or email
- Review user role and status
- Disable users only after resolving active registrations or enrollments

### Roles and Permissions

- Create roles for operational teams
- Assign only the permissions each team actually needs
- Re-test access after permission edits

### Events

- Draft new events
- Publish only after verifying dates, location, pricing, and capacity
- Monitor registration counts before approving late requests manually

### QR Scanner

- Open the scanner screen on a trusted device
- Grant camera permission when prompted
- Scan attendee QR codes at check-in
- If a scan fails, verify the registration status in the admin registrations view

### Courses

- Create course metadata first
- Add lessons and upload videos
- Publish only after lesson ordering and preview checks are complete

### Announcements

- Draft announcements before publishing
- Keep titles concise so they fit cleanly across dashboard and user notifications

### Audit Logs

Review audit logs when investigating admin actions, permission changes, or operational mistakes.

## Operational Habits

1. Use dedicated admin accounts rather than shared credentials
2. Keep permissions narrow
3. Avoid deleting or disabling records until downstream impact is checked
4. Confirm production changes in the audit log after major operations

## Troubleshooting

| Issue | What to check |
| --- | --- |
| Admin page loads but data is empty | Confirm the account has the matching `read` permission |
| QR scan is rejected | Verify the ticket is active and the registration is approved |
| User cannot be disabled | Resolve active registrations or enrollments first |
| Announcement is missing for users | Confirm the announcement status is `published` |
