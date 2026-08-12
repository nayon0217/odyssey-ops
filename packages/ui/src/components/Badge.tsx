import { View, StyleSheet } from 'react-native';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@odyssey/shared';
import { tokens } from '../tokens';
import { Text } from './Text';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  dot?: boolean;
  testID?: string;
};

const TONE_COLORS: Record<BadgeTone, { bg: string; fg: string }> = {
  success: { bg: tokens.colors.statusSoft.success, fg: tokens.colors.status.success },
  warning: { bg: tokens.colors.statusSoft.warning, fg: tokens.colors.status.warning },
  danger: { bg: tokens.colors.statusSoft.danger, fg: tokens.colors.status.danger },
  info: { bg: tokens.colors.statusSoft.info, fg: tokens.colors.status.info },
  neutral: { bg: tokens.colors.statusSoft.neutral, fg: tokens.colors.status.neutral },
};

export function Badge({ label, tone = 'neutral', dot = false, testID }: BadgeProps) {
  const c = TONE_COLORS[tone];
  return (
    <View testID={testID} style={[styles.badge, { backgroundColor: c.bg }]}>
      {dot ? <View style={[styles.dot, { backgroundColor: c.fg }]} /> : null}
      <Text variant="caption" color={c.fg} style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

// Single mapping from order status -> semantic tone, used everywhere a status renders.
const STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  pending: 'warning',
  accepted: 'info',
  preparing: 'info',
  ready: 'success',
  completed: 'success',
  cancelled: 'neutral',
};

export function StatusBadge({ status, testID }: { status: OrderStatus; testID?: string }) {
  return <Badge label={ORDER_STATUS_LABELS[status]} tone={STATUS_TONE[status]} dot testID={testID} />;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
    paddingVertical: 3,
    paddingHorizontal: tokens.spacing.sm,
    borderRadius: tokens.radius.pill,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: tokens.radius.pill },
  label: { fontWeight: tokens.typography.weight.semibold, letterSpacing: 0.2 },
});
