import type { ReactNode } from 'react';
import { Pressable, ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens } from '../tokens';
import { Text } from './Text';

// react-native-web adds hovered/focused to the Pressable state callback; base RN types
// only declare `pressed`. This is the shared shape used across interactive primitives.
export type PressableState = { pressed: boolean; hovered?: boolean; focused?: boolean };

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

const SIZES: Record<ButtonSize, { py: number; px: number; fontSize: number; height: number }> = {
  sm: { py: tokens.spacing.xs, px: tokens.spacing.md, fontSize: tokens.typography.size.sm, height: 32 },
  md: { py: tokens.spacing.sm, px: tokens.spacing.lg, fontSize: tokens.typography.size.base, height: 40 },
  lg: { py: tokens.spacing.md, px: tokens.spacing.xl, fontSize: tokens.typography.size.md, height: 48 },
};

function bgFor(variant: ButtonVariant, state: 'base' | 'hover' | 'active'): string {
  const i = tokens.colors.interactive;
  switch (variant) {
    case 'primary':
      return state === 'active' ? i.primaryActive : state === 'hover' ? i.primaryHover : i.primary;
    case 'destructive':
      return state === 'active'
        ? tokens.colors.palette.red700
        : state === 'hover'
          ? tokens.colors.palette.red500
          : tokens.colors.status.danger;
    case 'secondary':
      return state === 'base' ? tokens.colors.surface.base : tokens.colors.surface.sunken;
    case 'ghost':
      return state === 'base' ? 'transparent' : tokens.colors.surface.sunken;
  }
}

function textColorFor(variant: ButtonVariant, disabled: boolean): string {
  if (disabled) return tokens.colors.interactive.disabledText;
  if (variant === 'primary' || variant === 'destructive') return tokens.colors.text.inverse;
  if (variant === 'ghost') return tokens.colors.interactive.primary;
  return tokens.colors.text.primary;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  testID,
  style,
}: ButtonProps) {
  const dims = SIZES[size];
  const isDisabled = disabled || loading;
  const textColor = textColorFor(variant, disabled);

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={(rawState) => {
        const { pressed, hovered } = rawState as PressableState;
        return [
        styles.base,
        {
          minHeight: dims.height,
          paddingVertical: dims.py,
          paddingHorizontal: dims.px,
          backgroundColor: isDisabled
            ? variant === 'ghost'
              ? 'transparent'
              : tokens.colors.interactive.disabledBg
            : bgFor(variant, pressed ? 'active' : hovered ? 'hover' : 'base'),
          borderWidth: variant === 'secondary' ? tokens.border.thin : 0,
          borderColor: tokens.colors.border.default,
          // Instant, physical press feedback (apple-design §1).
          transform: [{ scale: pressed && !isDisabled ? 0.97 : 1 }],
          opacity: isDisabled && variant === 'ghost' ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
        ];
      }}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.content}>
          {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
          <Text
            variant="bodyStrong"
            color={textColor}
            style={{ fontSize: dims.fontSize, lineHeight: dims.fontSize + 4 }}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: tokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.sm },
  icon: { marginRight: 0 },
});
