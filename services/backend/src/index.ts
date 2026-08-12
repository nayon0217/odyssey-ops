import { cors } from 'hono/cors';
import { sql } from 'drizzle-orm';
import { createDb } from './db/client';
import { createRouter } from './lib/openapi';
import menuCategoriesRouter from './routes/menu-categories';

export function createApp() {
  const app = createRouter();

  app.use('*', cors());

  app.get('/', (c) => c.json({ name: 'Odyssey Ops API', status: 'ok' }));
  app.get('/health', (c) => c.json({ status: 'ok' }));

  // DB connectivity check through Hyperdrive -> Postgres (validates nodejs_compat + pg in workerd).
  app.get('/health/db', async (c) => {
    const db = createDb(c.env.HYPERDRIVE.connectionString);
    const rows = await db.execute(sql`select 1 as ok`);
    return c.json({ status: 'ok', db: rows.rows[0] });
  });

  // Feature routes.
  app.route('/', menuCategoriesRouter);

  // OpenAPI document (served live for humans; also emitted to file by gen:contract).
  app.doc('/openapi.json', {
    openapi: '3.0.0',
    info: {
      title: 'Odyssey Ops API',
      version: '0.1.0',
      description: 'Restaurant operations API — menu, orders, customers, settings, metrics.',
    },
  });

  return app;
}

const app = createApp();

export default app;
