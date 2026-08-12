import { sql } from 'drizzle-orm';
import { ORDER_STATUSES } from '@odyssey/shared';
import { createDb } from './client';
import { menuCategories, menuItems, customers, orders, orderItems, settings } from './schema';

type SeedItem = { name: string; priceCents: number; isAvailable?: boolean };

const MENU: Record<string, SeedItem[]> = {
  Starters: [
    { name: 'Garlic Bread', priceCents: 650 },
    { name: 'Bruschetta', priceCents: 850 },
    { name: 'Soup of the Day', priceCents: 700 },
    { name: 'Crispy Calamari', priceCents: 1150, isAvailable: false },
  ],
  Mains: [
    { name: 'Margherita Pizza', priceCents: 1400 },
    { name: 'Spaghetti Carbonara', priceCents: 1650 },
    { name: 'Grilled Salmon', priceCents: 2200 },
    { name: 'Ribeye Steak', priceCents: 2900 },
    { name: 'Veggie Burger', priceCents: 1500 },
    { name: 'Chicken Alfredo', priceCents: 1750 },
  ],
  Desserts: [
    { name: 'Tiramisu', priceCents: 900 },
    { name: 'New York Cheesecake', priceCents: 950 },
    { name: 'Gelato Trio', priceCents: 800, isAvailable: false },
  ],
  Drinks: [
    { name: 'Espresso', priceCents: 350 },
    { name: 'Fresh Lemonade', priceCents: 500 },
    { name: 'House Red Wine', priceCents: 1100 },
  ],
};

const CUSTOMER_NAMES = [
  'Ava Thompson', 'Liam Chen', 'Sofia Rossi', 'Noah Patel', 'Emma Dubois',
  'Lucas Meyer', 'Mia Nakamura', 'Ethan Brooks', 'Olivia Santos', 'Mateo Silva',
  'Isla Novak', 'Aiden Park', 'Zoe Martin', 'Kai Andersen', 'Nora Haddad',
  'Leo Ferrari', 'Ruby Okafor', 'Finn Walsh', 'Chloe Kim', 'Diego Alvarez',
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set (use: pnpm db:seed)');
  const db = createDb(url);

  console.log('Truncating existing data…');
  await db.execute(
    sql`truncate table order_items, orders, menu_items, menu_categories, customers, settings restart identity cascade`,
  );

  console.log('Seeding categories + menu items…');
  const cats = await db
    .insert(menuCategories)
    .values(Object.keys(MENU).map((name, i) => ({ name, sortOrder: i })))
    .returning();

  const itemValues = cats.flatMap((cat) =>
    (MENU[cat.name] ?? []).map((item, i) => ({
      categoryId: cat.id,
      name: item.name,
      priceCents: item.priceCents,
      isAvailable: item.isAvailable ?? true,
      sortOrder: i,
    })),
  );
  const items = await db.insert(menuItems).values(itemValues).returning();
  const availableItems = items.filter((i) => i.isAvailable);

  console.log('Seeding customers…');
  const customerRows = await db
    .insert(customers)
    .values(
      CUSTOMER_NAMES.map((name, i) => ({
        name,
        email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`,
        phone: `+1-555-${String(1000 + i).padStart(4, '0')}`,
      })),
    )
    .returning();

  console.log('Seeding settings…');
  await db.insert(settings).values({});

  console.log('Seeding 60 orders across all statuses and ~30 days…');
  for (let i = 0; i < 60; i++) {
    const customer = customerRows[i % customerRows.length]!;
    const status = ORDER_STATUSES[i % ORDER_STATUSES.length]!;
    const createdAt = new Date(Date.now() - i * 12 * 60 * 60 * 1000).toISOString();

    // 1–3 available items, quantity 1–2 each.
    const lineCount = 1 + (i % 3);
    const lines = Array.from({ length: lineCount }, (_, k) => {
      const item = availableItems[(i + k) % availableItems.length]!;
      const quantity = 1 + ((i + k) % 2);
      return { item, quantity };
    });
    const totalCents = lines.reduce((sum, l) => sum + l.item.priceCents * l.quantity, 0);

    const [order] = await db
      .insert(orders)
      .values({ customerId: customer.id, status, totalCents, createdAt, updatedAt: createdAt })
      .returning();

    await db.insert(orderItems).values(
      lines.map(({ item, quantity }) => ({
        orderId: order!.id,
        menuItemId: item.id,
        nameSnapshot: item.name,
        unitPriceCentsSnapshot: item.priceCents,
        quantity,
      })),
    );
  }

  console.log(
    `Done: ${cats.length} categories, ${items.length} items, ${customerRows.length} customers, 60 orders.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
