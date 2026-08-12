import type { ReactNode } from 'react';
import { tokens } from '../tokens';
import { Text } from './Text';
import { Stack, Row } from './Box';

export type FormFieldProps = {
  label?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  children?: ReactNode;
  testID?: string;
};

/**
 * Label + control + helper/error footer, shared by Input/Textarea/Select/etc.
 * When `errorText` is present it takes over the footer slot; otherwise `helperText` shows.
 */
export function FormField({ label, helperText, errorText, required = false, children, testID }: FormFieldProps) {
  return (
    <Stack gap="xs" testID={testID}>
      {label ? (
        <Row gap="xxs">
          <Text variant="label">{label}</Text>
          {required ? (
            <Text variant="label" color={tokens.colors.status.danger}>
              *
            </Text>
          ) : null}
        </Row>
      ) : null}
      {children}
      {errorText ? (
        <Text variant="caption" color={tokens.colors.status.danger}>
          {errorText}
        </Text>
      ) : helperText ? (
        <Text variant="caption" color="secondary">
          {helperText}
        </Text>
      ) : null}
    </Stack>
  );
}
