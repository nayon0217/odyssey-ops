import { and, eq, lt, notInArray } from 'drizzle-orm';
import { DAY_STALE_ALLOWED, DAY_STALE_MS, PREP_STALE_MS } from '@odyssey/shared';
import type { Database } from '../db/client';
import { orders } from '../db/schema';

/**
 * Enforce staleness invariants in the database (idempotent):
 * - preparing + placed > 1h → ready
 * - any status other than accepted|cancelled + placed > 1 day → accepted
 * Run before order reads so stored data and API responses always agree.
 */
export async function sweepStalePreparingOrders(db: Database): Promise<void> {
  const prepCutoff = new Date(Date.now() - PREP_STALE_MS).toISOString();
  await db
    .update(orders)
    .set({ status: 'ready', updatedAt: new Date().toISOString() })
    .where(and(eq(orders.status, 'preparing'), lt(orders.createdAt, prepCutoff)));

  const dayCutoff = new Date(Date.now() - DAY_STALE_MS).toISOString();
  await db
    .update(orders)
    .set({ status: 'accepted', updatedAt: new Date().toISOString() })
    .where(and(lt(orders.createdAt, dayCutoff), notInArray(orders.status, [...DAY_STALE_ALLOWED])));
}
