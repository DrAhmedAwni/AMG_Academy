# AMG Dark UI Consistency Review

Date: 2026-05-30

## Scope

Reviewed mobile route and component code for auth, tabs, events, payments, tickets,
courses, lesson player, notifications, profile, settings, and scanner.

Screenshots were not captured in this environment because no Android/iOS simulator
or Expo runtime was launched.

## Findings

- Dark-first background and surface tokens are centralized in `src/theme/colors.ts`.
- Primary accent remains cyan/teal (`#54D9E8`) across buttons, badges, links, QR/scanner states, and highlights.
- Shared `Screen`, `Header`, `GlassCard`, `Button`, `Badge`, `StatusBadge`, and state components are reused across major screens.
- Events, courses, tickets, notifications, payments, and scanner screens use glass/elevated cards rather than one-off bright surfaces.
- Statuses use text badges for registration, payment, QR ticket, attendance, course, enrollment, and scanner states.
- Scanner result cards use success/error borders and status text while preserving the dark premium visual direction.
- Lesson player no longer exposes the stream URL in visible text; it shows a restrained authorized-playback placeholder.

## Follow-Up Before Store Release

- Capture Android screenshots for auth, home, events, payment, QR wallet, course detail, lesson player, notifications, profile, settings, and scanner.
- Capture iOS screenshots where available.
- Replace SVG placeholder assets with final app icon, splash, adaptive icon, and notification icon images.
