# AMG Academy Mobile App

React Native / Expo mobile app for AMG Academy Mobile App V2.

The mobile app lives inside the existing AMG Academy monorepo and consumes the
existing NestJS API. Payment, registration, QR ticket, course access, scanner,
notification, profile, and RBAC decisions remain backend-owned.

## Current Scope

Implemented mobile surfaces:

- Secure auth screens and protected navigation.
- Role-aware bottom tabs with scanner hidden from normal users.
- Events, reservations, paid-event payment redirect, and QR ticket wallet.
- Mock-labeled payment screen backed by `/payments/:id` records.
- Courses, enrollments, paid-course payment redirect, locked lessons, and
  protected video authorization checks.
- Notifications, announcements, profile, settings, and logout.
- Scanner event selection, camera permission, QR scanning, result states, and
  recent scans for authorized staff.

Device-only Android/iOS validation is tracked in `docs/validation/`.

## Scripts

From the repository root:

```bash
npm run dev:mobile
npm run android:mobile
npm run ios:mobile
npm run typecheck:mobile
npm run lint:mobile
npm run test:mobile
```

From this workspace:

```bash
npm run start
npm run android
npm run ios
npm run prebuild
npm run android:dev
npm run ios:dev
npm run typecheck
npm run lint
npm run test
```

## Environment

Copy `.env.example` to the environment you need:

```bash
cp apps/mobile/.env.example apps/mobile/.env.local
cp apps/mobile/.env.example apps/mobile/.env.staging
cp apps/mobile/.env.example apps/mobile/.env.production
```

Local:

```bash
EXPO_PUBLIC_APP_ENV=local
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
EXPO_PUBLIC_WEB_URL=http://localhost:3000
EXPO_PUBLIC_ENABLE_MOCK_PAYMENTS=true
EXPO_PUBLIC_ENABLE_PUSH_PREP=true
```

Android emulator local API URL:

```bash
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000/api/v1
```

Staging:

```bash
EXPO_PUBLIC_APP_ENV=staging
EXPO_PUBLIC_API_URL=https://staging.amgacademy.com/api/v1
EXPO_PUBLIC_WEB_URL=https://staging.amgacademy.com
EXPO_PUBLIC_ENABLE_MOCK_PAYMENTS=true
EXPO_PUBLIC_ENABLE_PUSH_PREP=true
```

Production:

```bash
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_API_URL=https://amgacademy.com/api/v1
EXPO_PUBLIC_WEB_URL=https://amgacademy.com
EXPO_PUBLIC_ENABLE_MOCK_PAYMENTS=false
EXPO_PUBLIC_ENABLE_PUSH_PREP=true
```

No private secrets may use `EXPO_PUBLIC_*`; those values are bundled into the
app.

## Android And iOS Development Builds

Start the existing backend first:

```bash
docker-compose up -d
npm run db:migrate
npm run dev:api
```

Run an Android target:

```bash
npm run android:mobile
```

Run an iOS target where Xcode is available:

```bash
npm run ios:mobile
```

Create native development projects when a dev client is required:

```bash
npm run prebuild -w @amg/mobile
npm run android:dev -w @amg/mobile
npm run ios:dev -w @amg/mobile
```

## Build Readiness

- App metadata and identifiers live in `app.json`.
- EAS development, staging, preview, and production profiles live in `eas.json`.
- Placeholder SVG assets in `assets/` are for development. Replace them with
  final PNG app-store-ready assets before release.
- Camera permission copy supports scanner mode.
- Notification permission copy is prepared for push notification rollout.
- Production EAS env disables mock payments.

## Validation Records

Validation notes are kept under `docs/validation/`:

- `auth.md`
- `events-payments-tickets.md`
- `courses-lessons.md`
- `profile-notifications.md`
- `scanner.md`
- `final-qa.md`
- `ui-review.md`
- `accessibility.md`
- `performance.md`

Release readiness is tracked in `docs/release-checklist.md`.
