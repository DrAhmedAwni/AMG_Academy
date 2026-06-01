# Mobile Performance Review

Date: 2026-05-30

## Scope

Reviewed navigation, list rendering, server-state caching, image handling,
QR wallet rendering, lesson authorization, notifications, and scanner timing
paths from code.

## Results

- TanStack Query provides caching, refetch, retry, and private cache clearing across feature modules.
- Events, courses, reservations, tickets, notifications, scanner events, and recent scans use paginated backend queries.
- Long mobile lists use `FlatList` rather than rendering large arrays inside scroll views.
- Images use stable fixed heights in cards/detail heroes to avoid layout jumps.
- QR codes render only for displayable active backend tickets, avoiding unnecessary QR generation for locked states.
- Scanner flow is camera-first and locks duplicate submissions while a scan mutation is pending.
- Scanner validation calls `/qr/scan` exactly once per captured payload and routes to a lightweight result screen.
- Lesson player performs a backend authorization request before showing ready playback state.
- No new heavy libraries were added during Phase 8.

## Device Review Still Needed

- Measure QR scan to backend result timing on local/staging Android.
- Measure QR scan to backend result timing on iOS where available.
- Scroll performance check for 100+ events/courses/notifications/tickets.
- Image loading behavior on mid-range Android network conditions.
