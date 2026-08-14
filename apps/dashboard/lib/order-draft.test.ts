import { describe, it, expect } from 'vitest';
import { computeDraftTotalCents, isDraftValid, toOrderItems, type DraftLine } from './order-draft';

const prices = new Map([
  ['a', 500],
  ['b', 1650],
]);

describe('computeDraftTotalCents', () => {
  it('sums price × quantity across lines', () => {
    const lines: DraftLine[] = [
      { menuItemId: 'a', quantity: 2 },
      { menuItemId: 'b', quantity: 1 },
    ];
    expect(computeDraftTotalCents(lines, prices)).toBe(500 * 2 + 1650);
  });

  it('ignores unknown items and non-positive quantities', () => {
    expect(
      computeDraftTotalCents(
        [
          { menuItemId: 'x', quantity: 3 },
          { menuItemId: 'a', quantity: -1 },
        ],
        prices,
      ),
    ).toBe(0);
  });
});

describe('isDraftValid', () => {
  it('requires a customer and at least one complete line', () => {
    expect(isDraftValid('', [{ menuItemId: 'a', quantity: 1 }])).toBe(false);
    expect(isDraftValid('c1', [])).toBe(false);
    expect(isDraftValid('c1', [{ menuItemId: '', quantity: 1 }])).toBe(false);
    expect(isDraftValid('c1', [{ menuItemId: 'a', quantity: 0 }])).toBe(false);
    expect(isDraftValid('c1', [{ menuItemId: 'a', quantity: 1 }])).toBe(true);
  });
});

describe('toOrderItems', () => {
  it('drops incomplete lines before submit', () => {
    expect(
      toOrderItems([
        { menuItemId: 'a', quantity: 1 },
        { menuItemId: '', quantity: 2 },
        { menuItemId: 'b', quantity: 0 },
      ]),
    ).toEqual([{ menuItemId: 'a', quantity: 1 }]);
  });
});
