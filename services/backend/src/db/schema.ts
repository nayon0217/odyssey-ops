import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';

// Phase 0: one trivial table to prove the Drizzle -> drizzle-zod -> OpenAPI -> Orval pipe.
// The full data model (menu items, customers, orders, settings) lands in Phase 1.
export const menuCategories = pgTable('menu_categories', {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  sortOrder: integer().notNull().default(0),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
