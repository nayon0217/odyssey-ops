// The order-status state machine — the single definition of which transitions are
// legal. Imported by BOTH services/backend (to enforce) and apps/dashboard (to render
// only valid action buttons), so status logic is never duplicated across the stack.

export const ORDER_STATUSES = [
  'pending',
  'accepted',
  'preparing',
  'ready',
  'completed',
  'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_ACTIONS = [
  'accept',
  'start_preparing',
  'mark_ready',
  'complete',
  'cancel',
] as const;
export type OrderAction = (typeof ORDER_ACTIONS)[number];

/** status -> action -> resulting status. Terminal states map to nothing. */
export const ORDER_TRANSITIONS: Record<OrderStatus, Partial<Record<OrderAction, OrderStatus>>> = {
  pending: { accept: 'accepted', cancel: 'cancelled' },
  accepted: { start_preparing: 'preparing', cancel: 'cancelled' },
  preparing: { mark_ready: 'ready', cancel: 'cancelled' },
  ready: { complete: 'completed' },
  completed: {},
  cancelled: {},
};

export const ORDER_ACTION_LABELS: Record<OrderAction, string> = {
  accept: 'Accept',
  start_preparing: 'Start preparing',
  mark_ready: 'Mark ready',
  complete: 'Complete',
  cancel: 'Cancel',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export class InvalidTransitionError extends Error {
  constructor(
    public readonly from: OrderStatus,
    public readonly action: OrderAction,
  ) {
    super(`Cannot apply action "${action}" to an order in status "${from}"`);
    this.name = 'InvalidTransitionError';
  }
}

export function isTerminalStatus(status: OrderStatus): boolean {
  return Object.keys(ORDER_TRANSITIONS[status]).length === 0;
}

/** Actions legal from a given status (drives the UI's action buttons). */
export function getAvailableActions(status: OrderStatus): OrderAction[] {
  return Object.keys(ORDER_TRANSITIONS[status]) as OrderAction[];
}

/** Resulting statuses reachable from a given status. */
export function getAvailableTransitions(status: OrderStatus): OrderStatus[] {
  return Object.values(ORDER_TRANSITIONS[status]) as OrderStatus[];
}

export function getNextStatus(status: OrderStatus, action: OrderAction): OrderStatus | undefined {
  return ORDER_TRANSITIONS[status][action];
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return getAvailableTransitions(from).includes(to);
}

export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal status transition: ${from} -> ${to}`);
  }
}

/** Apply an action to a status, throwing InvalidTransitionError if illegal. */
export function applyAction(current: OrderStatus, action: OrderAction): OrderStatus {
  const next = getNextStatus(current, action);
  if (!next) throw new InvalidTransitionError(current, action);
  return next;
}

// ── Staleness invariant ──────────────────────────────────────────────────────
// An order placed more than an hour ago can never still be "preparing" — by then
// it must be prepared (at least "ready"). This is the single source of that rule;
// the backend enforces it in the DB (a sweep before order reads) and the frontend
// applies it defensively on display.
export const PREP_STALE_MS = 60 * 60 * 1000;

export function isStalePreparing(
  status: OrderStatus,
  placedAtIso: string,
  now: number = Date.now(),
): boolean {
  return status === 'preparing' && now - new Date(placedAtIso).getTime() > PREP_STALE_MS;
}

/** The effective status once the staleness rule is applied ("preparing" > 1h → "ready"). */
export function effectiveOrderStatus(
  status: OrderStatus,
  placedAtIso: string,
  now: number = Date.now(),
): OrderStatus {
  return isStalePreparing(status, placedAtIso, now) ? 'ready' : status;
}
