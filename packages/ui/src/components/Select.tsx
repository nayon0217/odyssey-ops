import { useRef, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
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

type TriggerLayout = { x: number; y: number; width: number; height: number };

// react-native-web accepts arbitrary CSS-only style keys (boxShadow) that aren't part of
// RN's ViewStyle type; typed `any` and gated to web so native styling stays untouched.
function focusRingStyle(): ViewStyle | null {
  return Platform.OS === 'web'
    ? ({ boxShadow: `0 0 0 3px ${tokens.colors.focusRing}` } as unknown as ViewStyle)
    : null;
}

/** Custom dropdown — never relies on an HTML <select>, so it looks identical on web and native. */
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
  const triggerRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useState<TriggerLayout | null>(null);
  const hasError = !!errorText;
  const selected = options.find((option) => option.value === value);

  const openMenu = () => {
    if (disabled) return;
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setLayout({ x, y, width, height });
      setOpen(true);
    });
  };
  const closeMenu = () => setOpen(false);

  const borderColor = disabled
    ? tokens.colors.border.subtle
    : hasError
      ? tokens.colors.status.danger
      : open
        ? tokens.colors.border.focus
        : tokens.colors.border.default;

  return (
    <FormField label={label} helperText={helperText} errorText={errorText}>
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          testID={testID}
          onPress={openMenu}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityState={{ disabled, expanded: open }}
          style={(rawState) => {
            const { pressed, hovered } = rawState as PressableState;
            return [
              styles.trigger,
              {
                borderColor: hovered && !disabled && !open && !hasError ? tokens.colors.border.strong : borderColor,
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
      </View>

      <Modal visible={open} transparent animationType="none" onRequestClose={closeMenu}>
        <Pressable
          style={styles.backdrop}
          onPress={closeMenu}
          testID={testID ? `${testID}-backdrop` : undefined}
        >
          {layout ? (
            <View
              style={[
                styles.menu,
                {
                  top: layout.y + layout.height + tokens.spacing.xs,
                  left: layout.x,
                  width: layout.width,
                },
              ]}
            >
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    testID={testID ? `${testID}-option-${option.value}` : undefined}
                    onPress={() => {
                      onValueChange(option.value);
                      closeMenu();
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
              })}
            </View>
          ) : null}
        </Pressable>
      </Modal>
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
  backdrop: { flex: 1 },
  menu: {
    position: 'absolute',
    backgroundColor: tokens.colors.surface.base,
    borderRadius: tokens.radius.md,
    borderWidth: tokens.border.hairline,
    borderColor: tokens.colors.border.subtle,
    paddingVertical: tokens.spacing.xs,
    maxHeight: 240,
    ...tokens.shadow.lg,
  },
  option: {
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    borderRadius: tokens.radius.sm,
    marginHorizontal: tokens.spacing.xs,
  },
});
