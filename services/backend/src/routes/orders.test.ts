import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { eq, inArray } from 'drizzle-orm';
import { createApp } from '../index';
import { createDb } from '../db/client';
import { menuCategories, menuItems, customers, orders, orderItems, settings } from '../db/schema';
import type { Env } from '../env';

// Integration tests against the local Docker Postgres (DATABASE_URL from .dev.vars).
// Fixtures are created + cleaned up so the suite is self-contained and re-runnable.
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL is required (run tests via `pnpm test`, DB up)');

const app = createApp();
const env = { HYPERDRIVE: { connectionString: DATABASE_URL } } as unknown as Env;
const db = createDb(DATABASE_URL);

let categoryId: string;
let availableItemId: string;
let unavailableItemId: string;
let customerId: string;
const createdOrderIds: string[] = [];

function post(path: string, body: unknown) {
  return app.request(
    path,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
    env,
  );
}

beforeAll(async () => {
  const [cat] = await db.insert(menuCategories).values({ name: '__test_cat__' }).returning();
  categoryId = cat!.id;
  const [avail] = await db
    .insert(menuItems)
    .values({ categoryId, name: '__test_avail__', priceCents: 500, isAvailable: true })
    .returning();
  const [unavail] = await db
    .insert(menuItems)
    .values({ categoryId, name: '__test_unavail__', priceCents: 700, isAvailable: false })
    .returning();
  availableItemId = avail!.id;
  unavailableItemId = unavail!.id;
  const [cust] = await db.insert(customers).values({ name: '__test_customer__' }).returning();
  customerId = cust!.id;

  // Deterministic ordering settings for the suite.
  await db.update(settings).set({ autoAccept: false, isAcceptingOrders: true });
});

afterAll(async () => {
  if (createdOrderIds.length) {
    await db.delete(orderItems).where(inArray(orderItems.orderId, createdOrderIds));
    await db.delete(orders).where(inArray(orders.id, createdOrderIds));
  }
  await db.delete(menuItems).where(inArray(menuItems.id, [availableItemId, unavailableItemId]));
  await db.delete(customers).where(eq(customers.id, customerId));
  await db.delete(menuCategories).where(eq(menuCategories.id, categoryId));
});

describe('POST /orders', () => {
  it('computes the total from DB prices, ignoring any client-sent total', async () => {
    const res = await post('/orders', {
      customerId,
      items: [{ menuItemId: availableItemId, quantity: 2 }],
      totalCents: 999999,
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { id: string; totalCents: number; status: string };
    createdOrderIds.push(body.id);
    expect(body.totalCents).toBe(1000); // 2 x 500, not the client's 999999
    expect(body.status).toBe('pending');
  });

  it('rejects an order containing an unavailable menu item (422)', async () => {
    const res = await post('/orders', {
      customerId,
      items: [{ menuItemId: unavailableItemId, quantity: 1 }],
    });
    expect(res.status).toBe(422);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('UNPROCESSABLE_ENTITY');
  });

  it('rejects a malformed payload with no items (422)', async () => {
    const res = await post('/orders', { customerId, items: [] });
    expect(res.status).toBe(422);
  });
});

describe('POST /orders/:id/transition', () => {
  it('advances via a valid action and rejects an invalid one (409)', async () => {
    const created = await post('/orders', {
      customerId,
      items: [{ menuItemId: availableItemId, quantity: 1 }],
    });
    const order = (await created.json()) as { id: string };
    createdOrderIds.push(order.id);

    const ok = await post(`/orders/${order.id}/transition`, { action: 'accept' });
    expect(ok.status).toBe(200);
    const accepted = (await ok.json()) as { status: string };
    expect(accepted.status).toBe('accepted');

    const bad = await post(`/orders/${order.id}/transition`, { action: 'complete' });
    expect(bad.status).toBe(409);
    const body = (await bad.json()) as { error: { details?: { availableActions?: string[] } } };
    expect(body.error.details?.availableActions).toContain('start_preparing');
  });
});

describe('staleness invariant', () => {
  it('normalizes a >1h-old "preparing" order to "ready" on read', async () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const [stale] = await db
      .insert(orders)
      .values({
        customerId,
        status: 'preparing',
        totalCents: 500,
        createdAt: twoHoursAgo,
        updatedAt: twoHoursAgo,
      })
      .returning();
    createdOrderIds.push(stale!.id);

    // Listing orders runs the sweep; the stale order must come back as "ready", never "preparing".
    const res = await app.request('/orders', {}, env);
    const list = (await res.json()) as { id: string; status: string }[];
    const found = list.find((o) => o.id === stale!.id);
    expect(found?.status).toBe('ready');
  });
});
