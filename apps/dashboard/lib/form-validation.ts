/** Shared form validators for dashboard create/edit flows. */

const TIME_HH_MM = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** True for 24h clock strings like "09:00" or "21:30". */
export function isValidTimeHHMM(value: string): boolean {
  return TIME_HH_MM.test(value.trim());
}

/** Minutes since midnight for a valid HH:mm string; undefined if invalid. */
export function timeToMinutes(value: string): number | undefined {
  if (!isValidTimeHHMM(value)) return undefined;
  const [h, m] = value.trim().split(':').map(Number);
  return h! * 60 + m!;
}

export type SettingsFormErrors = {
  prepTimeMinutes?: string;
  openingTime?: string;
  closingTime?: string;
};

export function validateSettingsForm(form: {
  prepTimeMinutes: string;
  openingTime: string;
  closingTime: string;
}): SettingsFormErrors {
  const errors: SettingsFormErrors = {};
  const prep = form.prepTimeMinutes.trim();
  if (!prep) {
    errors.prepTimeMinutes = 'Prep time is required';
  } else {
    const n = Number(prep);
    if (!Number.isInteger(n) || n < 0 || n > 480) {
      errors.prepTimeMinutes = 'Enter a whole number between 0 and 480';
    }
  }

  if (!isValidTimeHHMM(form.openingTime)) {
    errors.openingTime = 'Use 24-hour time, e.g. 09:00';
  }
  if (!isValidTimeHHMM(form.closingTime)) {
    errors.closingTime = 'Use 24-hour time, e.g. 21:00';
  }

  const open = timeToMinutes(form.openingTime);
  const close = timeToMinutes(form.closingTime);
  if (open !== undefined && close !== undefined && close <= open) {
    errors.closingTime = 'Closing time must be after opening time';
  }

  return errors;
}

export type MenuItemFormErrors = {
  name?: string;
  price?: string;
  categoryId?: string;
};

/** Accepts "12.50", "$12.50", "12". Rejects empty, NaN, negative, or >2 decimal places. */
export function parsePriceInput(raw: string): { cents: number } | { error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { error: 'Price is required' };
  if (!/^\$?\d+(\.\d{1,2})?$/.test(trimmed)) {
    return { error: 'Enter a valid price, e.g. 12.50' };
  }
  const cents = Math.round(Number(trimmed.replace(/^\$/, '')) * 100);
  if (!Number.isFinite(cents) || cents < 0) return { error: 'Price must be zero or more' };
  if (cents > 1_000_000_00) return { error: 'Price is too large' };
  return { cents };
}

export function validateMenuItemForm(form: {
  name: string;
  price: string;
  categoryId: string;
}): MenuItemFormErrors {
  const errors: MenuItemFormErrors = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  const price = parsePriceInput(form.price);
  if ('error' in price) errors.price = price.error;
  if (!form.categoryId) errors.categoryId = 'Category is required';
  return errors;
}

export function validateCategoryName(name: string): string | undefined {
  const trimmed = name.trim();
  if (!trimmed) return 'Name is required';
  if (trimmed.length > 80) return 'Name is too long';
  return undefined;
}
