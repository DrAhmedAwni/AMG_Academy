# Deployment Guide

## Overview

This project ships as a Node.js monorepo with a Next.js frontend, a NestJS API, PostgreSQL, Redis, and optional Nginx reverse proxying. Production runtime is managed with PM2 via [ecosystem.config.js](../ecosystem.config.js).

## Environment Variables

Copy the root environment template before deployment:

```powershell
Copy-Item .env.example .env
```

Important root variables:

| Variable | Purpose | Example |
| --- | --- | --- |
| `POSTGRES_DB` | Local Docker database name | `amg_academy_dev` |
| `POSTGRES_USER` | Postgres username | `postgres` |
| `POSTGRES_PASSWORD` | Postgres password | `postgres` |
| `DATABASE_URL` | Prisma and backup connection string | `postgresql://postgres:postgres@localhost:5432/amg_academy_dev` |
| `REDIS_URL` | Redis cache/queue connection | `redis://localhost:6379` |
| `JWT_SECRET` | Access token signing secret | `minimum-32-char-secret` |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | `minimum-32-char-refresh-secret` |
| `JWT_RESET_SECRET` | Password reset signing secret | `minimum-32-char-reset-secret` |
| `RESEND_API_KEY` | Transactional email API key | `re_xxxxx` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | SMTP fallback configuration | `smtp.hostinger.com` |
| `FRONTEND_URL` | Canonical public frontend URL | `https://academy.example.com` |
| `API_URL` | Canonical public API URL | `https://academy.example.com/api` |
| `NEXT_PUBLIC_API_URL` | Frontend browser API base URL | `https://academy.example.com/api` |
| `UPLOAD_DIR` | Persistent uploads directory | `/var/www/amg/uploads` |

Application-specific examples also live in:

- [apps/api/.env.example](../apps/api/.env.example)
- [apps/web/.env.example](../apps/web/.env.example)

## Production Build

```powershell
npm install
npm run prisma:generate -w @amg/api
npm run build
```

Apply database changes before starting services:

```powershell
npm run prisma:migrate -w @amg/api
```

## PM2 Runtime

Start or reload both services:

```powershell
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

For updates:

```powershell
git pull
npm install
npm run build
npm run prisma:migrate -w @amg/api
pm2 reload ecosystem.config.js
```

## Reverse Proxy and Security Headers

The repository includes:

- [nginx.conf](../nginx.conf) with CSP, HSTS, `X-Frame-Options`, and `X-Content-Type-Options`
- [apps/web/next.config.js](../apps/web/next.config.js) with matching app-layer headers

Terminate TLS at Nginx or an upstream load balancer so HSTS applies only on HTTPS traffic.

## Database Backup Automation

Two PowerShell helpers are included:

- [scripts/backup-db.ps1](../scripts/backup-db.ps1)
- [scripts/restore-db.ps1](../scripts/restore-db.ps1)

Create a backup:

```powershell
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/amg_academy_prod"
.\scripts\backup-db.ps1 -OutputDir backups
```

Restore a backup:

```powershell
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/amg_academy_prod"
.\scripts\restore-db.ps1 -BackupFile .\backups\amg-academy-20260528-120000.dump
```

### Scheduled Backups

Example Windows Task Scheduler action:

```powershell
powershell.exe -NoProfile -File D:\AMG Academy V1\scripts\backup-db.ps1 -OutputDir D:\AMG Academy V1\backups
```

Recommended retention policy:

1. Daily backups kept for 14 days
2. Weekly backups kept for 8 weeks
3. Monthly backups copied to off-host storage

## Deployment Checklist

1. Set production secrets in `.env`
2. Verify PostgreSQL and Redis connectivity
3. Run Prisma migrations
4. Build the workspace
5. Start or reload PM2
6. Verify `/api/v1/docs`, `/health` if present, and the frontend login flow
7. Run a manual admin smoke test after deployment
