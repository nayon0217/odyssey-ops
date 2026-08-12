import { createRoute, z } from '@hono/zod-openapi';
import { createDb } from '../db/client';
import { menuCategories } from '../db/schema';
import { menuCategorySelectSchema, menuCategoryInsertSchema } from '../db/zod-schemas';
import { createRouter } from '../lib/openapi';

const router = createRouter();

const listRoute = createRoute({
  method: 'get',
  path: '/menu-categories',
  operationId: 'listMenuCategories',
  tags: ['Menu'],
  summary: 'List menu categories',
  responses: {
    200: {
      description: 'Menu categories, ordered by sort order',
      content: { 'application/json': { schema: z.array(menuCategorySelectSchema) } },
    },
  },
});

router.openapi(listRoute, async (c) => {
  const db = createDb(c.env.HYPERDRIVE.connectionString);
  const rows = await db.select().from(menuCategories).orderBy(menuCategories.sortOrder);
  return c.json(rows, 200);
});

const createCategoryRoute = createRoute({
  method: 'post',
  path: '/menu-categories',
  operationId: 'createMenuCategory',
  tags: ['Menu'],
  summary: 'Create a menu category',
  request: {
    body: {
      content: { 'application/json': { schema: menuCategoryInsertSchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: 'Category created',
      content: { 'application/json': { schema: menuCategorySelectSchema } },
    },
    422: { description: 'Invalid payload' },
  },
});

router.openapi(createCategoryRoute, async (c) => {
  const db = createDb(c.env.HYPERDRIVE.connectionString);
  const body = c.req.valid('json');
  const [row] = await db.insert(menuCategories).values(body).returning();
  return c.json(row, 201);
});

export default router;
