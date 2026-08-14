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

`pnpm db:seed` truncates and repopulates: **4 categories, 16 menu items, 20 customers, and 60
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
| `pnpm test` | Run backend + shared + UI test suites |

## Architecture decisions

**The contract flows one direction.** Persisted truth starts in the Drizzle schema
(`services/backend/src/db/schema.ts`). `drizzle-zod` derives the Zod schemas; `@hono/zod-openapi`
turns those into typed routes and an OpenAPI document; a small deterministic script
(`scripts/emit-openapi.ts`) writes `openapi.json` without booting a server; Orval turns that into
fully-typed React Query hooks in `@odyssey/api-client`. The dashboard imports **only** those
generated hooks and models — no page hand-writes a DTO, and the generated folder is never edited.
`pnpm gen:contract` runs the whole chain.

**Enums stay single-sourced.** The order-status **state machine** lives once in
`@odyssey/shared` (`order-status.ts`) and is imported by both the backend (to *enforce* transitions)
and the dashboard (to *render only the valid action buttons* for an order's current status). There
is exactly one definition of which transitions are legal, so the UI can never offer an illegal one
and the server rejects it if a stale client tries.

**Two deliberate modeling calls.** (1) `order_items` **snapshot** the item name and unit price at
purchase time, so a historical order always reflects what the customer was actually charged, never
today's menu price. (2) Order status changes go through a dedicated `POST /orders/:id/transition`
endpoint that runs the state machine — not a generic `PATCH status` field write — so invalid state
can never reach the database (it returns `409` with the allowed actions). Order **totals are always
computed server-side** from current prices; a client-sent total is ignored.

**A time-based domain invariant.** An order placed **more than an hour ago can never still be
"preparing"** — by then it must be prepared (at least "ready"). The rule is single-sourced in
`@odyssey/shared` (`effectiveOrderStatus`, threshold `PREP_STALE_MS`), enforced in the database by a
`sweepStalePreparingOrders` pass run before every order read (so the stored status and API responses
always agree), and applied in the seed so initial data is consistent.

**Styling.** A centralized TS **token module + React Native `StyleSheet`** (via `@odyssey/ui`),
not NativeWind — it gives the cleanest "tokens are centralized" story, identical code on web and
native, and zero extra build config. The visual identity is a **pastel** restaurant-SaaS register
(lilac-gray canvas, periwinkle primary, soft status tints) — the semantic token *structure* is
unchanged from the original blue theme, so the intent behind every token still holds; only the
values moved. Brand face is **Plus Jakarta Sans**; KPIs use a big-number `stat` type variant with
tabular figures. Icons are **illustrated line icons** via a single `Icon` primitive
(`react-native-svg`, Lucide geometry) — **no emoji in the UI**. Motion/interaction follow Apple's
fluid-interface guidance (instant press feedback, restraint, clear feedback states).

**Local infra.** Docker Compose Postgres + a Cloudflare **Hyperdrive** binding with
`drizzle-orm/node-postgres` (`nodejs_compat`). Local dev reaches Postgres through Hyperdrive's
`localConnectionString`; migrations/seed connect directly via `DATABASE_URL`.

## Tradeoffs and incomplete areas

- **Native parity**: built and verified for **web only**. React Native primitives are used
  throughout so native is plausible, but iOS/Android simulators were not verified — called out as a
  bonus, not a requirement, in the brief.
- **Dark mode**: the token system is semantic and could support a dark theme, but only a single
  light theme is shipped. Deliberate cut for the timebox.
- **Pagination**: Orders and CRM load all rows for the seeded dataset. A production build would
  paginate API + list UI; I prioritized depth on the order flow instead.
- **Auth**: no login/session layer — out of scope for the evaluation, but a real deployment would
  need it before exposing the backend.
- **Settings depth**: service availability, auto-accept, prep time, and opening/closing hours are
  wired end to end; anything beyond that was cut in favor of depth on Orders and Menu.
- **Test coverage**: targeted, not exhaustive (per the brief) — backend order/transition rules,
  the shared state machine + money utils, and key UI states (Button, StatusBadge).

## AI usage notes

- **Guardrails first.** `PLAN.md` at the repo root is a guardrail doc (contract flow, naming,
  a "never do this" list, the state machine) written up front and fed as context throughout, so
  generated code stayed inside the intended architecture.
- **Verifiable phases, not one big generation.** Each phase ended with a real check that had to pass
  before the next — a curl against the live route, a browser screenshot of the actual page, a green
  test — rather than trusting output at face value.
- **Steering / rejecting output.** A few concrete examples: the order-creation path was kept
  server-authoritative (client-sent totals ignored) by design; the DB layer was chosen as Docker +
  Hyperdrive over the Neon driver a first draft assumed, to keep review Docker-only and match the CF
  stack; and several react-native-web bugs in AI-generated overlays were caught by driving the real
  page — nested `<button>` backdrops, `useNativeDriver` silently no-op'ing on web, and modals
  trapped inside a scroll container — then fixed at the component level.
- **Parallel subagents** built independent slices (design-system primitive clusters; the Home and
  CRM pages) against a stable, already-verified foundation, and each result was integrated and
  type-checked on the main thread rather than trusted blind.

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
