import { createRoute } from '@hono/zod-openapi';
import { sql, desc, eq, getTableColumns } from 'drizzle-orm';
import { createDb } from '../db/client';
import { orders, orderItems, customers } from '../db/schema';
import { homeSummarySchema } from '../db/zod-schemas';
import { createRouter } from '../lib/openapi';

const router = createRouter();

router.openapi(
  createRoute({
    method: 'get',
    path: '/home/summary',
    operationId: 'getHomeSummary',
    tags: ['Home'],
    summary: 'Dashboard KPIs: orders, revenue, pending, popular items, recent orders',
    responses: {
      200: {
        description: 'Home summary',
        content: { 'application/json': { schema: homeSummarySchema } },
      },
    },
  }),
  async (c) => {
    const db = createDb(c.env.HYPERDRIVE.connectionString);

    const [totals] = await db
      .select({
        totalOrders: sql<number>`count(*)::int`,
        revenueCents: sql<number>`coalesce(sum(case when ${orders.status} <> 'cancelled' then ${orders.totalCents} else 0 end), 0)::int`,
        pendingOrders: sql<number>`coalesce(sum(case when ${orders.status} = 'pending' then 1 else 0 end), 0)::int`,
      })
      .from(orders);

    const popularItems = await db
      .select({
        menuItemId: orderItems.menuItemId,
        name: sql<string>`max(${orderItems.nameSnapshot})`,
        quantity: sql<number>`sum(${orderItems.quantity})::int`,
      })
      .from(orderItems)
      .groupBy(orderItems.menuItemId)
      .orderBy(desc(sql`sum(${orderItems.quantity})`))
      .limit(5);

    const recentOrders = await db
      .select({ ...getTableColumns(orders), customerName: customers.name })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .orderBy(desc(orders.createdAt))
      .limit(8);

    return c.json(
      {
        totalOrders: totals?.totalOrders ?? 0,
        revenueCents: totals?.revenueCents ?? 0,
        pendingOrders: totals?.pendingOrders ?? 0,
        popularItems,
        recentOrders,
      },
      200,
    );
  },
);

export default router;
