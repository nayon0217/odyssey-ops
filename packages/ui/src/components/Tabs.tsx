import { Pressable, StyleSheet } from 'react-native';
import { tokens } from '../tokens';
import { Text } from './Text';
import { Row } from './Box';
import type { PressableState } from './Button';

export type TabItem<T extends string> = {
  key: T;
  label: string;
};

export type TabsProps<T extends string> = {
  tabs: TabItem<T>[];
  activeKey: T;
  onChange: (key: T) => void;
  testID?: string;
};

/** Horizontal row of tabs; the active tab shows a primary underline and text. */
export function Tabs<T extends string>({ tabs, activeKey, onChange, testID }: TabsProps<T>) {
  return (
    <Row testID={testID} style={styles.row}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            testID={testID ? `${testID}-tab-${tab.key}` : undefined}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            style={(rawState) => {
              const { hovered } = rawState as PressableState;
              return [
                styles.tab,
                {
                  borderBottomColor: isActive ? tokens.colors.interactive.primary : 'transparent',
                  backgroundColor: !isActive && hovered ? tokens.colors.surface.raised : 'transparent',
                },
              ];
            }}
          >
            <Text variant="bodyStrong" color={isActive ? tokens.colors.interactive.primary : 'secondary'}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </Row>
  );
}

const styles = StyleSheet.create({
  row: {
    borderBottomWidth: tokens.border.hairline,
    borderBottomColor: tokens.colors.border.subtle,
  },
  tab: {
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    borderBottomWidth: tokens.border.thick,
    marginBottom: -tokens.border.hairline,
  },
});
