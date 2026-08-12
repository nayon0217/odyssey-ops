import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export type Database = ReturnType<typeof createDb>;

/**
 * Create a Drizzle client backed by node-postgres.
 *
 * In the Worker we pass `env.HYPERDRIVE.connectionString` (Hyperdrive pools the
 * connection). In Node scripts (migrations, seed) we pass `DATABASE_URL` directly.
 */
export function createDb(connectionString: string) {
  const pool = new Pool({ connectionString, max: 5 });
  return drizzle(pool, { schema, casing: 'snake_case' });
}
