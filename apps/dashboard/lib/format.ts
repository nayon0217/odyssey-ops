import { formatMoney } from '@odyssey/shared';

export { formatMoney };

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Compact relative time, e.g. "3h ago", "2d ago". */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '—';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

/** Keep only digits, max 8 — for yyyymmdd filter fields. */
export function normalizeYyyymmddInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 8);
}

/**
 * Convert a complete yyyymmdd string to an ISO day bound for the orders API.
 * Incomplete / invalid values return undefined so the filter is ignored until valid.
 */
export function yyyymmddToIsoBound(
  value: string,
  bound: 'start' | 'end',
): string | undefined {
  if (!/^\d{8}$/.test(value)) return undefined;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  const isoDate = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  const probe = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(probe.getTime())) return undefined;
  // Reject rollover dates like 20240231 → Mar 2.
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() + 1 !== month ||
    probe.getUTCDate() !== day
  ) {
    return undefined;
  }
  return bound === 'start' ? `${isoDate}T00:00:00Z` : `${isoDate}T23:59:59Z`;
}
