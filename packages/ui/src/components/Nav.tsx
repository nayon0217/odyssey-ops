import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { tokens } from '../tokens';
import { Text } from './Text';
import { Stack, Row } from './Box';
import type { PressableState } from './Button';

export type NavItem = {
  key: string;
  label: string;
  icon?: ReactNode;
};

export type SideNavProps = {
  items: NavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  header?: ReactNode;
  footer?: ReactNode;
  testID?: string;
};

/** Vertical sidebar navigation with an active tint and hover feedback on items. */
export function SideNav({ items, activeKey, onSelect, header, footer, testID }: SideNavProps) {
  return (
    <Stack style={styles.sidebar} testID={testID}>
      {header ? <View style={styles.header}>{header}</View> : null}

      <Stack style={styles.items} gap="xxs">
        {items.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <Pressable
              key={item.key}
              onPress={() => onSelect(item.key)}
              testID={testID ? `${testID}-item-${item.key}` : undefined}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              style={(rawState) => {
                const { hovered, pressed } = rawState as PressableState;
                return [
                  styles.item,
                  {
                    backgroundColor: isActive
                      ? tokens.colors.statusSoft.info
                      : pressed || hovered
                        ? tokens.colors.surface.raised
                        : 'transparent',
                  },
                ];
              }}
            >
              <Row gap="sm" align="center">
                {item.icon ? <View style={styles.icon}>{item.icon}</View> : null}
                <Text
                  variant={isActive ? 'bodyStrong' : 'body'}
                  color={isActive ? tokens.colors.interactive.primary : 'secondary'}
                >
                  {item.label}
                </Text>
              </Row>
            </Pressable>
          );
        })}
      </Stack>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </Stack>
  );
}

export type TopBarProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  testID?: string;
};

/** Header bar with a title/subtitle on the left and an actions slot on the right. */
export function TopBar({ title, subtitle, right, testID }: TopBarProps) {
  return (
    <Row testID={testID} justify="space-between" align="center" style={styles.topbar}>
      <Stack gap="xxs">
        <Text variant="h2">{title}</Text>
        {subtitle ? (
          <Text variant="bodySm" color="secondary">
            {subtitle}
          </Text>
        ) : null}
      </Stack>
      {right ? <View>{right}</View> : null}
    </Row>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: tokens.layout.sidebarWidth,
    height: '100%',
    backgroundColor: tokens.colors.surface.base,
    borderRightWidth: tokens.border.hairline,
    borderRightColor: tokens.colors.border.subtle,
  },
  header: {
    padding: tokens.spacing.lg,
  },
  items: {
    flex: 1,
    padding: tokens.spacing.sm,
  },
  item: {
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    borderRadius: tokens.radius.md,
  },
  icon: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: tokens.spacing.lg,
    borderTopWidth: tokens.border.hairline,
    borderTopColor: tokens.colors.border.subtle,
  },
  topbar: {
    height: tokens.layout.topbarHeight,
    paddingHorizontal: tokens.layout.gutter,
    backgroundColor: tokens.colors.surface.base,
    borderBottomWidth: tokens.border.hairline,
    borderBottomColor: tokens.colors.border.subtle,
  },
});
