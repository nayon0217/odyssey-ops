import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('fires onPress when enabled', () => {
    const onPress = vi.fn();
    render(<Button label="Save" onPress={onPress} />);
    fireEvent.click(screen.getByText('Save'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled', () => {
    const onPress = vi.fn();
    render(<Button label="Save" onPress={onPress} disabled />);
    fireEvent.click(screen.getByText('Save'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('hides the label while loading (spinner shown instead)', () => {
    const onPress = vi.fn();
    render(<Button label="Save" onPress={onPress} loading />);
    expect(screen.queryByText('Save')).toBeNull();
  });

  it('does not fire onPress while loading', () => {
    const onPress = vi.fn();
    render(<Button label="Save" onPress={onPress} loading testID="btn" />);
    fireEvent.click(screen.getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
