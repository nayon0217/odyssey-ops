import type { ReactNode } from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { tokens } from '../tokens';
import { Text } from './Text';

type Elevation = 'none' | 'sm' | 'md' | 'lg';

export type CardProps = {
  children?: ReactNode;
  elevation?: Elevation;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Card({ children, elevation = 'sm', padded = true, style, testID }: CardProps) {
  return (
    <View
      testID={testID}
      style={[styles.card, padded && styles.padded, elevation !== 'none' && tokens.shadow[elevation], style]}
    >
      {children}
    </View>
  );
}

export type CardHeaderProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

export function CardHeader({ title, subtitle, right }: CardHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text variant="title">{title}</Text>
        {subtitle ? (
          <Text variant="bodySm" color="secondary" style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.surface.base,
    borderRadius: tokens.radius.lg,
    borderWidth: tokens.border.hairline,
    borderColor: tokens.colors.border.subtle,
  },
  padded: { padding: tokens.spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.lg,
  },
  headerText: { flex: 1, gap: tokens.spacing.xxs },
  subtitle: { marginTop: 2 },
});
