# Quick Start: AMG Academy Platform V1

**Date**: 2026-05-27
**Feature**: AMG Academy Platform V1
**Plan**: [plan.md](plan.md)

---

## Prerequisites

- Node.js 20+ and npm 10+
- Docker and Docker Compose (for local development)
- Git

## 1. Clone and Setup

```bash
git clone <repo-url> amg-academy-platform
cd amg-academy-platform
npm install
```

## 2. Environment Configuration

Create `.env` files:

```bash
# Root .env (used by Docker Compose)
cp .env.example .env

# apps/api/.env
cp apps/api/.env.example apps/api/.env

# apps/web/.env
cp apps/web/.env.example apps/web/.env
```

Edit `.env` with your values:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/amg_academy_dev"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"

# Email (use Resend or SMTP)
RESEND_API_KEY="re_xxxxxxxx"
# Or SMTP:
# SMTP_HOST="smtp.hostinger.com"
# SMTP_PORT=587
# SMTP_USER="noreply@amgacademy.com"
# SMTP_PASS="your-smtp-password"

# App URLs
FRONTEND_URL="http://localhost:3000"
API_URL="http://localhost:4000"

# Uploads
UPLOAD_DIR="./uploads"
```

## 3. Start Local Development Stack

```bash
# Start PostgreSQL, Redis, and Nginx via Docker Compose
docker-compose up -d

# Run database migrations
cd apps/api
npx prisma migrate dev
npx prisma db seed  # Optional: seed test data

# Start backend (in one terminal)
npm run dev:api

# Start frontend (in another terminal)
npm run dev:web
```

The stack will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Docs (Swagger): http://localhost:4000/api/docs
- Prisma Studio: http://localhost:5555

## 4. Development Commands

| Command | Purpose |
|---|---|
| `npm run dev:web` | Start Next.js dev server |
| `npm run dev:api` | Start NestJS dev server |
| `npm run build` | Build all apps and packages |
| `npm run test` | Run all tests |
| `npm run test:api` | Run backend tests |
| `npm run test:web` | Run frontend tests |
| `npm run lint` | Lint all code |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed test data |

## 5. Project Structure Quick Reference

```
├── apps/
│   ├── web/          # Next.js frontend (port 3000)
│   └── api/          # NestJS backend (port 4000)
├── packages/
│   ├── shared/       # Zod schemas, types, enums
│   └── config/       # Shared tooling configs
├── docker-compose.yml
└── specs/            # Feature specifications
    └── 001-amg-platform-v1/
        ├── spec.md
        ├── plan.md
        ├── research.md
        ├── data-model.md
        ├── quickstart.md
        └── contracts/
```

## 6. Adding a New Module

1. **Backend**:
   ```bash
   cd apps/api
   nest g module events
   nest g controller events
   nest g service events
   ```
   - Add module to `AppModule` imports.
   - Define Prisma model in `schema.prisma`.
   - Run `npx prisma migrate dev`.
   - Create Zod schema in `packages/shared/src/schemas/`.
   - Add API contract in `specs/001-amg-platform-v1/contracts/`.

2. **Frontend**:
   - Add route in `apps/web/src/app/`.
   - Create page component.
   - Add API hooks in `apps/web/src/hooks/`.
   - Add reusable UI components if needed.

## 7. Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:api:integration

# E2E tests
npm run test:e2e

# Specific test
npm run test -- registrations.service
```

## 8. Deployment (Production)

See [plan.md Section 20](plan.md#20-deployment-plan) for full deployment instructions.

Quick production deploy:
```bash
# On VPS
ssh user@amgacademy.com
cd /var/www/amg-academy-platform
git pull origin main
npm ci
npm run db:migrate
npm run build
pm2 restart all
```

## 9. Troubleshooting

| Issue | Solution |
|---|---|
| Database connection failed | Check `DATABASE_URL` and ensure PostgreSQL container is running (`docker-compose ps`) |
| Prisma Client not found | Run `npx prisma generate` in `apps/api/` |
| Port already in use | Kill process on port 3000/4000 or change ports in `.env` |
| Uploads not working | Ensure `UPLOAD_DIR` exists and has write permissions |
| Email not sending | Check `RESEND_API_KEY` or SMTP credentials |

## 10. Important Links

- [Specification](spec.md)
- [Implementation Plan](plan.md)
- [Research & Decisions](research.md)
- [Data Model](data-model.md)
- [API Contracts](contracts/api-contracts.md)
- [Project Constitution](../../.specify/memory/constitution.md)
