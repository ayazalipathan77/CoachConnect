# CoachConnect — Build Roadmap & Feature Tracker

> **Purpose:** single source of truth for what's built, what's in progress, and
> what's next. Update the status box as features land. Resume work by finding the
> first `🔲 TODO` in the lowest-numbered incomplete phase.

**Legend:** ✅ Done · 🟡 In progress · 🔲 TODO · ⏭️ Deferred (Phase 2 / out of MVP scope)

**Last updated:** 2026-06-18

> **Progress so far (re-audited 2026-06-18):** Phases 0, 4, 5, 6, 8 are
> essentially complete; Phases 1–3 have the core flow working but several
> items were optimistically marked done earlier and have been corrected to
> 🟡/🔲 below (no OAuth, no real multi-step coach wizard, no recurring
> slots, no video uploads, ToS checkbox not server-validated, no real card
> form). Live in production on Render: sign up → discover/map → coach
> profile → book a slot (with discounts) → mock escrow payment → My
> Bookings, plus a full admin back-office and coach monetization (featured
> placement, discounts) added in Phase 8. Biggest real gaps: Stripe Payment
> Element / real card capture (4.3), recurring slot templates (2.8), video
> uploads (2.5), message spam filtering (5.2), GDPR tooling (6.7), and the
> accessibility/security/performance audits in Phase 7.

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
| 1.1 | Auth.js-style session (custom JWT cookie, not NextAuth) | ✅ | `src/server/auth/session.ts` — stateless signed cookie, not the Drizzle adapter originally planned |
| 1.2 | Email/password credentials provider | ✅ | bcrypt hash on `users.passwordHash` |
| 1.3 | Google / Apple OAuth | 🔲 | `accounts` table exists for it, no provider wired |
| 1.4 | Role-aware session (coach/client/admin) | ✅ | role in session cookie |
| 1.5 | Client registration + onboarding | 🟡 | signup collects name/email/password/role only; dob/location/preferred sports filled in later via `/dashboard/profile` |
| 1.6 | Coach registration + multi-step wizard | 🟡 | single signup form, not a wizard; profile/sports/venue/documents filled in afterward across separate coach dashboard pages |
| 1.7 | ToS / Coach Code of Conduct acceptance | 🟡 | checkbox + link to `/terms` shown at signup (`AuthForm.tsx`, browser-enforced `required`), but **not validated server-side and not persisted** — no audit trail of acceptance |
| 1.8 | Profile completeness + 'Pending Review' gate (80%) | 🟡 | `completeness` is computed and shown, but nothing actually blocks/gates a sub-80% coach from going live |
| 1.9 | Activation email | 🔲 | signup doesn't send any email; password reset and notifications do use the email integration, just not account activation |
| 1.10 | MFA availability | ⏭️ | NFR; `mfaEnabled` column exists, no flow |
| 1.11 | Password reset (forgot/reset) | ✅ | *(not in original plan)* hashed single-use tokens, 1h expiry — `src/server/auth/password-reset.ts` |

---

## 🧑‍🏫 Phase 2 — Coach Portal

> BRD §5.2–5.5.

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 2.1 | Coach dashboard hub | ✅ | bookings, earnings chart, completeness, slots — `/dashboard/coach` |
| 2.2 | Profile editor (identity, about, location) | ✅ | `/dashboard/coach/profile` |
| 2.3 | Venue management (multiple training venues) | ✅ | inline "add new venue" in slot form; no dedicated venue-list page but functional |
| 2.4 | Qualification uploads + admin review | ✅ | upload UI + admin approve/reject (`AdminDocumentsReview.tsx`) — **this admin half was missing until this session**; only `approved` docs show on the public profile |
| 2.5 | Video uploads / YouTube-Vimeo embeds (max 10) | 🔲 | `media` table supports `type: "video"`, no upload UI or embed component exists |
| 2.6 | Profile visibility (Public/Unlisted/Paused) | ✅ | enum + admin/coach editable |
| 2.7 | Slot creation form | ✅ | date, duration, type, fee, max participants, venue, sport |
| 2.8 | Bulk/recurring slot templates | 🔲 | `recurringKind`/`recurringGroupId` columns exist in schema, completely unused — no UI ever sets them beyond the default `one_off` |
| 2.9 | Slot edit/cancel rules | ✅ | locked once non-`open`; coach can re-edit an expired-unbooked slot to a future date |
| 2.10 | Overlap prevention vs confirmed bookings | ✅ | service-layer guard on create + edit |
| 2.11 | Fee config + platform minimum + free intro (2/mo) | ✅ | admin-configurable minimum (`platform_settings`), free-intro cap enforced in `createBooking` |
| 2.12 | Group sessions (multi-participant slots) | ✅ | *(not in original plan — was listed under "Deferred")* `maxParticipants`/`currentParticipants` pooling, atomic claim on booking |
| 2.13 | Coach discount rules (early-bird / flat %) | ✅ | *(not in original plan)* `/dashboard/coach/discounts`, auto-applied at booking time |
| 2.14 | Paid featured placement | ✅ | *(not in original plan)* `/dashboard/coach/featured`, admin-configurable plans, charged via `PaymentProvider.charge()` |

---

## 🔎 Phase 3 — Client Discovery

> BRD §6.2–6.3.

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 3.1 | Search interface (free-text) | ✅ | name / sport / location |
| 3.2 | Filters: sport, distance, availability, price, rating, level | 🟡 | sport/price/rating/level done; no real "distance" or "availability" filter |
| 3.3 | Relevance sort (proximity + rating) + sort options | 🟡 | price/rating/reviews sorts are real; "relevance" is just an alias for rating sort, no combined proximity score |
| 3.4 | List view of results | ✅ | coach cards, featured-first |
| 3.5 | Map view + proximity clustering | 🟡 | real Leaflet map with pins (`CoachMap.tsx`/`MapView.tsx`), not just a stub — no clustering at high pin density though |
| 3.6 | Public coach profile (client view) | ✅ | all sections + bookable slots + verified documents + featured badge |
| 3.7 | 'Book This Slot' / 'Enquire' / social share | ✅ | CTAs (no social share button specifically) |
| 3.8 | Featured-first sorting + badge | ✅ | *(not in original plan)* paid placement surfaces top of every discover query |

---

## 💳 Phase 4 — Booking & Payments

> BRD §6.4, §8.1, §8.2. Stripe escrow.

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 4.1 | Slot selection + booking summary | ✅ | price incl. service charge + any discount applied |
| 4.2 | Payment intent (escrow, manual capture) | ✅ | Stripe test / mock adapter |
| 4.3 | Card + wallets (Apple/Google Pay) | 🔲 | no Stripe Payment Element / real card form anywhere — checkout is a single "Confirm & pay" button (mock escrow only); client "saved cards" UI (`PaymentMethodsManager.tsx`) is explicitly mock/demo data, not real tokenization |
| 4.4 | Booking confirmation (email + in-app) | ✅ | |
| 4.5 | Escrow release on completion | ✅ | `completeSession()` calls `releaseToCoach()` |
| 4.6 | Commission calc (configurable) | ✅ | admin-overridable via `platform_settings`, falls back to env default |
| 4.7 | Cancellation policy + refund tiers | ✅ | exact 48h/24h matrix in `src/lib/cancellation.ts` |
| 4.8 | Coach cancellation + strikes (3/90d → suspend) | 🟡 | strike increments + auto-suspend logic works (`coachCancelBooking`), but the strike count is never shown anywhere in the admin UI — silent counter |
| 4.9 | My Bookings (upcoming/past/cancelled) + re-book | ✅ | both portals |
| 4.10 | Group/multi-participant sessions | ✅ | *(not in original plan, see 2.12)* |
| 4.11 | Coach-defined discounts at checkout | ✅ | *(not in original plan, see 2.13)* recorded on `bookings.discountMinor` |
| 4.12 | Client mock payment methods / refund account | ✅ | *(not in original plan)* `/dashboard/payment-methods` — explicitly demo data only |
| 4.13 | Waitlist for full slots | ✅ | *(not in original plan)* join per-slot or coach-wide, auto-notified on a cancellation or new matching slot |
| 4.14 | Hide expired slots from booking | ✅ | *(not in original plan)* discover/profile already filtered by time; direct `/book/[slotId]` links to an expired-but-never-booked slot now correctly 404 instead of showing a stale form |

---

## 💬 Phase 5 — Messaging, Reviews & Notifications

> BRD §6.5, §7.1, §7.2.

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 5.1 | In-app messaging (enquiry + booked) | ✅ | `/messages`, conversations + threads |
| 5.2 | Spam/inappropriate filtering | 🔲 | `messages.flagged` column exists, nothing ever sets it — no filtering pipeline |
| 5.3 | Reviews: rating, comment, tags | ✅ | post-session prompt on `/bookings` |
| 5.4 | Coach single response to review | ✅ | `ReviewResponseForm` |
| 5.5 | Aggregate rating on profile | ✅ | recalculated on every new review |
| 5.6 | Notification matrix (email/push/in-app) | ✅ | all three channels actually dispatch depending on type (`src/server/notifications/service.ts`) — booking/cancellation/waitlist events route to in_app+email, 1h reminders to in_app+push |
| 5.7 | Session reminders (24h / 1h) | 🟡 | `/api/cron/reminders` route + logic exists and works, but nothing currently *calls* it on Render (the free-tier Cron Job service was removed — see Operations notes below); needs an external scheduler hitting it with `CRON_SECRET` |

---

## 🛡️ Phase 6 — Admin Panel & Platform Ops

> BRD §7.3, §8.3.

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 6.1 | Admin auth + role guard | ✅ | |
| 6.2 | Qualification verification queue | ✅ | coach verify/reject **and**, as of this session, document approve/reject (`AdminDocumentsReview.tsx`) — previously `media.status` had no admin action wired to it at all, so every coach's documents were stuck "pending" forever |
| 6.3 | Review moderation | ✅ | hide/show |
| 6.4 | Sports taxonomy management (no deploy) | ✅ | add/toggle sports |
| 6.5 | Commission rate + platform minimum config | ✅ | `/admin/settings`, DB-backed override of env defaults |
| 6.6 | Coach suspension / strike review | 🟡 | suspend/activate works; the strike *count* itself isn't surfaced anywhere in the admin UI (see 4.8) |
| 6.7 | GDPR export / erasure tooling | 🔲 | nothing implemented — no data export or account deletion anywhere |
| 6.8 | Admin mobile-responsive layout | ✅ | *(not in original plan)* sidebar was a fixed 240px column with no mobile handling until this session |
| 6.9 | Direct user/coach editing | ✅ | *(not in original plan)* `/admin/users`, `/admin/coaches/[id]/edit` |
| 6.10 | Featured-placement plan catalog | ✅ | *(not in original plan, see 2.14)* |

---

## 🚀 Phase 7 — Hardening & Launch Readiness

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 7.1 | Real integrations (Stripe live test, Maps, Email, Push) | 🔲 | adapter layer ready, `INTEGRATION_*` flags still default `mock` everywhere |
| 7.2 | Production hosting | ✅ (changed) | deployed to **Render** (Blueprint, `render.yaml`), not Neon as originally planned — see Operations notes below |
| 7.3 | WCAG 2.1 AA pass | 🔲 | not audited |
| 7.4 | Lighthouse 80+ mobile | 🔲 | not audited |
| 7.5 | Security review (OWASP, zero crit/high) | 🔲 | not audited |
| 7.6 | E2E acceptance flows (coach 15-min, client 5-min) | 🟡 | individual flows manually verified via Playwright through this session (signup→discover→book, coach slot CRUD, admin review, featured purchase), not run as timed end-to-end acceptance tests |

---

## 💰 Phase 8 — Admin Enrichment & Coach Monetization ✅

> Branch: `feature/admin-enrichment-monetization`. Admin mobile fix, platform
> settings, direct user/coach editing, paid featured placement, coach-defined
> discounts, and mock client payment-method/refund-account UI.

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 8.1 | Admin mobile sidebar fix | ✅ | `AdminSidebar.tsx` — desktop vertical / mobile horizontal pill nav, mirrors `CoachSidebar` |
| 8.2 | Admin platform settings page | ✅ | `platform_settings` table overrides `config.ts` commission rate / min fee; falls back to env defaults when unset |
| 8.3 | Admin payments/payouts metadata | ✅ | Stripe account label, support email, payout instructions — config metadata only, **not** a place for live secrets (those stay env-var + redeploy) |
| 8.4 | Admin direct coach profile edit | ✅ | `/admin/coaches/[id]/edit` — headline, bio, rate, visibility, status |
| 8.5 | Admin users list + inline edit | ✅ | `/admin/users` — role filter, inline name/email/role edit |
| 8.6 | Featured coach placement (paid) | ✅ | Admin-configurable plan catalog (`featured_plans`: key/label/duration/price), coach purchase flow at `/dashboard/coach/featured` charges via `PaymentProvider.charge()` (new provider method, mock + Stripe), `coach_profiles.featuredUntil` + `featured_promotions` audit trail |
| 8.7 | Featured-first discovery sort | ✅ | `listCoaches`/`getCoachById` surface `featured`; discover grid shows a "Featured" badge, stable-sorted to the top |
| 8.8 | Coach discount rules | ✅ | `/dashboard/coach/discounts` — flat % or early-bird (min days before start) rules, scoped to one slot or all open slots; applied automatically in `createBooking`, recorded on `bookings.discountMinor` |
| 8.9 | Client payment methods / refund account (mock) | ✅ | `/dashboard/payment-methods` — masked card + bank details only, explicitly labeled as demo data, no real tokenization |

---

## ✨ Phase 9 — UX polish (not in original plan)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 9.1 | Global loading overlay | ✅ | blurred backdrop + looping logo on every server action/transition/route navigation — `LoadingProvider`, `usePendingLoader`, `FormPendingLoader` |
| 9.2 | Homepage reorder + "Become a Coach" split out | ✅ | testimonials moved up (trust before deeper scroll); full coach pitch moved to its own `/become-a-coach` page, homepage shows a compact teaser |
| 9.3 | "How it Works" anchor link double-click bug | ✅ | fixed same-page hash clicks (no-op URL change) and cross-page navigation race against in-progress layout |
| 9.4 | Coach earnings vs. chart mismatch | ✅ | "Earnings" stat now counts `completed` only, matching the chart and the escrow model (previously also counted `confirmed`, future revenue) |

---

## 🛠️ Operations notes (Render deploy)

Picked up during first production deploy after Phase 8 — not features, but load-bearing
deploy config worth keeping visible:

- **Migrations must run before `next build`**, not after — some pages query tables a
  migration creates, and `next build` executes pages while collecting page data.
  `buildCommand` in `render.yaml` runs `pnpm db:migrate && pnpm build && pnpm db:deploy`.
- **`DATABASE_URL` is set manually** in the Render dashboard (`sync: false` in
  `render.yaml`), not wired via `fromDatabase` — the build phase has no access to
  Render's internal private network, and the Blueprint schema has no "external
  connection string" property to wire automatically. Use the **External** Database URL.
- **No cron job on Render** — the free tier has no free plan for the Cron Job service
  type. `/api/cron/reminders` (guarded by `CRON_SECRET`) still exists; point any free
  external scheduler at it if you want session reminders running.
- Every seed script's `main()` **must call `process.exit(0)`** on success — Drizzle/
  postgres.js keeps the process alive on an open connection otherwise, which silently
  hung the entire build for ~30 minutes before Render's own timeout intervened.

---

## Deferred to Phase 2 (out of MVP) ⏭️
Subscriptions · live video · automated payouts/invoicing · 3rd-party calendar
sync · native mobile app · background checks · multi-currency/region · real
card tokenization (current payment-methods UI is mock/demo data only).

~~Group sessions~~ — built in Phase 8 (2.12), no longer deferred.

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
