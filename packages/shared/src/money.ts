// Money is stored and computed in integer cents everywhere. Format only at the edge.

export function formatMoney(
  cents: number,
  opts: { currency?: string; locale?: string } = {},
): string {
  const { currency = 'USD', locale = 'en-US' } = opts;
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100);
}

/** Parse a currency-ish string (e.g. "12.50" or "$12.50") into integer cents. */
export function parseMoneyToCents(input: string): number {
  const cleaned = input.replace(/[^0-9.]/g, '');
  const value = Number.parseFloat(cleaned);
  if (Number.isNaN(value)) return 0;
  return Math.round(value * 100);
}
