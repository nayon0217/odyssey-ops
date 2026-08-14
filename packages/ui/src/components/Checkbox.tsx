import { Pressable, StyleSheet } from 'react-native';
import { tokens } from '../tokens';
import { Text } from './Text';
import { Icon } from './Icon';
import { Row } from './Box';
import type { PressableState } from './Button';

export type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  testID?: string;
};

const BOX_SIZE = 20;

export function Checkbox({ checked, onChange, label, disabled = false, testID }: CheckboxProps) {
  return (
    <Pressable
      testID={testID}
      onPress={() => onChange(!checked)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      style={{ opacity: disabled ? 0.5 : 1, alignSelf: 'flex-start' }}
    >
      {(rawState) => {
        const { pressed, hovered } = rawState as PressableState;
        return (
          <Row gap="sm" align="center">
            <Row
              align="center"
              justify="center"
              style={[
                styles.box,
                {
                  backgroundColor: checked ? tokens.colors.interactive.primary : tokens.colors.surface.base,
                  borderColor: checked
                    ? tokens.colors.interactive.primary
                    : hovered && !disabled
                      ? tokens.colors.border.strong
                      : tokens.colors.border.default,
                  transform: [{ scale: pressed && !disabled ? 0.92 : 1 }],
                },
              ]}
            >
              {checked ? <Icon name="check" color="inverse" size={13} strokeWidth={2.6} /> : null}
            </Row>
            {label ? (
              <Text variant="body" color={disabled ? 'muted' : 'primary'}>
                {label}
              </Text>
            ) : null}
          </Row>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: tokens.radius.sm,
    borderWidth: tokens.border.thin,
  },
});
