import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, StatusBadge } from './Badge';
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '@odyssey/shared';

describe('Badge', () => {
  it('renders its label', () => {
    render(<Badge label="New" tone="info" />);
    expect(screen.getByText('New')).toBeTruthy();
  });
});

describe('StatusBadge', () => {
  it('renders the human label for every order status', () => {
    for (const status of ORDER_STATUSES) {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(ORDER_STATUS_LABELS[status])).toBeTruthy();
      unmount();
    }
  });
});
