import { useState } from 'react';
import { TextInput, View, StyleSheet, Platform, type ViewStyle } from 'react-native';
import { tokens } from '../tokens';
import { FormField } from './FormField';

export type TextareaProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  numberOfLines?: number;
  testID?: string;
};

// react-native-web accepts arbitrary CSS-only style keys (boxShadow, outlineStyle) that
// aren't part of RN's ViewStyle/TextStyle types; typed `any` and gated to web so native
// styling stays untouched.
function focusRingStyle(): ViewStyle | null {
  return Platform.OS === 'web'
    ? ({ boxShadow: `0 0 0 3px ${tokens.colors.focusRing}` } as unknown as ViewStyle)
    : null;
}

function webNoOutline(): ViewStyle | null {
  return Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as ViewStyle) : null;
}

export function Textarea({
  value,
  onChangeText,
  placeholder,
  label,
  helperText,
  errorText,
  disabled = false,
  numberOfLines = 4,
  testID,
}: TextareaProps) {
  const [focused, setFocused] = useState(false);
  const hasError = !!errorText;

  const borderColor = disabled
    ? tokens.colors.border.subtle
    : hasError
      ? tokens.colors.status.danger
      : focused
        ? tokens.colors.border.focus
        : tokens.colors.border.default;

  return (
    <FormField label={label} helperText={helperText} errorText={errorText}>
      <View
        style={[
          styles.container,
          {
            borderColor,
            backgroundColor: disabled ? tokens.colors.surface.sunken : tokens.colors.surface.base,
          },
          focused && !disabled ? focusRingStyle() : null,
        ]}
      >
        <TextInput
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={tokens.colors.text.muted}
          editable={!disabled}
          multiline
          numberOfLines={numberOfLines}
          textAlignVertical="top"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityState={{ disabled }}
          style={[
            styles.input,
            tokens.textVariants.body,
            { color: disabled ? tokens.colors.text.muted : tokens.colors.text.primary },
            webNoOutline(),
          ]}
        />
      </View>
    </FormField>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 96,
    borderRadius: tokens.radius.md,
    borderWidth: tokens.border.thin,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
  input: {
    flex: 1,
  },
});
