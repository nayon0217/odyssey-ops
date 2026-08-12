import { describe, it, expect } from 'vitest';
import {
  applyAction,
  canTransition,
  assertTransition,
  getAvailableActions,
  getAvailableTransitions,
  isTerminalStatus,
  InvalidTransitionError,
} from './order-status';

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
