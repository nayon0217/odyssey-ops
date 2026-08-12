import { Slot, usePathname, useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { SideNav, Text, tokens, type NavItem } from '@odyssey/ui';

const NAV: (NavItem & { route: string })[] = [
  { key: '/', route: '/', label: 'Home', icon: <Text variant="body">🏠</Text> },
  { key: '/orders', route: '/orders', label: 'Orders', icon: <Text variant="body">🧾</Text> },
  { key: '/menu', route: '/menu', label: 'Menu', icon: <Text variant="body">🍽️</Text> },
  { key: '/crm', route: '/crm', label: 'Customers', icon: <Text variant="body">👥</Text> },
  { key: '/settings', route: '/settings', label: 'Settings', icon: <Text variant="body">⚙️</Text> },
];

export default function DashboardLayout() {
  const pathname = usePathname();
  const router = useRouter();
  // Longest matching prefix so /orders/:id keeps Orders active.
  const activeKey =
    NAV.filter((n) => (n.route === '/' ? pathname === '/' : pathname.startsWith(n.route)))
      .sort((a, b) => b.route.length - a.route.length)[0]?.key ?? '/';

  return (
    <View style={styles.shell}>
      <SideNav
        items={NAV}
        activeKey={activeKey}
        onSelect={(key) => router.push(key as never)}
        header={
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Text variant="bodyStrong" color="inverse">
                O
              </Text>
            </View>
            <View>
              <Text variant="title">Odyssey</Text>
              <Text variant="caption" color="muted">
                Restaurant Ops
              </Text>
            </View>
          </View>
        }
      />
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, flexDirection: 'row', backgroundColor: tokens.colors.surface.raised },
  content: { flex: 1 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.sm, paddingVertical: tokens.spacing.sm },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.colors.interactive.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
