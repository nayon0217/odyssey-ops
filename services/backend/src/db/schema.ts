import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Phase 1 walking skeleton: menu_categories proves the full
// Drizzle -> drizzle-zod -> OpenAPI -> Orval -> generated hook -> screen pipeline.
// The full data model (menu items, customers, orders, settings) lands in Phase 2.
//
// Timestamps use mode:'string' so the contract types them as ISO strings — matching
// what actually crosses the wire as JSON (no Date/string mismatch downstream).
export const menuCategories = pgTable('menu_categories', {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  sortOrder: integer().notNull().default(0),
  createdAt: timestamp({ withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true, mode: 'string' }).notNull().defaultNow(),
});

// drizzle-zod derives the Zod schemas from the table — the single source of truth for
// a category's shape. Nothing downstream redeclares this by hand.
export const menuCategorySelectSchema = createSelectSchema(menuCategories);

export const menuCategoryInsertSchema = createInsertSchema(menuCategories, {
  name: (schema) => schema.min(1, 'Name is required'),
}).omit({ id: true, createdAt: true, updatedAt: true });
