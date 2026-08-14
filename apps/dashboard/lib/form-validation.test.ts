import { describe, expect, it } from 'vitest';
import {
  isValidTimeHHMM,
  parsePriceInput,
  validateCategoryName,
  validateMenuItemForm,
  validateSettingsForm,
} from './form-validation';

describe('isValidTimeHHMM', () => {
  it('accepts 24h HH:mm', () => {
    expect(isValidTimeHHMM('09:00')).toBe(true);
    expect(isValidTimeHHMM('21:30')).toBe(true);
    expect(isValidTimeHHMM('00:00')).toBe(true);
    expect(isValidTimeHHMM('23:59')).toBe(true);
  });

  it('rejects malformed times', () => {
    expect(isValidTimeHHMM('09:04444')).toBe(false);
    expect(isValidTimeHHMM('9:00')).toBe(false);
    expect(isValidTimeHHMM('25:00')).toBe(false);
    expect(isValidTimeHHMM('12:60')).toBe(false);
    expect(isValidTimeHHMM('')).toBe(false);
  });
});

describe('validateSettingsForm', () => {
  it('passes a valid form', () => {
    expect(
      validateSettingsForm({
        prepTimeMinutes: '15',
        openingTime: '09:00',
        closingTime: '21:00',
      }),
    ).toEqual({});
  });

  it('flags bad prep time and hours', () => {
    const errors = validateSettingsForm({
      prepTimeMinutes: '',
      openingTime: '09:04444',
      closingTime: '21:00',
    });
    expect(errors.prepTimeMinutes).toBeTruthy();
    expect(errors.openingTime).toBeTruthy();
  });

  it('requires closing after opening', () => {
    const errors = validateSettingsForm({
      prepTimeMinutes: '15',
      openingTime: '21:00',
      closingTime: '09:00',
    });
    expect(errors.closingTime).toMatch(/after opening/i);
  });
});

describe('parsePriceInput / validateMenuItemForm', () => {
  it('parses currency-ish prices', () => {
    expect(parsePriceInput('12.50')).toEqual({ cents: 1250 });
    expect(parsePriceInput('$3')).toEqual({ cents: 300 });
  });

  it('rejects invalid prices and empty name/category', () => {
    expect(parsePriceInput('12.555')).toMatchObject({ error: expect.any(String) });
    const errors = validateMenuItemForm({ name: '  ', price: 'abc', categoryId: '' });
    expect(errors.name).toBeTruthy();
    expect(errors.price).toBeTruthy();
    expect(errors.categoryId).toBeTruthy();
  });
});

describe('validateCategoryName', () => {
  it('requires a non-empty name', () => {
    expect(validateCategoryName('')).toBeTruthy();
    expect(validateCategoryName('  Starters ')).toBeUndefined();
  });
});
