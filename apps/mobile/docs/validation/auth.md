# Auth and Protected Navigation Validation

**Feature**: AMG Academy Mobile App V2 - US1  
**Date**: 2026-05-30  
**Environment**: Local development workspace

## Automated Checks

| Check | Result | Notes |
|---|---|---|
| Mobile auth helper tests | PASS | `npm run test -w @amg/mobile -- --runInBand` passed 11 tests on 2026-05-30 |
| Mobile TypeScript | PASS | `npm run typecheck -w @amg/mobile` passed on 2026-05-30 |
| Mobile lint | PASS | `npm run lint -w @amg/mobile` passed on 2026-05-30 |
| Backend TypeScript | PASS | `npm run typecheck -w @amg/api` passed on 2026-05-30 |
| Shared TypeScript | PASS | `npm run typecheck -w @amg/shared` passed on 2026-05-30 |

## Manual Device Checklist

Record device, API URL, test account role, and result before release.

| Flow | Android result | iOS result | Notes |
|---|---|---|---|
| App opens to login when no session exists | Not run | Not run | Requires Android/iOS development build |
| Login with verified user | Not run | Not run | Backend `/auth/login` with `client: "mobile"` |
| Register form validation | Not run | Not run | Uses shared `registerSchema` |
| Register success feedback | Not run | Not run | Email verification remains backend-owned |
| Forgot password success/error feedback | Not run | Not run | Uses backend `/auth/forgot-password` |
| Protected tabs require auth | Not run | Not run | Anonymous/expired users see session state |
| Logout clears SecureStore and private query cache | Not run | Not run | Also covered by helper behavior |
| Normal user cannot see scanner/staff tab | Not run | Not run | Covered by role navigation tests |
| Scanner/admin user can see scanner/staff tab | Not run | Not run | Backend authorization still required |

## Device Validation Status

Android and iOS device validation has not been executed in this Codex
environment because no emulator or physical device session is attached. The
implementation is ready for `npm run android:mobile` and `npm run ios:mobile`
after the local backend and simulator/device are available.
