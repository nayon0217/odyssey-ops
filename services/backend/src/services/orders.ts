import { and, eq, lt } from 'drizzle-orm';
import { PREP_STALE_MS } from '@odyssey/shared';
import type { Database } from '../db/client';
import { orders } from '../db/schema';

/**
 * Enforce the staleness invariant in the database: an order placed more than an hour
 * ago can never still be "preparing" — it is bumped to "ready". Idempotent (after the
 * first run it matches no rows), and run before order reads so the stored data and every
 * API response agree (a status filter and the returned status never disagree).
 */
export async function sweepStalePreparingOrders(db: Database): Promise<void> {
  const cutoff = new Date(Date.now() - PREP_STALE_MS).toISOString();
  await db
    .update(orders)
    .set({ status: 'ready', updatedAt: new Date().toISOString() })
    .where(and(eq(orders.status, 'preparing'), lt(orders.createdAt, cutoff)));
}
