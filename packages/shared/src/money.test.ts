import { describe, it, expect } from 'vitest';
import { formatMoney, parseMoneyToCents } from './money';

describe('formatMoney', () => {
  it('formats integer cents as USD', () => {
    expect(formatMoney(0)).toBe('$0.00');
    expect(formatMoney(500)).toBe('$5.00');
    expect(formatMoney(1650)).toBe('$16.50');
    expect(formatMoney(103000)).toBe('$1,030.00');
  });
});

describe('parseMoneyToCents', () => {
  it('parses dollar strings into integer cents', () => {
    expect(parseMoneyToCents('5')).toBe(500);
    expect(parseMoneyToCents('16.50')).toBe(1650);
    expect(parseMoneyToCents('$12.34')).toBe(1234);
    expect(parseMoneyToCents('')).toBe(0);
    expect(parseMoneyToCents('abc')).toBe(0);
  });

  it('round-trips with formatMoney', () => {
    for (const cents of [0, 500, 1650, 99900]) {
      expect(parseMoneyToCents(formatMoney(cents))).toBe(cents);
    }
  });
});
