import { inArray } from 'drizzle-orm';
import type { Database } from '../db/client';
import { menuItems, orders, orderItems } from '../db/schema';

/** Thrown when an order references a menu item that is missing or unavailable. */
export class UnavailableItemsError extends Error {
  constructor(public readonly itemIds: string[]) {
    super(`Menu items unavailable or missing: ${itemIds.join(', ')}`);
    this.name = 'UnavailableItemsError';
  }
}

export type CreateOrderInput = {
  customerId: string;
  items: { menuItemId: string; quantity: number }[];
  notes?: string;
};

/**
 * Create an order with server-computed totals.
 *
 * - Totals are ALWAYS recomputed from current menu prices; any client-sent total
 *   is irrelevant (the endpoint never accepts one).
 * - The whole order is rejected if any line references a missing or unavailable item
 *   (never a partial success).
 * - Prices/names are snapshotted onto order_items for historical integrity.
 */
export async function createOrder(db: Database, input: CreateOrderInput) {
  const ids = input.items.map((line) => line.menuItemId);
  const found = await db.select().from(menuItems).where(inArray(menuItems.id, ids));

  const missing = ids.filter((id) => !found.some((item) => item.id === id));
  const unavailable = found.filter((item) => !item.isAvailable).map((item) => item.id);
  if (missing.length || unavailable.length) {
    throw new UnavailableItemsError([...new Set([...missing, ...unavailable])]);
  }

  const lines = input.items.map((line) => {
    const item = found.find((i) => i.id === line.menuItemId)!;
    return { item, quantity: line.quantity, subtotal: item.priceCents * line.quantity };
  });
  const totalCents = lines.reduce((sum, line) => sum + line.subtotal, 0);

  return db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({ customerId: input.customerId, totalCents, notes: input.notes ?? null })
      .returning();
    if (!order) throw new Error('Failed to create order');

    await tx.insert(orderItems).values(
      lines.map(({ item, quantity }) => ({
        orderId: order.id,
        menuItemId: item.id,
        nameSnapshot: item.name,
        unitPriceCentsSnapshot: item.priceCents,
        quantity,
      })),
    );

    return order;
  });
}
