import { describe, it, expect } from 'vitest';
import {
  computeDraftTotalCents,
  findCustomerByName,
  isDraftValid,
  toOrderItems,
  type DraftLine,
} from './order-draft';

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
  it('requires a customer name and at least one complete line', () => {
    expect(isDraftValid('', [{ menuItemId: 'a', quantity: 1 }])).toBe(false);
    expect(isDraftValid('  ', [{ menuItemId: 'a', quantity: 1 }])).toBe(false);
    expect(isDraftValid('Ava', [])).toBe(false);
    expect(isDraftValid('Ava', [{ menuItemId: '', quantity: 1 }])).toBe(false);
    expect(isDraftValid('Ava', [{ menuItemId: 'a', quantity: 0 }])).toBe(false);
    expect(isDraftValid('Ava', [{ menuItemId: 'a', quantity: 1 }])).toBe(true);
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

describe('findCustomerByName', () => {
  const customers = [
    { id: '1', name: 'Ava Thompson' },
    { id: '2', name: 'Liam Chen' },
  ];

  it('matches existing customers case-insensitively', () => {
    expect(findCustomerByName(customers, '  ava thompson ')?.id).toBe('1');
    expect(findCustomerByName(customers, 'LIAM CHEN')?.id).toBe('2');
  });

  it('returns undefined when no exact name match', () => {
    expect(findCustomerByName(customers, 'Ava')).toBeUndefined();
    expect(findCustomerByName(customers, '')).toBeUndefined();
  });
});
