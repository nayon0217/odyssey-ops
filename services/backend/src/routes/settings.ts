import { createRoute } from '@hono/zod-openapi';
import { eq } from 'drizzle-orm';
import { createDb } from '../db/client';
import { settings } from '../db/schema';
import { settingsSelectSchema, settingsUpdateSchema } from '../db/zod-schemas';
import { createRouter } from '../lib/openapi';
import { getSettings } from '../services/settings';

const router = createRouter();

router.openapi(
  createRoute({
    method: 'get',
    path: '/settings',
    operationId: 'getSettings',
    tags: ['Settings'],
    summary: 'Get ordering settings',
    responses: {
      200: {
        description: 'Settings',
        content: { 'application/json': { schema: settingsSelectSchema } },
      },
    },
  }),
  async (c) => {
    const db = createDb(c.env.HYPERDRIVE.connectionString);
    return c.json(await getSettings(db), 200);
  },
);

router.openapi(
  createRoute({
    method: 'patch',
    path: '/settings',
    operationId: 'updateSettings',
    tags: ['Settings'],
    summary: 'Update ordering settings',
    request: {
      body: { content: { 'application/json': { schema: settingsUpdateSchema } }, required: true },
    },
    responses: {
      200: {
        description: 'Updated settings',
        content: { 'application/json': { schema: settingsSelectSchema } },
      },
      422: { description: 'Invalid payload' },
    },
  }),
  async (c) => {
    const db = createDb(c.env.HYPERDRIVE.connectionString);
    const body = c.req.valid('json');
    const current = await getSettings(db);
    const [row] = await db
      .update(settings)
      .set({ ...body, updatedAt: new Date().toISOString() })
      .where(eq(settings.id, current.id))
      .returning();
    return c.json(row ?? current, 200);
  },
);

export default router;
