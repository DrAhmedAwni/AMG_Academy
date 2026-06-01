# Quickstart: Community Learning and Certificates

**Date**: 2026-06-01
**Feature**: Community Learning and Certificates

---

## MVP Validation: Certificates

1. Apply Prisma migration and generate client.
2. Start API and web dev servers.
3. Seed or create an event/course completion state for a test user.
4. Trigger certificate draft generation from attendance or course progress.
5. Open admin certificate queue.
6. Release the pending certificate.
7. Login as the user and confirm the certificate appears in the wallet/profile.
8. Download the PDF.
9. Open the public verification URL from the certificate QR/link.
10. Revoke or void a certificate and confirm public verification no longer shows it as valid.

## Commands

```powershell
npm run prisma:migrate -w @amg/api
npm run prisma:generate -w @amg/api
npm run typecheck --workspaces --if-present
npm run lint --workspaces --if-present
npm run test --workspaces --if-present
npm run build --workspaces --if-present
```

## Web Routes

- Admin certificate queue: `/admin/certificates`
- Public verification: `/certificates/verify/[verificationCode]`

## Mobile Routes

- Certificate wallet/profile section: mobile profile or certificates screen

## Release Checks

- Certificate queue supports loading, empty, error, and permission denied states.
- Public verification supports valid, invalid, revoked/voided, and missing states.
- Mobile wallet supports loading, empty, error, and session-expired states.
- Generated PDFs do not expose private storage links.
- QR verification does not expose email, phone, payment data, admin notes, or private profile fields.
