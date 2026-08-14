// Pure helpers for the "new order" draft. Kept out of the component so the total
// preview and validation are unit-testable without React.

export type DraftLine = { menuItemId: string; quantity: number };

/** Client-side total preview (cents). The server recomputes authoritatively on submit. */
export function computeDraftTotalCents(
  lines: DraftLine[],
  priceByItemId: Map<string, number>,
): number {
  return lines.reduce(
    (sum, line) => sum + (priceByItemId.get(line.menuItemId) ?? 0) * Math.max(0, line.quantity),
    0,
  );
}

/** A draft is submittable when it has a customer name and at least one complete line. */
export function isDraftValid(customerName: string, lines: DraftLine[]): boolean {
  return (
    Boolean(customerName.trim()) &&
    lines.length > 0 &&
    lines.every((line) => Boolean(line.menuItemId) && line.quantity > 0)
  );
}

/** Drop incomplete lines before sending to the API. */
export function toOrderItems(lines: DraftLine[]): DraftLine[] {
  return lines.filter((line) => Boolean(line.menuItemId) && line.quantity > 0);
}

/** Case-insensitive exact name match against known customers. */
export function findCustomerByName<T extends { id: string; name: string }>(
  customers: T[],
  rawName: string,
): T | undefined {
  const needle = rawName.trim().toLowerCase();
  if (!needle) return undefined;
  return customers.find((c) => c.name.trim().toLowerCase() === needle);
}
