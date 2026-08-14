import { createElement, useState, type ChangeEvent, type CSSProperties, type ReactNode } from 'react';
import { TextInput, View, StyleSheet, Platform, type TextInputProps, type ViewStyle } from 'react-native';
import { tokens } from '../tokens';
import { FormField } from './FormField';

export type InputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  /** On web, `date` renders a native calendar picker (RN-web TextInput cannot). */
  type?: 'text' | 'date' | 'email' | 'number' | 'password' | 'tel' | 'url' | 'search';
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onSubmitEditing?: () => void;
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

function webDateFieldStyle(color: string): CSSProperties {
  const body = tokens.textVariants.body;
  return {
    flex: 1,
    minWidth: 0,
    width: '100%',
    margin: 0,
    padding: 0,
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
    color,
    fontFamily: body.fontFamily,
    fontSize: body.fontSize,
    fontWeight: body.fontWeight as CSSProperties['fontWeight'],
    lineHeight: `${body.lineHeight}px`,
    letterSpacing: body.letterSpacing,
  };
}

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  helperText,
  errorText,
  disabled = false,
  secureTextEntry = false,
  type = 'text',
  keyboardType,
  autoCapitalize,
  leftIcon,
  rightIcon,
  onSubmitEditing,
  testID,
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const hasError = !!errorText;

  const borderColor = disabled
    ? tokens.colors.border.subtle
    : hasError
      ? tokens.colors.status.danger
      : focused
        ? tokens.colors.border.focus
        : tokens.colors.border.default;

  const textColor = disabled ? tokens.colors.text.muted : tokens.colors.text.primary;
  // RN-web TextInput derives DOM `type` from keyboardType/secureTextEntry and overwrites
  // any passed `type` prop — so date must be a real HTML <input>.
  const useNativeDate = Platform.OS === 'web' && type === 'date';

  const field = useNativeDate
    ? createElement('input', {
        type: 'date',
        value,
        disabled,
        placeholder,
        max: '9999-12-31',
        'aria-label': label ?? placeholder,
        'data-testid': testID,
        onChange: (e: ChangeEvent<HTMLInputElement>) => onChangeText(e.target.value),
        onFocus: () => setFocused(true),
        onBlur: () => setFocused(false),
        style: webDateFieldStyle(textColor),
      })
    : (
        <TextInput
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={tokens.colors.text.muted}
          editable={!disabled}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityState={{ disabled }}
          style={[
            styles.input,
            tokens.textVariants.body,
            { color: textColor },
            webNoOutline(),
          ]}
        />
      );

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
        {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
        {field}
        {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
      </View>
    </FormField>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    borderRadius: tokens.radius.md,
    borderWidth: tokens.border.thin,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: 10,
    gap: tokens.spacing.sm,
  },
  input: {
    flex: 1,
    // Avoid height: '100%' — on web it clips descenders / tabular digits inside the field.
    margin: 0,
    padding: 0,
  },
  icon: { alignItems: 'center', justifyContent: 'center' },
});
