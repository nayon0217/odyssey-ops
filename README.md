# Odyssey Ops — Restaurant Operations Dashboard

A small but complete restaurant-operations product: manage the menu, take and advance orders,
view customers and spend, and configure ordering settings. Built as a pnpm + Turborepo monorepo
where the API contract is **generated end-to-end** (Drizzle → OpenAPI → Orval), so the frontend
never hand-writes a backend type.

## Stack

- **pnpm workspace + Turborepo**
- **apps/dashboard** — Expo (React Native + Web), Expo Router; runs on web
- **services/backend** — Hono (`OpenAPIHono`) on Cloudflare Workers
- **PostgreSQL + Drizzle ORM + drizzle-zod** — reached from the Worker via a Cloudflare **Hyperdrive** binding
- **OpenAPI** generation + **Orval**-generated React Query client/hooks
- Shared packages: `@odyssey/ui` (design system), `@odyssey/shared` (utils + order state machine), `@odyssey/types`, `@odyssey/api-client` (generated)

## Prerequisites

- **Node ≥ 20** and **pnpm** (via Corepack: `corepack enable pnpm`)
- **Docker** (provides Postgres — no local Postgres install needed)

## Run locally

```bash
# 1. Install
pnpm install

# 2. Backend env — Postgres connection string for migrations/seed
cp .env.example services/backend/.dev.vars

# 3. Start Postgres (docker-compose; host port 5433)
pnpm db:up

# 4. Create the schema, then seed realistic data
pnpm db:push
pnpm db:seed

# 5. Run the two apps (separate terminals)
pnpm dev:backend      # Hono on http://localhost:8787 (wrangler dev)
pnpm dev:dashboard    # Expo web on http://localhost:8082
```

Open **http://localhost:8082**. The design-system reference lives at **/ui**.

> Postgres is mapped to host port **5433** (5432 is commonly taken). The connection string in
> `.env.example` / `.dev.vars` already reflects this. The dashboard defaults to the backend at
> `http://localhost:8787` (override with `EXPO_PUBLIC_API_URL`).

## Seed data

`pnpm db:seed` truncates and repopulates: **4 categories, 16 menu items, 20 customers, and 68
orders** spread across the last ~30 days and every status. Re-runnable at any time.

## Scripts

| Script | Purpose |
|---|---|
| `pnpm dev:dashboard` | Run the Expo web app |
| `pnpm dev:backend` | Run the Hono backend via wrangler dev |
| `pnpm db:up` / `db:push` / `db:seed` | Start Postgres · apply schema · seed |
| `pnpm gen:contract` | Emit `openapi.json` from the backend, then regenerate the Orval client |
| `pnpm lint` | Lint every workspace |
| `pnpm typecheck` | Typecheck every workspace |
| `pnpm test` | Run backend + shared + UI suites (**requires `pnpm db:up`** — backend tests hit Docker Postgres) |

## Architecture decisions

Built in verifiable phases (git history: Phase 0 guardrails → walking-skeleton contract →
domain API → design system → five pages → tests/DX → docs), each gated on a real check
(curl, browser, green tests) before the next started.

**Contract flows one direction.** Persisted truth starts in the Drizzle schema
(`services/backend/src/db/schema.ts`). `drizzle-zod` derives Zod schemas; `@hono/zod-openapi`
turns those into typed routes + an OpenAPI document; `scripts/emit-openapi.ts` writes
`openapi.json` without booting a server; Orval regenerates fully-typed React Query hooks in
`@odyssey/api-client`. The dashboard imports **only** those hooks/models (via `@odyssey/types`
as the app-facing surface) — no page hand-writes a DTO, and `generated/` is never edited.
`pnpm gen:contract` runs the whole chain.

**Enums and the state machine stay single-sourced.** Order statuses/actions live once in
`@odyssey/shared` (`order-status.ts`). The Postgres `pgEnum`, backend transition enforcement,
and dashboard action buttons all consume that map — so the UI cannot offer an illegal action
and the server rejects a stale client with `409` + allowed actions. Status changes go through
`POST /orders/:id/transition`, never a loose `PATCH status`.

**Money and line items are server-authoritative.** Amounts are integer **cents** end-to-end
(format only at the UI edge). Order totals are computed on the server from current prices;
a client-sent total is ignored. `order_items` **snapshot** name + unit price at purchase so
history never drifts with later menu edits.

**Time-based domain invariant.** Single-sourced as `effectiveOrderStatus` in `@odyssey/shared`:
(1) preparing >1h → ready; (2) any status other than accepted/cancelled >1 day → accepted.
Enforced as DB truth by `sweepStalePreparingOrders` before every order read (list, detail,
home, customer), rejected on illegal day-old transitions (`409`), and **asserted in seed** so
bootstrap data cannot violate the rule.

**Presentational dashboard, logic in services.** Pages compose `@odyssey/ui` + generated hooks;
draft/validation helpers (e.g. order-draft totals) are pure modules under `apps/dashboard/lib`
so they stay unit-testable without React. Form date filters use native HTML `type="date"` on
web — react-native-web’s `TextInput` overwrites `type`, so `@odyssey/ui`’s `Input` renders a
real calendar control when `type="date"`.

**Design system.** Centralized TS tokens + React Native `StyleSheet` in `@odyssey/ui` (not
NativeWind): one `tokens` object, identical web/native primitives, `/ui` living style guide.
Pastel restaurant-SaaS register (lilac-gray canvas, periwinkle primary, soft status tints);
Outfit + Plus Jakarta Sans; illustrated `Icon` primitive via `react-native-svg` (no emoji).
Select menus expand **inline** (in-flow) so they work inside modals/scroll views on web.

**Local infra.** Docker Compose Postgres on host **5433** (reviewer needs only Docker).
Worker → DB via Cloudflare **Hyperdrive** + `drizzle-orm/node-postgres` (`nodejs_compat`);
migrations/seed use `DATABASE_URL` directly.

## Tradeoffs and incomplete areas

- **Native parity**: verified for **web only**. RN primitives are used throughout so iOS/Android
  is plausible, but simulators were not run — called out as a bonus in the brief.
- **Dark mode**: token structure is semantic and could host a second theme; only light ships
  (deliberate timebox cut).
- **Pagination**: Orders and CRM load the full seeded set. Production would paginate API + lists;
  depth on the order lifecycle won over list-scale plumbing.
- **Auth**: no login/session — out of scope for the evaluation; required before any real deploy.
- **Realtime**: no websockets/polling beyond React Query defaults; kitchen boards would want push.
- **Settings depth**: availability, auto-accept, prep time, and hours are wired end-to-end;
  richer ops config was cut in favor of Orders/Menu depth.
- **Day-stale model**: collapsing mid-flow / ready / completed orders older than a day to
  **accepted** (or leaving **cancelled**) is a simplified ops rule for the demo dataset — not a
  full historical archive policy.
- **Test coverage**: targeted, not exhaustive (per the brief) — backend transitions + staleness,
  shared state machine + money, order-draft helpers, and key UI primitives (Button, StatusBadge).

## AI usage notes

- **Guardrails first.** `PLAN.md` at the repo root is a guardrail doc (contract flow, naming,
  a "never do this" list, the state machine) written up front and fed as context throughout, so
  generated code stayed inside the intended architecture.
- **Verifiable phases, not one big generation.** Git history is phased (0 foundation → 1 walking
  skeleton → 2 domain → 3 design system → 4 pages → 5 tests → 6 docs, then gap-close / UI
  redesign). Each phase ended with a real check — curl against a live route, a browser pass, or
  green tests — rather than trusting output at face value.
- **Steering / rejecting output.** Concrete examples: order creation stayed server-authoritative
  (client-sent totals ignored); DB layer chose Docker + Hyperdrive over a Neon-first draft so
  review stays Docker-only; react-native-web overlay bugs (nested `<button>` backdrops,
  `useNativeDriver` no-op on web, modals trapped in scroll) were caught by driving the real page
  and fixed at the primitive level; date filters use a real HTML calendar because RN-web
  `TextInput` cannot honor `type="date"`.
- **Parallel subagents** built independent slices (design-system primitive clusters; Home/CRM)
  against an already-verified foundation; each result was integrated and type-checked on the main
  thread rather than trusted blind.

## Repository layout

```
apps/dashboard        Expo Router app (5 pages + /ui style guide)
services/backend      Hono OpenAPI Worker, Drizzle schema, services, seed, tests
packages/ui           Design system: tokens + primitives
packages/shared       Order state machine, money utils (shared FE/BE)
packages/api-client   Orval-generated hooks + models (never hand-edited)
packages/types        Shared type surface
PLAN.md               Architecture guardrails
```
