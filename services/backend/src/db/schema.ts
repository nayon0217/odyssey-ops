import { relations } from 'drizzle-orm';
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';

// Timestamps use mode:'string' so the generated contract types them as strings —
// matching what actually crosses the wire as JSON (no Date/string mismatch).
const createdAt = () =>
  timestamp({ withTimezone: true, mode: 'string' }).notNull().defaultNow();
const updatedAt = () =>
  timestamp({ withTimezone: true, mode: 'string' }).notNull().defaultNow();

// Single source of truth for order status. Mirrored (values only) by the state
// machine in @odyssey/shared, which both backend and frontend import.
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'accepted',
  'preparing',
  'ready',
  'completed',
  'cancelled',
]);

export const menuCategories = pgTable('menu_categories', {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  sortOrder: integer().notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const menuItems = pgTable('menu_items', {
  id: uuid().defaultRandom().primaryKey(),
  categoryId: uuid()
    .notNull()
    .references(() => menuCategories.id, { onDelete: 'cascade' }),
  name: text().notNull(),
  description: text(),
  priceCents: integer().notNull(),
  isAvailable: boolean().notNull().default(true),
  sortOrder: integer().notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const customers = pgTable('customers', {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  email: text(),
  phone: text(),
  createdAt: createdAt(),
});

export const orders = pgTable('orders', {
  id: uuid().defaultRandom().primaryKey(),
  orderNumber: integer().generatedByDefaultAsIdentity({ startWith: 1001 }),
  customerId: uuid()
    .notNull()
    .references(() => customers.id),
  status: orderStatusEnum().notNull().default('pending'),
  // Server-computed at creation from live prices; never trusted from the client.
  totalCents: integer().notNull(),
  notes: text(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const orderItems = pgTable('order_items', {
  id: uuid().defaultRandom().primaryKey(),
  orderId: uuid()
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  menuItemId: uuid()
    .notNull()
    .references(() => menuItems.id),
  // Snapshotted so historical orders reflect what the customer was actually charged,
  // not today's menu price. Never recompute an existing order's total from live prices.
  nameSnapshot: text().notNull(),
  unitPriceCentsSnapshot: integer().notNull(),
  quantity: integer().notNull(),
});

// Singleton row of ordering-related business settings.
export const settings = pgTable('settings', {
  id: uuid().defaultRandom().primaryKey(),
  prepTimeMinutes: integer().notNull().default(15),
  autoAccept: boolean().notNull().default(false),
  isAcceptingOrders: boolean().notNull().default(true),
  openingTime: text().notNull().default('09:00'),
  closingTime: text().notNull().default('21:00'),
  updatedAt: updatedAt(),
});

export const menuCategoriesRelations = relations(menuCategories, ({ many }) => ({
  items: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  category: one(menuCategories, {
    fields: [menuItems.categoryId],
    references: [menuCategories.id],
  }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
}));
