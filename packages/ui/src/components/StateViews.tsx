import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { tokens } from '../tokens';
import { Text } from './Text';
import { Stack } from './Box';
import { Button } from './Button';
import { SkeletonText } from './Skeleton';

export type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  testID?: string;
};

/** Centered placeholder for a list/table/section with no data. */
export function EmptyState({ icon, title, description, action, testID }: EmptyStateProps) {
  return (
    <Stack align="center" justify="center" gap="sm" style={styles.container} testID={testID}>
      {icon ? <Stack style={styles.icon}>{icon}</Stack> : null}
      <Text variant="h3" align="center">
        {title}
      </Text>
      {description ? (
        <Text variant="body" color="secondary" align="center" style={styles.description}>
          {description}
        </Text>
      ) : null}
      {action ? <Stack style={styles.action}>{action}</Stack> : null}
    </Stack>
  );
}

export type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  testID?: string;
};

/** Centered error placeholder with a danger-tinted accent and optional retry action. */
export function ErrorState({ title = 'Something went wrong', description, onRetry, testID }: ErrorStateProps) {
  return (
    <Stack align="center" justify="center" gap="sm" style={styles.container} testID={testID}>
      <Text variant="h3" color={tokens.colors.status.danger} align="center">
        {title}
      </Text>
      {description ? (
        <Text variant="body" color="secondary" align="center" style={styles.description}>
          {description}
        </Text>
      ) : null}
      {onRetry ? (
        <Stack style={styles.action}>
          <Button label="Try again" variant="secondary" onPress={onRetry} />
        </Stack>
      ) : null}
    </Stack>
  );
}

export type LoadingStateProps = {
  label?: string;
  variant?: 'spinner' | 'skeleton';
  testID?: string;
};

/** Centered loading placeholder: a spinner (default) or a few skeleton text blocks. */
export function LoadingState({ label, variant = 'spinner', testID }: LoadingStateProps) {
  if (variant === 'skeleton') {
    return (
      <Stack gap="lg" style={styles.skeletonContainer} testID={testID}>
        <SkeletonText lines={3} />
        <SkeletonText lines={2} lastLineWidth="40%" />
      </Stack>
    );
  }
  return (
    <Stack align="center" justify="center" gap="sm" style={styles.container} testID={testID}>
      <ActivityIndicator color={tokens.colors.interactive.primary} size="small" />
      {label ? (
        <Text variant="bodySm" color="secondary">
          {label}
        </Text>
      ) : null}
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: tokens.spacing['3xl'],
    paddingHorizontal: tokens.spacing.xl,
  },
  skeletonContainer: {
    paddingVertical: tokens.spacing.xl,
    paddingHorizontal: tokens.spacing.xl,
  },
  icon: {
    marginBottom: tokens.spacing.xs,
  },
  description: {
    maxWidth: 360,
  },
  action: {
    marginTop: tokens.spacing.sm,
  },
});
