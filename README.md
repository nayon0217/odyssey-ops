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

Developed in phases (contract → domain → UI → pages → tests). The API contract flows one way: Drizzle → drizzle-zod → OpenAPI → Orval; the dashboard imports only generated hooks/types. Order status lives once in @odyssey/shared and is enforced via POST /orders/:id/transition. Staleness rules (preparing >1h → ready; >1 day → accepted|cancelled) are swept on read and asserted in seed. The dashboard is presentational; @odyssey/ui uses centralized tokens + StyleSheet (not NativeWind). Local Postgres is Docker + Hyperdrive.

## Tradeoffs and incomplete areas

Verified for web only—RN primitives make native plausible, but simulators weren’t run. One light theme ships; dark mode is a values-only follow-up. Orders/CRM load the full seed set (no pagination).Settings cover availability, auto-accept, prep time, and hours—deeper ops config was cut. Day-old mid-flow orders collapsing to accepted is a simplified demo rule, not a full archive policy.


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
