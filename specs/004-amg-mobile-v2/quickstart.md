# Quick Start: AMG Academy Mobile App V2

**Date**: 2026-05-29
**Feature**: AMG Academy Mobile App V2
**Plan**: [plan.md](plan.md)

---

## Prerequisites

- Node.js 20+
- npm 10+
- Existing AMG Academy backend dependencies installed
- Android Studio and Android emulator or physical Android device
- Xcode and iOS Simulator for iOS development where available
- Expo development tooling through the mobile workspace

---

## 1. Install Dependencies

```bash
npm install
```

After `apps/mobile` is created:

```bash
npm install -w @amg/mobile
```

---

## 2. Configure Mobile Environment

Create mobile environment files:

```bash
cp apps/mobile/.env.example apps/mobile/.env.local
cp apps/mobile/.env.example apps/mobile/.env.staging
cp apps/mobile/.env.example apps/mobile/.env.production
```

Local example:

```bash
EXPO_PUBLIC_APP_ENV=local
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
EXPO_PUBLIC_WEB_URL=http://localhost:3000
EXPO_PUBLIC_ENABLE_MOCK_PAYMENTS=true
EXPO_PUBLIC_ENABLE_PUSH_PREP=true
```

Android emulator local API URL may need host mapping:

```bash
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000/api/v1
```

Staging example:

```bash
EXPO_PUBLIC_APP_ENV=staging
EXPO_PUBLIC_API_URL=https://staging.amgacademy.com/api/v1
EXPO_PUBLIC_WEB_URL=https://staging.amgacademy.com
EXPO_PUBLIC_ENABLE_MOCK_PAYMENTS=true
EXPO_PUBLIC_ENABLE_PUSH_PREP=true
```

Production example:

```bash
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_API_URL=https://amgacademy.com/api/v1
EXPO_PUBLIC_WEB_URL=https://amgacademy.com
EXPO_PUBLIC_ENABLE_MOCK_PAYMENTS=false
EXPO_PUBLIC_ENABLE_PUSH_PREP=true
```

Do not put secrets in `EXPO_PUBLIC_*` values.

---

## 3. Start Existing Backend Stack

```bash
docker-compose up -d
npm run db:migrate
npm run dev:api
```

Optional web app for comparison:

```bash
npm run dev:web
```

Expected local services:

- Backend API: `http://localhost:4000/api/v1`
- Web app: `http://localhost:3000`

---

## 4. Start Mobile App

Run the Expo mobile workspace:

```bash
npm run start -w @amg/mobile
npm run android -w @amg/mobile
npm run ios -w @amg/mobile
```

For a development build:

```bash
npm run prebuild -w @amg/mobile
npm run android:dev -w @amg/mobile
npm run ios:dev -w @amg/mobile
```

Equivalent root aliases:

```bash
npm run dev:mobile
npm run android:mobile
npm run ios:mobile
```

---

## 5. Required Mobile Workspace Scripts

`apps/mobile/package.json` should provide:

| Command | Purpose |
|---|---|
| `npm run start -w @amg/mobile` | Start Expo dev server |
| `npm run android -w @amg/mobile` | Run Android development target |
| `npm run ios -w @amg/mobile` | Run iOS development target |
| `npm run typecheck -w @amg/mobile` | TypeScript validation |
| `npm run lint -w @amg/mobile` | Lint mobile code |
| `npm run test -w @amg/mobile` | Run configured mobile tests |

Root aliases are also available:

| Command | Purpose |
|---|---|
| `npm run typecheck:mobile` | TypeScript validation |
| `npm run lint:mobile` | Lint mobile code |
| `npm run test:mobile` | Run configured mobile tests |

---

## 6. Critical Validation Flow

Run before marking the mobile plan implementation complete:

1. App opens on Android development build.
2. iOS development build is prepared and run where available.
3. Login works with a verified test user.
4. Register shows validation and success states.
5. Logout clears SecureStore and private query cache.
6. Protected screens require login.
7. Role-aware navigation hides scanner/admin screens for normal users.
8. Events load with loading, empty, error, and success states.
9. Free event registration updates backend registration state.
10. Paid event redirects to payment screen.
11. Mock payment success/failure/cancel updates backend payment state.
12. QR wallet shows active tickets only when backend allows.
13. Pending/unpaid/unapproved tickets remain inactive.
14. Courses load with loading, empty, error, and success states.
15. Free course enrollment unlocks backend-authorized lessons.
16. Paid course redirects to payment screen.
17. Locked lessons stay blocked until backend access allows playback.
18. Lesson player does not expose durable public video URLs.
19. Notifications load and read/unread state updates.
20. Profile loads and editable fields update with feedback.
21. Scanner mode is hidden for normal users.
22. Scanner mode works for scanner/admin users.
23. Scanner shows success, duplicate, wrong-event, unpaid, unapproved, expired, revoked, and invalid/not-found states.
24. Dark AMG design tokens are consistent.
25. No critical console/runtime errors appear.

---

## 7. App Store Readiness Checklist

- App name placeholder configured.
- Bundle/package identifiers planned.
- App icon placeholder added.
- Splash placeholder added.
- Camera permission copy added for scanner mode.
- Notification permission copy prepared.
- Local/staging/production API URL strategy documented.
- Android development build command documented.
- iOS development build command documented.
- Mock payment labeling verified.
- No production secrets included in mobile bundle.

---

## 8. Final QA Commands

Run before a mobile release candidate:

```bash
npm run typecheck -w @amg/mobile
npm run lint -w @amg/mobile
npm run test -w @amg/mobile -- --runInBand
npm run typecheck -w @amg/api
npm run test -w @amg/api -- --runInBand
npm run typecheck -w @amg/shared
```

Optional web compatibility check for existing payment and QR pages:

```bash
npm run typecheck -w @amg/web
```

Record results in `apps/mobile/docs/validation/final-qa.md`.
