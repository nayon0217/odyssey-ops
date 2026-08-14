import type { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { tokens } from '../tokens';
import { Text } from './Text';

export type CalloutTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const TONE: Record<CalloutTone, { bg: string; border: string; fg: string; icon: string }> = {
  success: { bg: tokens.colors.statusSoft.success, border: tokens.colors.status.success, fg: tokens.colors.status.success, icon: '✓' },
  warning: { bg: tokens.colors.statusSoft.warning, border: tokens.colors.status.warning, fg: tokens.colors.status.warning, icon: '!' },
  danger: { bg: tokens.colors.statusSoft.danger, border: tokens.colors.status.danger, fg: tokens.colors.status.danger, icon: '!' },
  info: { bg: tokens.colors.statusSoft.info, border: tokens.colors.status.info, fg: tokens.colors.status.info, icon: 'i' },
  neutral: { bg: tokens.colors.statusSoft.neutral, border: tokens.colors.border.default, fg: tokens.colors.text.secondary, icon: '•' },
};

export type CalloutProps = {
  tone?: CalloutTone;
  title?: string;
  children?: ReactNode;
  testID?: string;
};

/** Inline status message (success / warning / danger / info) — the non-toast, in-page
 *  feedback pattern. Toasts are transient; a Callout persists in context. */
export function Callout({ tone = 'info', title, children, testID }: CalloutProps) {
  const c = TONE[tone];
  return (
    <View testID={testID} style={[styles.root, { backgroundColor: c.bg, borderColor: c.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: c.fg }]}>
        <Text variant="caption" color="inverse" style={styles.icon}>
          {c.icon}
        </Text>
      </View>
      <View style={styles.body}>
        {title ? (
          <Text variant="bodyStrong" color={c.fg}>
            {title}
          </Text>
        ) : null}
        {typeof children === 'string' ? (
          <Text variant="bodySm" color="secondary">
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.spacing.sm,
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.md,
    borderWidth: tokens.border.thin,
  },
  iconWrap: {
    width: 20,
    height: 20,
    borderRadius: tokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  icon: { fontWeight: tokens.typography.weight.bold, lineHeight: 14 },
  body: { flex: 1, gap: tokens.spacing.xxs },
});
