# CoachConnect

A two-sided sports coaching marketplace — coaches monetise their expertise,
clients discover and book sessions nearby. Built per the CoachConnect BRD v1.0.

## Stack
- **Next.js 16** (App Router) + React 19 + TypeScript
- **Postgres** via **Drizzle ORM** (local Docker in dev; Neon in prod)
- **Auth.js (NextAuth v5)** — email/password + OAuth
- **Stripe** (test mode) — escrow marketplace payments
- **Cloudinary** — media CDN
- **Tailwind v4 + Framer Motion** — "Electric Volt" Kinetic Athletic design system

## Architecture
```
src/server/
  config.ts            validated env (zod)
  db/                  Drizzle schema + client
  integrations/        swappable ports (payments, email, push, maps, storage)
                       each: real + mock impl, chosen by INTEGRATION_* flags
  domain/              entity types & business rules
  repositories/        data access
  services/            use-cases / orchestration
```

## Develop
```bash
# Postgres (local)
docker start coachconnect-db          # port 5440

pnpm install
pnpm db:migrate                       # apply schema
pnpm db:seed                          # sports taxonomy
pnpm dev                              # http://localhost:3000
```

See [ROADMAP.md](./ROADMAP.md) for phased feature tracking.
