import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { tokens } from '../tokens';
import { Text } from './Text';
import { FormField } from './FormField';
import type { PressableState } from './Button';

export type SelectOption<T extends string> = { label: string; value: T };

export type SelectProps<T extends string> = {
  value: T | undefined;
  onValueChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  label?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  testID?: string;
};

function focusRingStyle(): ViewStyle | null {
  return Platform.OS === 'web'
    ? ({ boxShadow: `0 0 0 3px ${tokens.colors.focusRing}` } as unknown as ViewStyle)
    : null;
}

/**
 * Custom select — never an HTML <select>, so it looks identical on web and native.
 * The menu expands INLINE (in normal flow) rather than floating, which renders reliably
 * inside any container (pages, modals, scroll views) with no positioning/clipping hacks.
 */
export function Select<T extends string>({
  value,
  onValueChange,
  options,
  placeholder = 'Select…',
  label,
  helperText,
  errorText,
  disabled = false,
  testID,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const hasError = !!errorText;
  const selected = options.find((option) => option.value === value);

  const borderColor = disabled
    ? tokens.colors.border.subtle
    : hasError
      ? tokens.colors.status.danger
      : open
        ? tokens.colors.border.focus
        : tokens.colors.border.default;

  return (
    <FormField label={label} helperText={helperText} errorText={errorText}>
      <Pressable
        testID={testID}
        onPress={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: open }}
        style={(rawState) => {
          const { pressed, hovered } = rawState as PressableState;
          return [
            styles.trigger,
            {
              borderColor:
                hovered && !disabled && !open && !hasError ? tokens.colors.border.strong : borderColor,
              backgroundColor: disabled ? tokens.colors.surface.sunken : tokens.colors.surface.base,
              transform: [{ scale: pressed && !disabled ? 0.99 : 1 }],
            },
            open && !disabled ? focusRingStyle() : null,
          ];
        }}
      >
        <Text
          variant="body"
          color={disabled ? 'muted' : selected ? 'primary' : 'muted'}
          numberOfLines={1}
          style={styles.triggerText}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Text variant="caption" color={disabled ? 'muted' : 'secondary'}>
          {open ? '▲' : '▼'}
        </Text>
      </Pressable>

      {open && !disabled ? (
        <View style={styles.menu}>
          <ScrollView style={styles.menuScroll} nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {options.length === 0 ? (
              <View style={styles.option}>
                <Text variant="bodySm" color="muted">
                  No options
                </Text>
              </View>
            ) : (
              options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    testID={testID ? `${testID}-option-${option.value}` : undefined}
                    onPress={() => {
                      onValueChange(option.value);
                      setOpen(false);
                    }}
                    style={(rawState) => {
                      const { pressed, hovered } = rawState as PressableState;
                      return [
                        styles.option,
                        {
                          backgroundColor: isSelected
                            ? tokens.colors.statusSoft.info
                            : pressed || hovered
                              ? tokens.colors.surface.sunken
                              : 'transparent',
                        },
                      ];
                    }}
                  >
                    <Text variant="body" color={isSelected ? tokens.colors.interactive.primary : 'primary'}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      ) : null}
    </FormField>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    borderRadius: tokens.radius.md,
    borderWidth: tokens.border.thin,
    paddingHorizontal: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  triggerText: { flex: 1 },
  menu: {
    marginTop: tokens.spacing.xs,
    backgroundColor: tokens.colors.surface.base,
    borderRadius: tokens.radius.md,
    borderWidth: tokens.border.hairline,
    borderColor: tokens.colors.border.subtle,
    paddingVertical: tokens.spacing.xs,
    overflow: 'hidden',
    ...tokens.shadow.md,
  },
  menuScroll: { maxHeight: 220 },
  option: {
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    borderRadius: tokens.radius.sm,
    marginHorizontal: tokens.spacing.xs,
  },
});
