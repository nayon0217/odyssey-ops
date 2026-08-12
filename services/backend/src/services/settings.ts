import type { Database } from '../db/client';
import { settings } from '../db/schema';

/** Fetch the singleton settings row, creating it with defaults if absent. */
export async function getSettings(db: Database) {
  const [existing] = await db.select().from(settings).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(settings).values({}).returning();
  if (!created) throw new Error('Failed to initialize settings');
  return created;
}
