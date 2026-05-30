# Research: AMG Academy Platform V1

**Date**: 2026-05-27
**Feature**: AMG Academy Platform V1
**Spec**: [spec.md](spec.md)

---

## Decision: Prisma as the ORM

**Decision**: Use **Prisma** as the ORM for the NestJS backend with PostgreSQL.

**Rationale**:
- Prisma has superior TypeScript type generation out of the box. The Prisma Client generates fully typed queries that catch errors at compile time, which aligns with Constitution Principle 2 (Strong Type Safety).
- Prisma's migration system (`prisma migrate`) is declarative and deterministic — schema changes are tracked in `.prisma` files and migration SQL is auto-generated. This aligns with Constitution Principle 11 (Database and Data Integrity).
- Prisma Studio provides a visual database inspection tool useful for debugging during development.
- Prisma integrates cleanly with NestJS via `@prisma/client` and can be injected as a provider.
- TypeORM requires more boilerplate for relations, migrations are less predictable, and type safety is weaker (relies on decorators that don't always catch type mismatches).

**Alternatives considered**:
- TypeORM: More mature in the NestJS ecosystem, but migration tooling is less reliable and type inference is weaker.
- Drizzle: Modern and lightweight, but ecosystem is younger and migration tooling is less mature than Prisma for complex schemas.

---

## Decision: Resend for Email Delivery

**Decision**: Use **Resend** as the primary transactional email service. Fallback to SMTP if Resend is unavailable in the target region.

**Rationale**:
- Resend has a simple, modern API with excellent deliverability for transactional emails.
- Easy integration with Node.js and supports HTML email templates.
- Provides delivery status tracking and webhooks.
- Supports custom domains for branded emails (e.g., noreply@amgacademy.com).
- If Resend is not available for Egypt-based sending, SMTP (Hostinger or SendGrid) is the fallback.

**Alternatives considered**:
- SendGrid: More mature, but API is heavier and pricing is less favorable at small scale.
- Mailgun: Good deliverability, but UI and debugging tools are less developer-friendly.
- SMTP (Hostinger): Free with hosting, but deliverability and tracking are inferior to dedicated email services.

---

## Decision: BullMQ with Redis for Background Jobs

**Decision**: Use **BullMQ** with Redis for background job processing.

**Rationale**:
- BullMQ is the standard job queue for Node.js with excellent TypeScript support.
- Required for async exports (when they exceed 30 seconds), bulk email notifications, and payment webhook retries.
- Redis is lightweight and can run on the same VPS as the application.
- BullMQ supports job scheduling, retries, progress tracking, and dead-letter queues.

**Alternatives considered**:
- Agenda (MongoDB-backed): Would require adding MongoDB to the stack, which violates the simplicity principle.
- node-cron: No persistence or retry logic, insufficient for production job processing.
- RabbitMQ: Overkill for the current scale; adds operational complexity.

---

## Decision: Docker + Docker Compose for Local/Dev, PM2 for Production

**Decision**: Use Docker and Docker Compose for local development and staging environments. Use PM2 for production process management on the Hostinger VPS.

**Rationale**:
- Docker provides consistent environments across local development, staging, and production.
- Docker Compose makes it easy to spin up the full stack (Next.js frontend, NestJS backend, PostgreSQL, Redis, Nginx) locally.
- PM2 is battle-tested for Node.js production deployments on VPS — handles process restarting, clustering, and log rotation.
- Hostinger VPS supports both Docker and PM2; Docker for staging, PM2 for production keeps resource overhead low.

**Alternatives considered**:
- Kubernetes: Massive overkill for a single VPS deployment.
- Raw systemd services: More operational overhead than PM2.

---

## Decision: Zod for Shared Validation Schema

**Decision**: Use **Zod** for shared validation schemas between frontend and backend.

**Rationale**:
- Zod provides runtime validation with excellent TypeScript inference.
- Validation schemas can be defined in `packages/shared` and imported by both frontend (form validation) and backend (DTO validation via `zod-to-json-schema` or NestJS pipes).
- Aligns with Constitution Principle 2 (Strong Type Safety) by ensuring API contracts are validated at runtime.

**Alternatives considered**:
- Yup: Popular but less TypeScript-native; type inference is weaker.
- Joi: Mature but requires separate type definitions; doesn't infer TypeScript types.
- class-validator (NestJS default): Good for backend but not shareable with frontend.

---

## Decision: react-query (TanStack Query) for Server State Management

**Decision**: Use **TanStack Query (react-query)** for server state management on the frontend.

**Rationale**:
- Handles caching, background refetching, pagination, and optimistic updates out of the box.
- Excellent TypeScript support with inferred query and mutation types.
- Loading, error, and success states are managed declaratively, supporting Constitution Principle 7 (Every Screen Must Handle States).
- Works seamlessly with the API client layer.

**Alternatives considered**:
- Redux Toolkit + RTK Query: More powerful but adds unnecessary complexity for a CRUD-heavy app.
- SWR: Lightweight alternative, but TanStack Query has better pagination and mutation support.
- Custom hooks with useEffect: Would require reimplementing caching, deduping, and state management.

---

## Decision: react-hot-toast for Notifications

**Decision**: Use **react-hot-toast** for toast notifications on the frontend.

**Rationale**:
- Lightweight, headless notification system with excellent TypeScript support.
- Easy to integrate with the global API error handler and success feedback flow.
- Supports Constitution Principle 7 (success/error states) with minimal bundle size.

**Alternatives considered**:
- react-toastify: More configurable but heavier bundle.
- Sonner: Modern and beautiful, but newer and less battle-tested.

---

## Decision: qrcode.react for QR Display, html5-qrcode for Scanning

**Decision**: Use **qrcode.react** for generating QR code displays and **html5-qrcode** for camera-based QR scanning.

**Rationale**:
- qrcode.react is the standard React QR code renderer with custom styling support (required for AMG design system).
- html5-qrcode is a well-maintained, camera-based QR scanner that works in modern browsers without native app dependencies.
- Both libraries are lightweight and TypeScript-friendly.

**Alternatives considered**:
- Custom QR generation: Unnecessary; qrcode.react is proven and battle-tested.
- ZXing JavaScript port: More powerful but harder to integrate and heavier bundle.

---

## Decision: json2csv for CSV Exports

**Decision**: Use **json2csv** (or `@json2csv/plainjs`) for CSV generation on the backend.

**Rationale**:
- Mature, well-documented library for converting JSON arrays to CSV format.
- Supports custom headers, transforms, and streaming for large datasets.
- If Excel export is needed later, `xlsx` (SheetJS) can be added as an optional enhancement.

**Alternatives considered**:
- fast-csv: Good for streaming but less flexible for custom formatting.
- Manual string concatenation: Error-prone and doesn't handle edge cases (quotes, commas, newlines).

---

## Resolved Unknowns

| Unknown | Decision | Rationale |
|---|---|---|
| ORM | Prisma | Best TypeScript integration, reliable migrations, visual studio |
| Email service | Resend (fallback SMTP) | Modern API, good deliverability, simple integration |
| Background jobs | BullMQ + Redis | Standard for Node.js, supports retries and scheduling |
| Local development | Docker + Docker Compose | Consistent environments, easy onboarding |
| Production deployment | PM2 on Hostinger VPS | Proven for Node.js, low overhead |
| Shared validation | Zod | Runtime validation + TypeScript inference, shareable |
| Server state (frontend) | TanStack Query | Caching, pagination, optimistic updates |
| Toast notifications | react-hot-toast | Lightweight, headless, TypeScript-friendly |
| QR display | qrcode.react | Standard React QR renderer |
| QR scanning | html5-qrcode | Browser-based camera scanning, no native app needed |
| CSV exports | json2csv | Mature, streaming support, customizable |

---

## Open Decisions (to be made during implementation)

| Decision | Context | Suggested approach |
|---|---|---|
| Payment gateway | AMG Academy business decision | Start with manual/offline verification; abstract interface for future gateway |
| Video streaming provider | Future migration from VPS | Abstract video provider interface; start with signed-URL VPS delivery |
| Staging environment | Hostinger plan limitations | Use Docker Compose on a second VPS or subdomain on the same VPS |
| Backup strategy | Data protection requirements | Daily automated PostgreSQL dumps to external storage (S3 or Hostinger backup) |
