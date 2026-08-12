import type { Context } from 'hono';
import { errorResponseSchema } from '../db/zod-schemas';

/** Reusable OpenAPI response entry for an error status, using the shared envelope. */
export function errorResponse(description: string) {
  return {
    description,
    content: { 'application/json': { schema: errorResponseSchema } },
  } as const;
}

// Typed helpers so handlers return the same `{ error: { code, message, details } }`
// envelope everywhere. `any`-typed context keeps these usable across route generics
// without fighting @hono/zod-openapi's per-route status unions.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function notFound(c: Context, message = 'Not found') {
  return c.json({ error: { code: 'NOT_FOUND', message } }, 404 as never);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function conflict(c: Context, message: string, details?: unknown) {
  return c.json({ error: { code: 'CONFLICT', message, details } }, 409 as never);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function unprocessable(c: Context, message: string, details?: unknown) {
  return c.json({ error: { code: 'UNPROCESSABLE_ENTITY', message, details } }, 422 as never);
}
