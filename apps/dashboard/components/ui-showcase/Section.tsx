import type { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { tokens, Text, Divider } from '@odyssey/ui';

export function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="h2">{title}</Text>
      {description ? (
        <Text variant="bodySm" color="secondary" style={styles.desc}>
          {description}
        </Text>
      ) : null}
      <View style={styles.divider}>
        <Divider />
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

export function ShowcaseRow({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

export function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.swatch}>
      <View style={[styles.swatchColor, { backgroundColor: color }]} />
      <Text variant="caption" color="secondary">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: tokens.spacing['3xl'] },
  desc: { marginTop: tokens.spacing.xs },
  divider: { marginVertical: tokens.spacing.lg },
  body: { gap: tokens.spacing.lg },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.md, alignItems: 'center' },
  swatch: { gap: tokens.spacing.xs, width: 96 },
  swatchColor: {
    height: 48,
    borderRadius: tokens.radius.md,
    borderWidth: tokens.border.hairline,
    borderColor: tokens.colors.border.subtle,
  },
});
