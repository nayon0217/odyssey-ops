import { describe, it, expect } from 'vitest';
import {
  applyAction,
  canTransition,
  assertTransition,
  getAvailableActions,
  getAvailableActionsForOrder,
  getAvailableTransitions,
  isTerminalStatus,
  effectiveOrderStatus,
  isStalePreparing,
  InvalidTransitionError,
} from './order-status';

const HOUR_MS = 60 * 60 * 1000;

describe('order status state machine', () => {
  it.each([
    ['pending', 'accepted', true],
    ['pending', 'cancelled', true],
    ['pending', 'preparing', false],
    ['accepted', 'preparing', true],
    ['preparing', 'ready', true],
    ['ready', 'completed', true],
    ['completed', 'pending', false],
    ['cancelled', 'accepted', false],
  ] as const)('canTransition(%s -> %s) === %s', (from, to, expected) => {
    expect(canTransition(from, to)).toBe(expected);
  });

  it('applyAction advances a valid action', () => {
    expect(applyAction('pending', 'accept')).toBe('accepted');
    expect(applyAction('accepted', 'start_preparing')).toBe('preparing');
    expect(applyAction('preparing', 'mark_ready')).toBe('ready');
    expect(applyAction('ready', 'complete')).toBe('completed');
  });

  it('applyAction throws InvalidTransitionError on an illegal action', () => {
    expect(() => applyAction('completed', 'accept')).toThrow(InvalidTransitionError);
    expect(() => applyAction('ready', 'accept')).toThrow(InvalidTransitionError);
  });

  it('assertTransition throws on an illegal status change', () => {
    expect(() => assertTransition('completed', 'pending')).toThrow();
    expect(() => assertTransition('pending', 'accepted')).not.toThrow();
  });

  it('getAvailableActions returns only legal actions for a status', () => {
    expect(getAvailableActions('pending').sort()).toEqual(['accept', 'cancel']);
    expect(getAvailableActions('ready')).toEqual(['complete']);
    expect(getAvailableActions('completed')).toEqual([]);
  });

  it('getAvailableTransitions returns reachable next statuses', () => {
    expect(getAvailableTransitions('ready')).toEqual(['completed']);
  });

  it('identifies terminal statuses', () => {
    expect(isTerminalStatus('completed')).toBe(true);
    expect(isTerminalStatus('cancelled')).toBe(true);
    expect(isTerminalStatus('pending')).toBe(false);
  });
});

describe('staleness invariant (preparing > 1h → ready)', () => {
  const twoHoursAgo = new Date(Date.now() - 2 * HOUR_MS).toISOString();
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  it('normalizes a >1h-old preparing order to ready', () => {
    expect(isStalePreparing('preparing', twoHoursAgo)).toBe(true);
    expect(effectiveOrderStatus('preparing', twoHoursAgo)).toBe('ready');
  });

  it('leaves a recent preparing order untouched', () => {
    expect(isStalePreparing('preparing', tenMinAgo)).toBe(false);
    expect(effectiveOrderStatus('preparing', tenMinAgo)).toBe('preparing');
  });

  it('does not day-collapse statuses that are only a few hours old', () => {
    expect(effectiveOrderStatus('accepted', twoHoursAgo)).toBe('accepted');
    expect(effectiveOrderStatus('pending', twoHoursAgo)).toBe('pending');
    expect(isStalePreparing('accepted', twoHoursAgo)).toBe(false);
  });
});

describe('staleness invariant (order > 1 day → accepted | cancelled)', () => {
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * HOUR_MS).toISOString();
  const twelveHoursAgo = new Date(Date.now() - 12 * HOUR_MS).toISOString();

  it('collapses disallowed day-old statuses to accepted', () => {
    expect(effectiveOrderStatus('pending', twoDaysAgo)).toBe('accepted');
    expect(effectiveOrderStatus('preparing', twoDaysAgo)).toBe('accepted');
    expect(effectiveOrderStatus('ready', twoDaysAgo)).toBe('accepted');
    expect(effectiveOrderStatus('completed', twoDaysAgo)).toBe('accepted');
  });

  it('keeps accepted and cancelled on day-old orders', () => {
    expect(effectiveOrderStatus('accepted', twoDaysAgo)).toBe('accepted');
    expect(effectiveOrderStatus('cancelled', twoDaysAgo)).toBe('cancelled');
  });

  it('does not apply the day rule under 24h', () => {
    expect(effectiveOrderStatus('accepted', twelveHoursAgo)).toBe('accepted');
    expect(effectiveOrderStatus('ready', twelveHoursAgo)).toBe('ready');
    expect(effectiveOrderStatus('completed', twelveHoursAgo)).toBe('completed');
  });

  it('limits day-old actions to those that stay accepted|cancelled', () => {
    expect(getAvailableActionsForOrder('accepted', twoDaysAgo)).toEqual(['cancel']);
    expect(getAvailableActionsForOrder('accepted', twelveHoursAgo).sort()).toEqual([
      'cancel',
      'start_preparing',
    ]);
  });
});
