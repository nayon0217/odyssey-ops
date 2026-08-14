# Odyssey Ops — Architecture Guardrails

This document is the source of truth for **how** this repo is built. It is pasted into every AI
session as context and doubles as the "how I used AI" writeup. If code and this document disagree,
the code is wrong.

## The one flow that matters

Persisted truth starts in the Drizzle schema and flows outward. Types and API contracts are
**generated, never hand-duplicated**:

```
Drizzle schema  ─drizzle-zod─▶  Zod schemas  ─@hono/zod-openapi─▶  OpenAPI doc
                                                                        │
                                                                        ▼
        generated React Query hooks + models  ◀──Orval──  services/backend/openapi.json
                        │
                        ▼
        apps/dashboard imports ONLY generated hooks/types
```

Command: `pnpm gen:contract` = backend emits `services/backend/openapi.json` (from the live app
instance, no server needed) → Orval regenerates `packages/api-client/src/generated`.

## Repo map

| Path | Role |
|------|------|
| `services/backend` | Hono `OpenAPIHono` on Cloudflare Workers. Owns the schema + all business logic. |
| `apps/dashboard` | Expo Router (React Native + Web). Presentational; data via generated hooks. |
| `packages/types` | Shared enums/types, re-exported from the generated contract (single source). |
| `packages/api-client` | Orval output (hooks + models) + the shared fetch mutator. **Generated.** |
| `packages/ui` | Design system: centralized tokens + RN/RN-Web primitives + `/ui` style guide. |
| `packages/shared` | Framework-agnostic utils: money (integer cents), dates, order state machine. |

## Naming conventions

- **Database**: `snake_case` tables and columns. Drizzle `casing: 'snake_case'` maps camelCase TS
  fields to snake_case columns centrally — do not hand-write column names.
- **TypeScript**: `camelCase` values, `PascalCase` types/components.
- **Money**: always integer **cents** in the DB, in transit, and in logic. Format to currency only
  at the UI edge (via `packages/shared`).

## Never do this

- ❌ Hand-edit anything under `packages/api-client/src/generated/**`. Regenerate instead.
- ❌ Handwrite a frontend DTO/interface for backend data. Import the generated model.
- ❌ Duplicate an enum or status union across frontend and backend. It has exactly one origin: the
  Drizzle `pgEnum` → generated client.
- ❌ Use raw `fetch` as the app data pattern. Use generated React Query hooks (they go through the
  shared mutator).
- ❌ Mutate order status as a loose client-controlled field write. Status changes go through the
  backend transition endpoint, which enforces the state machine.
- ❌ Put business logic in screen/page components. Logic lives in backend services and hooks.
- ❌ Scatter design values. Colors/spacing/type/radius/shadow come from `packages/ui` tokens.
- ❌ Use an emoji (or a Unicode glyph like `✓`) as a UI icon. Icons come from the `Icon` primitive.

## Order status state machine (enforced server-side)

```
pending   ─▶ accepted | cancelled
accepted  ─▶ preparing | cancelled
preparing ─▶ ready | cancelled
ready     ─▶ completed
terminal: completed, cancelled
```

The transition map lives once in `packages/shared` and is enforced by the backend order service.
The dashboard renders action buttons from `getAvailableActionsForOrder` (state machine + day-staleness)
— it never hardcodes them.

## Order staleness invariant

Two rules, single-sourced in `packages/shared` (`effectiveOrderStatus`):

1. An order placed **more than an hour ago can never still be "preparing"** — by then it
   must be at least "ready" (`PREP_STALE_MS`).
2. An order placed **more than a day ago must be "accepted" or "cancelled"** — any other
   status collapses to "accepted" (`DAY_STALE_MS`).

The backend enforces both as **data truth** via `sweepStalePreparingOrders`, run before
every order read (list, detail, home summary, customer detail) so the stored status and
every API response agree. Transitions that would leave a day-old order outside
accepted|cancelled are rejected with `409`. The seed applies the same rules and
**asserts** the invariant before finishing.

## Styling decision

**Centralized TS token module + React Native `StyleSheet`**, not NativeWind. Every component
imports the one `tokens` object (`packages/ui/src/tokens`); no component inlines a hex, raw pixel,
or font size. Rationale: cleanest "tokens are centralized" story, identical code on web and native,
zero extra build/babel config, and full control over the design system the assignment is graded on.
A single light theme ships; the token structure is semantic so a second theme is a values-only
change (a documented, deliberate cut for the timebox).

**Visual identity (pastel redesign).** The palette is a pastel restaurant-SaaS register — lilac-gray
canvas, periwinkle primary, soft status tints — but the semantic **structure is unchanged from the
original blue theme**, so the intent behind every status/interactive token still holds; only the
values moved. Brand faces are a display/body pairing — **Outfit** (display/KPIs/headings)
+ **Plus Jakarta Sans** (body/UI; web-loaded via `WebFonts` / `+html.tsx`). KPIs use a
big-number `stat`/`statSm` type variant with **tabular figures** so the headline metrics grab
attention and stay column-aligned.

**Icons.** A single `Icon` primitive in `@odyssey/ui` (backed by `react-native-svg`, works web +
native) renders illustrated line icons — **no emoji anywhere in the UI**. Geometry is Lucide
(ISC-licensed, 24×24, round strokes); each glyph inherits stroke/fill from its `<Svg>` so one
`color` prop tints it. Icons are a design-system primitive (centralized), never scattered per-page.

## Local infra decisions

- **Postgres**: Docker Compose (`docker-compose.yml`), host port **5433** (5432 was taken locally).
  Reviewer needs only Docker.
- **Worker → Postgres**: Cloudflare **Hyperdrive** binding + `drizzle-orm/node-postgres` (`pg`),
  `nodejs_compat`. Local dev uses the Hyperdrive `localConnectionString`; migrations/seed use
  `DATABASE_URL` directly.

## Stack (fixed — do not substitute)

pnpm workspace + Turborepo · Expo (RN + Web) · Hono on Cloudflare Workers · PostgreSQL + Drizzle ·
drizzle-zod · OpenAPI · Orval · React Query. No Next.js / NestJS / Prisma / tRPC / Supabase /
Firebase / handwritten frontend API types. (Icons: `react-native-svg` — Expo-supported, web +
native — behind the `Icon` primitive; the only rendering dependency added for the design system.)

## How AI is being used on this project

- This guardrail doc is the steering context handed to the model each session.
- Work proceeds in verifiable phases (see git: Phase 0 → 6, then gap-close / redesign commits)
  — each step ends with a check that passes before the next begins.
- Generated artifacts are trusted only after the pipeline is proven end-to-end against a real DB.
- Output is reviewed against the "Never do this" list; the contract discipline is the point.
- Longer architecture / tradeoff notes for reviewers live in `README.md`.
