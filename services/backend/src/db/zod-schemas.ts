import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { ORDER_ACTIONS, ORDER_STATUSES } from '@odyssey/shared';
import { menuCategories, menuItems, customers, orders, orderItems, settings } from './schema';

// ── Shared error envelope (matches the defaultHook + error helpers) ───────────
export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

// ── Menu categories ────────────────────────────────────────────────────────
export const menuCategorySelectSchema = createSelectSchema(menuCategories);
export const menuCategoryInsertSchema = createInsertSchema(menuCategories, {
  name: (schema) => schema.min(1, 'Name is required'),
}).omit({ id: true, createdAt: true, updatedAt: true });

// ── Menu items ──────────────────────────────────────────────────────────────
export const menuItemSelectSchema = createSelectSchema(menuItems);
export const menuItemInsertSchema = createInsertSchema(menuItems, {
  name: (schema) => schema.min(1, 'Name is required'),
  priceCents: (schema) => schema.int().nonnegative('Price must be zero or more'),
}).omit({ id: true, createdAt: true, updatedAt: true });
export const menuItemUpdateSchema = menuItemInsertSchema.partial();

// ── Customers ─────────────────────────────────────────────────────────────
export const customerSelectSchema = createSelectSchema(customers);
export const customerInsertSchema = createInsertSchema(customers, {
  name: (schema) => schema.min(1, 'Name is required'),
}).omit({ id: true, createdAt: true });

// ── Orders ──────────────────────────────────────────────────────────────────
export const orderSelectSchema = createSelectSchema(orders);
export const orderItemSelectSchema = createSelectSchema(orderItems);

/** An order row with its customer's name joined in — used by list + summary views. */
export const orderListItemSchema = orderSelectSchema.extend({
  customerName: z.string().nullable(),
});

/** Full order detail with line items and customer. */
export const orderWithItemsSchema = orderSelectSchema.extend({
  customer: customerSelectSchema.nullable(),
  items: z.array(orderItemSelectSchema),
});

// ── Settings ──────────────────────────────────────────────────────────────
const timeHHMM = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use 24-hour time HH:mm (e.g. 09:00)');

export const settingsSelectSchema = createSelectSchema(settings);
export const settingsUpdateSchema = createInsertSchema(settings, {
  prepTimeMinutes: (schema) => schema.int().min(0).max(480),
  openingTime: () => timeHHMM,
  closingTime: () => timeHHMM,
})
  .omit({ id: true, updatedAt: true })
  .partial()
  .superRefine((value, ctx) => {
    if (value.openingTime === undefined || value.closingTime === undefined) return;
    const [oh, om] = value.openingTime.split(':').map(Number);
    const [ch, cm] = value.closingTime.split(':').map(Number);
    const open = oh! * 60 + om!;
    const close = ch! * 60 + cm!;
    if (close <= open) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['closingTime'],
        message: 'Closing time must be after opening time',
      });
    }
  });

// ── Request bodies (not directly table-derived) ──────────────────────────────
export const createOrderSchema = z.object({
  customerId: z.string().uuid(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, 'An order needs at least one item'),
  notes: z.string().optional(),
});

export const transitionOrderSchema = z.object({
  action: z.enum(ORDER_ACTIONS),
});

export const orderStatusFilterSchema = z.enum(ORDER_STATUSES);

// ── Aggregate / composite response shapes ─────────────────────────────────────
export const customerWithStatsSchema = customerSelectSchema.extend({
  orderCount: z.number().int(),
  totalSpentCents: z.number().int(),
});

export const customerDetailSchema = customerWithStatsSchema.extend({
  recentOrders: z.array(orderSelectSchema),
});

export const homeSummarySchema = z.object({
  totalOrders: z.number().int(),
  revenueCents: z.number().int(),
  pendingOrders: z.number().int(),
  popularItems: z.array(
    z.object({
      menuItemId: z.string(),
      name: z.string(),
      quantity: z.number().int(),
    }),
  ),
  recentOrders: z.array(orderListItemSchema),
});
