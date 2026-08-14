import { createRoute, z } from '@hono/zod-openapi';
import { eq } from 'drizzle-orm';
import { createDb } from '../db/client';
import { menuItems } from '../db/schema';
import { menuItemSelectSchema, menuItemInsertSchema, menuItemUpdateSchema } from '../db/zod-schemas';
import { createRouter } from '../lib/openapi';
import { notFound, errorResponse } from '../lib/errors';

const router = createRouter();

const idParam = z.object({ id: z.string().uuid() });

router.openapi(
  createRoute({
    method: 'get',
    path: '/menu-items',
    operationId: 'listMenuItems',
    tags: ['Menu'],
    summary: 'List menu items',
    request: { query: z.object({ categoryId: z.string().uuid().optional() }) },
    responses: {
      200: {
        description: 'Menu items',
        content: { 'application/json': { schema: z.array(menuItemSelectSchema) } },
      },
    },
  }),
  async (c) => {
    const db = createDb(c.env.HYPERDRIVE.connectionString);
    const { categoryId } = c.req.valid('query');
    const rows = await db
      .select()
      .from(menuItems)
      .where(categoryId ? eq(menuItems.categoryId, categoryId) : undefined)
      .orderBy(menuItems.categoryId, menuItems.sortOrder, menuItems.name, menuItems.id);
    return c.json(rows, 200);
  },
);

router.openapi(
  createRoute({
    method: 'post',
    path: '/menu-items',
    operationId: 'createMenuItem',
    tags: ['Menu'],
    summary: 'Create a menu item',
    request: {
      body: { content: { 'application/json': { schema: menuItemInsertSchema } }, required: true },
    },
    responses: {
      201: {
        description: 'Menu item created',
        content: { 'application/json': { schema: menuItemSelectSchema } },
      },
      422: { description: 'Invalid payload' },
    },
  }),
  async (c) => {
    const db = createDb(c.env.HYPERDRIVE.connectionString);
    const body = c.req.valid('json');
    const [row] = await db.insert(menuItems).values(body).returning();
    return c.json(row, 201);
  },
);

router.openapi(
  createRoute({
    method: 'patch',
    path: '/menu-items/{id}',
    operationId: 'updateMenuItem',
    tags: ['Menu'],
    summary: 'Update a menu item (price, name, availability, …)',
    request: {
      params: idParam,
      body: { content: { 'application/json': { schema: menuItemUpdateSchema } }, required: true },
    },
    responses: {
      200: {
        description: 'Menu item updated',
        content: { 'application/json': { schema: menuItemSelectSchema } },
      },
      404: errorResponse('Not found'),
      422: { description: 'Invalid payload' },
    },
  }),
  async (c) => {
    const db = createDb(c.env.HYPERDRIVE.connectionString);
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const [row] = await db
      .update(menuItems)
      .set({ ...body, updatedAt: new Date().toISOString() })
      .where(eq(menuItems.id, id))
      .returning();
    if (!row) return notFound(c, 'Menu item not found');
    return c.json(row, 200);
  },
);

export default router;
