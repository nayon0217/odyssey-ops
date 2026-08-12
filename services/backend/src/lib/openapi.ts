import { OpenAPIHono } from '@hono/zod-openapi';
import type { Hook } from '@hono/zod-openapi';
import type { Env } from '../env';

/** Hono environment shape shared by the app and every feature router. */
export type AppEnv = { Bindings: Env };

/**
 * Shared validation hook: every route returns the same typed error envelope
 * `{ error: { code, message, details } }` with 422 on invalid input, instead of
 * each OpenAPIHono instance falling back to its own raw ZodError/400.
 */
export const defaultHook: Hook<unknown, AppEnv, string, unknown> = (result, c) => {
  if (!result.success) {
    return c.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: result.error.flatten(),
        },
      },
      422,
    );
  }
};

/** Create an OpenAPIHono router that shares the app's bindings and error contract. */
export function createRouter() {
  return new OpenAPIHono<AppEnv>({ defaultHook });
}
