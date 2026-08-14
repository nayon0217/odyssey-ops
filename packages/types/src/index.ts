// @odyssey/types — the canonical type surface for the app.
//
// Domain status/action types are single-sourced in @odyssey/shared; the request/response
// shapes are the Orval-generated models (which themselves derive from the Drizzle schema via
// drizzle-zod → OpenAPI). Re-exporting both from one place means app code imports every
// backend-shaped type from here and never re-declares one by hand.
export type { OrderStatus, OrderAction } from '@odyssey/shared';
export type * from '@odyssey/api-client';
