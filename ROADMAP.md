# CoachConnect — Build Roadmap & Feature Tracker

> **Purpose:** single source of truth for what's built, what's in progress, and
> what's next. Update the status box as features land. Resume work by finding the
> first `🔲 TODO` in the lowest-numbered incomplete phase.

**Legend:** ✅ Done · 🟡 In progress · 🔲 TODO · ⏭️ Deferred (Phase 2 / out of MVP scope)

**Last updated:** 2026-06-15

> **Progress so far:** Phase 0 ✅ · Phase 1 (auth) ✅ · Phase 3 (discovery) ✅ ·
> Phase 4 core (booking + escrow) ✅. Live flow: sign up → discover coaches →
> coach profile → book a slot → mock escrow payment → My Bookings, with real
> data from Postgres and session-aware dashboards. Design = 1:1 port of the
> reference repo (full-width, "The Track").

---

## 🧱 Phase 0 — Foundation & Architecture ✅

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 0.1 | Next.js 16 + React 19 + TS + Tailwind v4 scaffold | ✅ | App Router, `src/` dir, `@/*` alias |
| 0.2 | Local Postgres 16 (Docker) | ✅ | `coachconnect-db`, port **5440** |
| 0.3 | Validated env config (zod) | ✅ | `src/server/config.ts` |
| 0.4 | Drizzle ORM + full schema (17 tables) | ✅ | `src/server/db/schema.ts` |
| 0.5 | Migrations applied + sports taxonomy seeded | ✅ | 20 sports (BRD §7.3) |
| 0.6 | Integration adapter layer (ports + real/mock) | ✅ | payments, email, push, maps, storage |
| 0.7 | Electric Volt design system (tokens, motion, UI kit) | ✅ | dark-first + light theme |
| 0.8 | Brand assets — logo, wordmark, favicon | ✅ | "momentum bolt" mark, SVG |
| 0.9 | Marketing landing page (motion showcase) | ✅ | hero, marquee, how-it-works — **verified running** |

---

## 🔐 Phase 1 — Auth & Onboarding

> BRD §5.1, §6.1. Dedicated coach vs client registration flows.

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1.1 | Auth.js (NextAuth v5) + Drizzle adapter | ✅ | email/password + OAuth scaffolding |
| 1.2 | Email/password credentials provider | ✅ | bcrypt/argon hash on `users.passwordHash` |
| 1.3 | Google / Apple OAuth | 🔲 | wired, keys pending |
| 1.4 | Role-aware session (coach/client/admin) | ✅ | role in JWT/session |
| 1.5 | Client registration + onboarding | 🟡 | name, dob, location, preferred sports |
| 1.6 | Coach registration + multi-step wizard | 🟡 | details → sports → experience → location → bio |
| 1.7 | ToS / Coach Code of Conduct acceptance | 🔲 | gate before activation |
| 1.8 | Profile completeness + 'Pending Review' gate (80%) | 🔲 | `coach_profiles.completeness` |
| 1.9 | Activation email | 🔲 | via email adapter |
| 1.10 | MFA availability | ⏭️ | NFR; toggle stub now, full later |

---

## 🧑‍🏫 Phase 2 — Coach Portal

> BRD §5.2–5.5.

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 2.1 | Coach dashboard hub | 🔲 | bookings, earnings, messages, completeness |
| 2.2 | Profile editor (identity, about, location) | 🔲 | all sections editable |
| 2.3 | Venue management (multiple training venues) | 🔲 | geocoded |
| 2.4 | Qualification uploads + re-verification flag | 🔲 | Cloudinary, admin review |
| 2.5 | Video uploads / YouTube-Vimeo embeds (max 10) | 🔲 | Cloudinary or embed |
| 2.6 | Profile visibility (Public/Unlisted/Paused) | 🔲 | enum on profile |
| 2.7 | Slot creation form | 🔲 | date, duration, type, fee, venue, recurring |
| 2.8 | Bulk/recurring slot templates | 🔲 | weekly / bi-weekly |
| 2.9 | Slot edit/cancel rules | 🔲 | locked after booking except notes |
| 2.10 | Overlap prevention vs confirmed bookings | 🔲 | service-layer guard |
| 2.11 | Fee config + platform minimum + free intro (2/mo) | 🔲 | BRD §5.4 |

---

## 🔎 Phase 3 — Client Discovery

> BRD §6.2–6.3.

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 3.1 | Search interface (free-text) | ✅ | name / sport / location |
| 3.2 | Filters: sport, distance, availability, price, rating, level | 🟡 | BRD §6.2.1 |
| 3.3 | Relevance sort (proximity + rating) + sort options | 🟡 | combined score |
| 3.4 | List view of results | ✅ | coach cards |
| 3.5 | Map view + proximity clustering | 🔲 | maps adapter (mock→Google) |
| 3.6 | Public coach profile (client view) | ✅ | all sections + bookable slots |
| 3.7 | 'Book This Slot' / 'Enquire' / social share | ✅ | CTAs |

---

## 💳 Phase 4 — Booking & Payments

> BRD §6.4, §8.1, §8.2. Stripe escrow.

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 4.1 | Slot selection + booking summary | ✅ | price incl. service charge |
| 4.2 | Payment intent (escrow, manual capture) | ✅ | Stripe test / mock adapter |
| 4.3 | Card + wallets (Apple/Google Pay) | 🔲 | Stripe Payment Element |
| 4.4 | Booking confirmation (email + in-app) | ✅ | <60s acceptance criterion |
| 4.5 | Escrow release on completion | 🔲 | capture intent |
| 4.6 | Commission calc (15% configurable) | ✅ | service-layer pricing |
| 4.7 | Cancellation policy + refund tiers | 🔲 | 48h/24h matrix (BRD §8.1) |
| 4.8 | Coach cancellation + strikes (3/90d → suspend) | 🔲 | strike counter |
| 4.9 | My Bookings (upcoming/past/cancelled) + re-book | ✅ | both portals |

---

## 💬 Phase 5 — Messaging, Reviews & Notifications

> BRD §6.5, §7.1, §7.2.

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 5.1 | In-app messaging (enquiry + booked) | 🔲 | conversations/messages tables |
| 5.2 | Spam/inappropriate filtering | 🔲 | flag pipeline |
| 5.3 | Reviews: rating, comment, tags | 🔲 | post-session prompt |
| 5.4 | Coach single response to review | 🔲 | |
| 5.5 | Aggregate rating on profile | 🔲 | denormalized avg/count |
| 5.6 | Notification matrix (email/push/in-app) | 🔲 | BRD §7.1 table |
| 5.7 | Session reminders (24h / 1h) | 🔲 | scheduled job (cron/queue) |

---

## 🛡️ Phase 6 — Admin Panel & Platform Ops

> BRD §7.3, §8.3.

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 6.1 | Admin auth + role guard | 🔲 | |
| 6.2 | Qualification verification queue | 🔲 | approve → verified badge |
| 6.3 | Review moderation | 🔲 | hide/remove |
| 6.4 | Sports taxonomy management (no deploy) | 🔲 | add/edit sports |
| 6.5 | Commission rate + platform minimum config | 🔲 | |
| 6.6 | Coach suspension / strike review | 🔲 | |
| 6.7 | GDPR export / erasure tooling | 🔲 | 30-day window (NFR) |

---

## 🚀 Phase 7 — Hardening & Launch Readiness

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 7.1 | Real integrations (Stripe live test, Maps, Email, Push) | 🔲 | flip INTEGRATION_* flags |
| 7.2 | Migrate local Postgres → Neon | 🔲 | when project slot free |
| 7.3 | WCAG 2.1 AA pass | 🔲 | NFR |
| 7.4 | Lighthouse 80+ mobile | 🔲 | acceptance criterion #55 |
| 7.5 | Security review (OWASP, zero crit/high) | 🔲 | acceptance criterion #56 |
| 7.6 | E2E acceptance flows (coach 15-min, client 5-min) | 🔲 | criteria #49–50 |

---

## Deferred to Phase 2 (out of MVP) ⏭️
Group sessions · subscriptions · live video · automated payouts/invoicing ·
3rd-party calendar sync · native mobile app · background checks · multi-currency/region.

---

## Architecture cheat-sheet (for resuming)
```
src/server/config.ts              validated env (INTEGRATION_* flags switch mock↔real)
src/server/db/schema.ts           all 17 tables + enums + relations
src/server/db/index.ts            shared Drizzle client
src/server/integrations/*         payment/email/push/maps/storage ports (real+mock)
src/server/domain/*               (next) entity types + business rules
src/server/repositories/*         (next) data access
src/server/services/*             (next) use-cases / orchestration
src/components/ui                 design-system primitives (Button, Card, Badge, Input…)
src/components/motion             Framer Motion primitives (Reveal, HoverLift…)
src/components/brand              Logo / Wordmark
scripts/seed.ts                   taxonomy seed

Dev:  docker start coachconnect-db && pnpm dev   # :3000, db :5440
DB:   pnpm db:generate | db:migrate | db:seed | db:studio
```
