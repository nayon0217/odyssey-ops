import { createRoute, z } from '@hono/zod-openapi';
import { sql, eq, desc } from 'drizzle-orm';
import { createDb } from '../db/client';
import { customers, orders } from '../db/schema';
import {
  customerSelectSchema,
  customerInsertSchema,
  customerWithStatsSchema,
  customerDetailSchema,
} from '../db/zod-schemas';
import { createRouter } from '../lib/openapi';
import { notFound, errorResponse } from '../lib/errors';

const router = createRouter();

// Spend counts every non-cancelled order (same basis as Home revenue), so figures
// reconcile with the Orders list filtered by a customer.
const spendExpr = sql<number>`coalesce(sum(case when ${orders.status} <> 'cancelled' then ${orders.totalCents} else 0 end), 0)::int`;
const orderCountExpr = sql<number>`count(${orders.id})::int`;

router.openapi(
  createRoute({
    method: 'get',
    path: '/customers',
    operationId: 'listCustomers',
    tags: ['Customers'],
    summary: 'List customers with order count and total spend',
    responses: {
      200: {
        description: 'Customers with stats',
        content: { 'application/json': { schema: z.array(customerWithStatsSchema) } },
      },
    },
  }),
  async (c) => {
    const db = createDb(c.env.HYPERDRIVE.connectionString);
    const rows = await db
      .select({
        id: customers.id,
        name: customers.name,
        email: customers.email,
        phone: customers.phone,
        createdAt: customers.createdAt,
        orderCount: orderCountExpr,
        totalSpentCents: spendExpr,
      })
      .from(customers)
      .leftJoin(orders, eq(orders.customerId, customers.id))
      .groupBy(customers.id)
      .orderBy(desc(spendExpr));
    return c.json(rows, 200);
  },
);

router.openapi(
  createRoute({
    method: 'post',
    path: '/customers',
    operationId: 'createCustomer',
    tags: ['Customers'],
    summary: 'Create a customer',
    request: {
      body: { content: { 'application/json': { schema: customerInsertSchema } }, required: true },
    },
    responses: {
      201: {
        description: 'Customer created',
        content: { 'application/json': { schema: customerSelectSchema } },
      },
      422: { description: 'Invalid payload' },
    },
  }),
  async (c) => {
    const db = createDb(c.env.HYPERDRIVE.connectionString);
    const [row] = await db.insert(customers).values(c.req.valid('json')).returning();
    return c.json(row, 201);
  },
);

router.openapi(
  createRoute({
    method: 'get',
    path: '/customers/{id}',
    operationId: 'getCustomer',
    tags: ['Customers'],
    summary: 'Get a customer with stats and recent orders',
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: {
        description: 'Customer detail',
        content: { 'application/json': { schema: customerDetailSchema } },
      },
      404: errorResponse('Not found'),
    },
  }),
  async (c) => {
    const db = createDb(c.env.HYPERDRIVE.connectionString);
    const { id } = c.req.valid('param');

    const [row] = await db
      .select({
        id: customers.id,
        name: customers.name,
        email: customers.email,
        phone: customers.phone,
        createdAt: customers.createdAt,
        orderCount: orderCountExpr,
        totalSpentCents: spendExpr,
      })
      .from(customers)
      .leftJoin(orders, eq(orders.customerId, customers.id))
      .where(eq(customers.id, id))
      .groupBy(customers.id);

    if (!row) return notFound(c, 'Customer not found');

    const recentOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, id))
      .orderBy(desc(orders.createdAt))
      .limit(10);

    return c.json({ ...row, recentOrders }, 200);
  },
);

export default router;
