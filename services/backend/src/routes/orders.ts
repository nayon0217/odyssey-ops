import { createRoute, z } from '@hono/zod-openapi';
import { and, desc, eq, gte, lte, getTableColumns } from 'drizzle-orm';
import { applyAction, getAvailableActions, InvalidTransitionError } from '@odyssey/shared';
import { createDb } from '../db/client';
import { orders, customers, orderItems } from '../db/schema';
import {
  orderSelectSchema,
  orderListItemSchema,
  orderWithItemsSchema,
  createOrderSchema,
  transitionOrderSchema,
  orderStatusFilterSchema,
} from '../db/zod-schemas';
import { createRouter } from '../lib/openapi';
import { notFound, conflict, unprocessable, errorResponse } from '../lib/errors';
import { createOrder, UnavailableItemsError } from '../services/create-order';
import { getSettings } from '../services/settings';

const router = createRouter();

router.openapi(
  createRoute({
    method: 'get',
    path: '/orders',
    operationId: 'listOrders',
    tags: ['Orders'],
    summary: 'List orders with optional status / customer / date filters',
    request: {
      query: z.object({
        status: orderStatusFilterSchema.optional(),
        customerId: z.string().uuid().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
      }),
    },
    responses: {
      200: {
        description: 'Orders (most recent first)',
        content: { 'application/json': { schema: z.array(orderListItemSchema) } },
      },
    },
  }),
  async (c) => {
    const db = createDb(c.env.HYPERDRIVE.connectionString);
    const { status, customerId, from, to } = c.req.valid('query');

    const conditions = [
      status ? eq(orders.status, status) : undefined,
      customerId ? eq(orders.customerId, customerId) : undefined,
      from ? gte(orders.createdAt, from) : undefined,
      to ? lte(orders.createdAt, to) : undefined,
    ].filter(Boolean);

    const rows = await db
      .select({ ...getTableColumns(orders), customerName: customers.name })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(orders.createdAt));

    return c.json(rows, 200);
  },
);

router.openapi(
  createRoute({
    method: 'get',
    path: '/orders/{id}',
    operationId: 'getOrder',
    tags: ['Orders'],
    summary: 'Get full order detail with line items and customer',
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: {
        description: 'Order detail',
        content: { 'application/json': { schema: orderWithItemsSchema } },
      },
      404: errorResponse('Not found'),
    },
  }),
  async (c) => {
    const db = createDb(c.env.HYPERDRIVE.connectionString);
    const { id } = c.req.valid('param');

    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return notFound(c, 'Order not found');

    const [customer] = await db.select().from(customers).where(eq(customers.id, order.customerId));
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));

    return c.json({ ...order, customer: customer ?? null, items }, 200);
  },
);

router.openapi(
  createRoute({
    method: 'post',
    path: '/orders',
    operationId: 'createOrder',
    tags: ['Orders'],
    summary: 'Create an order (server computes totals, validates availability)',
    request: {
      body: { content: { 'application/json': { schema: createOrderSchema } }, required: true },
    },
    responses: {
      201: {
        description: 'Order created',
        content: { 'application/json': { schema: orderSelectSchema } },
      },
      404: errorResponse('Customer not found'),
      409: errorResponse('Not accepting orders'),
      422: errorResponse('Unavailable items or invalid payload'),
    },
  }),
  async (c) => {
    const db = createDb(c.env.HYPERDRIVE.connectionString);
    const body = c.req.valid('json');

    const settings = await getSettings(db);
    if (!settings.isAcceptingOrders) {
      return conflict(c, 'The business is not currently accepting orders');
    }

    const [customer] = await db.select().from(customers).where(eq(customers.id, body.customerId));
    if (!customer) return notFound(c, 'Customer not found');

    try {
      const order = await createOrder(db, body);
      if (settings.autoAccept) {
        const [updated] = await db
          .update(orders)
          .set({ status: 'accepted', updatedAt: new Date().toISOString() })
          .where(eq(orders.id, order.id))
          .returning();
        return c.json(updated ?? order, 201);
      }
      return c.json(order, 201);
    } catch (err) {
      if (err instanceof UnavailableItemsError) {
        return unprocessable(c, err.message, { itemIds: err.itemIds });
      }
      throw err;
    }
  },
);

router.openapi(
  createRoute({
    method: 'post',
    path: '/orders/{id}/transition',
    operationId: 'transitionOrder',
    tags: ['Orders'],
    summary: 'Advance an order through a valid status action',
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: { content: { 'application/json': { schema: transitionOrderSchema } }, required: true },
    },
    responses: {
      200: {
        description: 'Order updated',
        content: { 'application/json': { schema: orderSelectSchema } },
      },
      404: errorResponse('Not found'),
      409: errorResponse('Invalid transition for current status'),
      422: { description: 'Invalid payload' },
    },
  }),
  async (c) => {
    const db = createDb(c.env.HYPERDRIVE.connectionString);
    const { id } = c.req.valid('param');
    const { action } = c.req.valid('json');

    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return notFound(c, 'Order not found');

    try {
      const nextStatus = applyAction(order.status, action);
      const [updated] = await db
        .update(orders)
        .set({ status: nextStatus, updatedAt: new Date().toISOString() })
        .where(eq(orders.id, id))
        .returning();
      return c.json(updated ?? order, 200);
    } catch (err) {
      if (err instanceof InvalidTransitionError) {
        return conflict(c, err.message, {
          currentStatus: order.status,
          action,
          availableActions: getAvailableActions(order.status),
        });
      }
      throw err;
    }
  },
);

export default router;
