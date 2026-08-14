import { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import {
  tokens,
  Text,
  Icon,
  type IconName,
  Box,
  Row,
  Stack,
  Button,
  Card,
  CardHeader,
  Badge,
  StatusBadge,
  Input,
  Textarea,
  Select,
  Checkbox,
  Switch,
  Modal,
  ConfirmDialog,
  Drawer,
  useToast,
  Table,
  type Column,
  Tabs,
  SideNav,
  TopBar,
  Skeleton,
  SkeletonText,
  EmptyState,
  ErrorState,
  LoadingState,
  Callout,
  Grid,
} from '@odyssey/ui';
import { ORDER_STATUSES } from '@odyssey/shared';
import { Section, ShowcaseRow, Swatch } from '../components/ui-showcase/Section';

type DemoRow = { id: string; name: string; price: string; status: (typeof ORDER_STATUSES)[number] };
const DEMO_ROWS: DemoRow[] = [
  { id: '1', name: 'Margherita Pizza', price: '$14.00', status: 'pending' },
  { id: '2', name: 'Grilled Salmon', price: '$22.00', status: 'preparing' },
  { id: '3', name: 'Tiramisu', price: '$9.00', status: 'completed' },
];
const DEMO_COLUMNS: Column<DemoRow>[] = [
  { key: 'name', header: 'Item', accessor: (r) => r.name },
  { key: 'price', header: 'Price', width: 100, align: 'right', accessor: (r) => r.price },
  { key: 'status', header: 'Status', width: 140, render: (r) => <StatusBadge status={r.status} /> },
];

const ICON_NAMES: IconName[] = [
  'home', 'orders', 'menu', 'customers', 'settings', 'search', 'bell', 'plus',
  'revenue', 'timer', 'flame', 'star', 'arrowUp', 'arrowDown', 'chevronRight', 'check',
  'success', 'warning', 'info',
];

// Living style guide + visual test harness for the design system.
export default function UILibrary() {
  const toast = useToast();
  const [text, setText] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<string>();
  const [checked, setChecked] = useState(true);
  const [switchOn, setSwitchOn] = useState(true);
  const [tab, setTab] = useState('overview');
  const [navKey, setNavKey] = useState('orders');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <View style={styles.root}>
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="display">Odyssey UI</Text>
        <Text variant="body" color="secondary">
          Design system — tokens, typography, and reusable primitives.
        </Text>
      </View>

      <Section title="Color tokens" description="Pastel restaurant-SaaS palette (lilac-gray canvas, periwinkle primary). Components reference semantic tokens, never raw hex.">
        <Text variant="overline" color="secondary">Surface</Text>
        <ShowcaseRow>
          <Swatch color={tokens.colors.surface.base} label="base" />
          <Swatch color={tokens.colors.surface.raised} label="raised" />
          <Swatch color={tokens.colors.surface.sunken} label="sunken" />
          <Swatch color={tokens.colors.surface.inverse} label="inverse" />
        </ShowcaseRow>
        <Text variant="overline" color="secondary">Interactive & border</Text>
        <ShowcaseRow>
          <Swatch color={tokens.colors.interactive.primary} label="primary" />
          <Swatch color={tokens.colors.interactive.primaryHover} label="hover" />
          <Swatch color={tokens.colors.interactive.primaryActive} label="active" />
          <Swatch color={tokens.colors.border.default} label="border" />
        </ShowcaseRow>
        <Text variant="overline" color="secondary">Status</Text>
        <ShowcaseRow>
          <Swatch color={tokens.colors.status.success} label="success" />
          <Swatch color={tokens.colors.status.warning} label="warning" />
          <Swatch color={tokens.colors.status.danger} label="danger" />
          <Swatch color={tokens.colors.status.info} label="info" />
          <Swatch color={tokens.colors.status.neutral} label="neutral" />
        </ShowcaseRow>
        <Text variant="overline" color="secondary">Status soft</Text>
        <ShowcaseRow>
          <Swatch color={tokens.colors.statusSoft.success} label="success" />
          <Swatch color={tokens.colors.statusSoft.warning} label="warning" />
          <Swatch color={tokens.colors.statusSoft.danger} label="danger" />
          <Swatch color={tokens.colors.statusSoft.info} label="info" />
          <Swatch color={tokens.colors.statusSoft.neutral} label="neutral" />
        </ShowcaseRow>
        <Text variant="overline" color="secondary">KPI washes</Text>
        <ShowcaseRow>
          <Swatch color={tokens.colors.wash.lavender} label="lavender" />
          <Swatch color={tokens.colors.wash.mint} label="mint" />
          <Swatch color={tokens.colors.wash.peach} label="peach" />
          <Swatch color={tokens.colors.wash.gold} label="gold" />
        </ShowcaseRow>
      </Section>

      <Section title="Typography" description="Outfit for display; Plus Jakarta Sans for body UI.">
        <Row gap="xl" align="baseline" wrap="wrap">
          <Text variant="stat">248</Text>
          <Text variant="statSm">$9,720</Text>
        </Row>
        <Text variant="caption" color="muted">stat / statSm — big tabular numerals for KPIs</Text>
        <Text variant="display">Display — 34</Text>
        <Text variant="h1">Heading 1 — 27</Text>
        <Text variant="h2">Heading 2 — 22</Text>
        <Text variant="h3">Heading 3 — 18</Text>
        <Text variant="title">Title — 16</Text>
        <Text variant="body">Body — the quick brown fox jumps over the lazy dog.</Text>
        <Text variant="bodySm" color="secondary">Body small — secondary color for supporting copy.</Text>
        <Text variant="label">LABEL — form field labels</Text>
        <Text variant="caption" color="muted">Caption — muted, for metadata</Text>
        <Text variant="overline" color="secondary">Overline — section eyebrows</Text>
      </Section>

      <Section title="Icons" description="Illustrated line icons (Lucide geometry) — the single icon primitive. No emoji in the UI.">
        <ShowcaseRow>
          {ICON_NAMES.map((name) => (
            <Stack key={name} gap="xs" align="center" style={styles.iconCell}>
              <View style={styles.iconTile}>
                <Icon name={name} color="primary" size={22} />
              </View>
              <Text variant="caption" color="secondary">{name}</Text>
            </Stack>
          ))}
        </ShowcaseRow>
      </Section>

      <Section title="Spacing & radius" description="4px base scale; radius scale.">
        <Text variant="overline" color="secondary">Spacing</Text>
        <ShowcaseRow>
          {(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const).map((k) => (
            <Stack key={k} gap="xs" align="center">
              <View style={{ width: tokens.spacing[k], height: 24, backgroundColor: tokens.colors.interactive.primary, borderRadius: 3 }} />
              <Text variant="caption" color="secondary">{k}</Text>
            </Stack>
          ))}
        </ShowcaseRow>
        <Text variant="overline" color="secondary">Radius</Text>
        <ShowcaseRow>
          {(['sm', 'md', 'lg', 'xl', 'pill'] as const).map((k) => (
            <Stack key={k} gap="xs" align="center">
              <View style={{ width: 56, height: 40, backgroundColor: tokens.colors.surface.sunken, borderWidth: 1, borderColor: tokens.colors.border.default, borderRadius: tokens.radius[k] }} />
              <Text variant="caption" color="secondary">{k}</Text>
            </Stack>
          ))}
        </ShowcaseRow>
      </Section>

      <Section title="Border widths" description="Border scale — hairline / thin / thick. Components use tokens.border, never raw px.">
        <ShowcaseRow>
          {(['hairline', 'thin', 'thick'] as const).map((k) => (
            <Stack key={k} gap="xs" align="center">
              <View
                style={{
                  width: 72,
                  height: 48,
                  backgroundColor: tokens.colors.surface.base,
                  borderWidth: tokens.border[k],
                  borderColor: tokens.colors.border.strong,
                  borderRadius: tokens.radius.md,
                }}
              />
              <Text variant="caption" color="secondary">{k} · {tokens.border[k]}px</Text>
            </Stack>
          ))}
        </ShowcaseRow>
      </Section>

      <Section title="Elevation" description="Shadow scale; bigger surfaces read as thicker.">
        <ShowcaseRow>
          {(['sm', 'md', 'lg'] as const).map((k) => (
            <View key={k} style={[styles.elevationCard, tokens.shadow[k]]}>
              <Text variant="label">shadow.{k}</Text>
            </View>
          ))}
        </ShowcaseRow>
      </Section>

      <Section title="Layout constants" description="Shared shell rules — sidebar, top bar, content max width, gutter.">
        <Stack gap="sm">
          {(
            [
              { key: 'sidebarWidth', value: tokens.layout.sidebarWidth },
              { key: 'topbarHeight', value: tokens.layout.topbarHeight },
              { key: 'contentMaxWidth', value: tokens.layout.contentMaxWidth },
              { key: 'gutter', value: tokens.layout.gutter },
            ] as const
          ).map(({ key, value }) => (
            <Row key={key} gap="md" align="center">
              <Text variant="label" style={styles.layoutKey}>{key}</Text>
              <View style={styles.layoutTrack}>
                <View
                  style={{
                    width: Math.min(value / 4, 280),
                    height: 10,
                    backgroundColor: tokens.colors.interactive.primary,
                    borderRadius: tokens.radius.pill,
                    opacity: 0.85,
                  }}
                />
              </View>
              <Text variant="caption" color="secondary">{value}px</Text>
            </Row>
          ))}
        </Stack>
      </Section>

      <Section title="Buttons" description="Variants × sizes × states (hover on pointer, active on press).">
        <ShowcaseRow>
          <Button label="Primary" variant="primary" onPress={() => {}} />
          <Button label="Secondary" variant="secondary" onPress={() => {}} />
          <Button label="Ghost" variant="ghost" onPress={() => {}} />
          <Button label="Destructive" variant="destructive" onPress={() => {}} />
        </ShowcaseRow>
        <ShowcaseRow>
          <Button label="Small" size="sm" onPress={() => {}} />
          <Button label="Medium" size="md" onPress={() => {}} />
          <Button label="Large" size="lg" onPress={() => {}} />
        </ShowcaseRow>
        <ShowcaseRow>
          <Button label="Disabled" disabled onPress={() => {}} />
          <Button label="Loading" loading onPress={() => {}} />
          <Button label="Disabled ghost" variant="ghost" disabled onPress={() => {}} />
        </ShowcaseRow>
      </Section>

      <Section title="Form controls" description="Inputs, select, checkbox, switch — default / focus / error / disabled.">
        <View style={styles.formGrid}>
          <View style={styles.formCol}>
            <Input label="Item name" value={text} onChangeText={setText} placeholder="e.g. Margherita Pizza" helperText="As it appears on the menu." />
            <Input label="With error" value="" onChangeText={() => {}} placeholder="Required" errorText="Name is required" />
            <Input label="Disabled" value="Read only" onChangeText={() => {}} disabled />
          </View>
          <View style={styles.formCol}>
            <Select
              label="Category"
              value={category}
              onValueChange={setCategory}
              placeholder="Select a category"
              options={[
                { label: 'Starters', value: 'starters' },
                { label: 'Mains', value: 'mains' },
                { label: 'Desserts', value: 'desserts' },
                { label: 'Drinks', value: 'drinks' },
              ]}
            />
            <Textarea label="Description" value={notes} onChangeText={setNotes} placeholder="Optional description…" numberOfLines={3} />
          </View>
        </View>
        <ShowcaseRow>
          <Checkbox checked={checked} onChange={setChecked} label="Available" />
          <Row gap="sm">
            <Switch value={switchOn} onValueChange={setSwitchOn} />
            <Text variant="body">Accepting orders</Text>
          </Row>
        </ShowcaseRow>
      </Section>

      <Section title="Cards & surfaces">
        <ShowcaseRow>
          <View style={{ width: 280 }}>
            <Card>
              <CardHeader title="Card title" subtitle="With header + subtitle" right={<Badge label="New" tone="info" />} />
              <Text variant="body" color="secondary">Cards are the base container for content across the dashboard.</Text>
            </Card>
          </View>
          <View style={{ width: 280 }}>
            <Card elevation="md">
              <Text variant="title">Elevated card</Text>
              <Box py="sm" />
              <Text variant="body" color="secondary">shadow.md — for raised, focal content.</Text>
            </Card>
          </View>
        </ShowcaseRow>
      </Section>

      <Section title="Badges & status" description="Single mapping from order status → semantic tone.">
        <ShowcaseRow>
          <Badge label="Success" tone="success" />
          <Badge label="Warning" tone="warning" />
          <Badge label="Danger" tone="danger" />
          <Badge label="Info" tone="info" />
          <Badge label="Neutral" tone="neutral" />
        </ShowcaseRow>
        <ShowcaseRow>
          {ORDER_STATUSES.map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </ShowcaseRow>
      </Section>

      <Section title="Tabs">
        <Tabs
          tabs={[
            { key: 'overview', label: 'Overview' },
            { key: 'items', label: 'Items' },
            { key: 'history', label: 'History' },
          ]}
          activeKey={tab}
          onChange={setTab}
        />
        <Text variant="bodySm" color="secondary">Active tab: {tab}</Text>
      </Section>

      <Section
        title="Navigation"
        description="SideNav + TopBar — the shell primitives used by the dashboard layout."
      >
        <View style={styles.navDemo}>
          <SideNav
            activeKey={navKey}
            onSelect={setNavKey}
            header={
              <Text variant="title" color="primary">
                Odyssey
              </Text>
            }
            items={[
              { key: 'home', label: 'Home', icon: <Icon name="home" size={18} /> },
              { key: 'orders', label: 'Orders', icon: <Icon name="orders" size={18} /> },
              { key: 'menu', label: 'Menu', icon: <Icon name="menu" size={18} /> },
              { key: 'customers', label: 'Customers', icon: <Icon name="customers" size={18} /> },
              { key: 'settings', label: 'Settings', icon: <Icon name="settings" size={18} /> },
            ]}
          />
          <View style={styles.navDemoMain}>
            <TopBar title="Orders" subtitle="Shell chrome" right={<Button label="Action" size="sm" onPress={() => {}} />} />
            <View style={styles.navDemoBody}>
              <Text variant="body" color="secondary">
                Active: {navKey}
              </Text>
            </View>
          </View>
        </View>
      </Section>

      <Section title="Table" description="Generic table with header, rows, loading, and empty states.">
        <Card padded={false}>
          <Table columns={DEMO_COLUMNS} data={DEMO_ROWS} keyExtractor={(r) => r.id} onRowPress={() => {}} />
        </Card>
        <Text variant="overline" color="secondary">Loading</Text>
        <Card padded={false}>
          <Table columns={DEMO_COLUMNS} data={[]} keyExtractor={(r) => r.id} isLoading />
        </Card>
        <Text variant="overline" color="secondary">Empty</Text>
        <Card padded={false}>
          <Table columns={DEMO_COLUMNS} data={[]} keyExtractor={(r) => r.id} emptyTitle="No items yet" emptyDescription="Add your first menu item to get started." />
        </Card>
      </Section>

      <Section title="Overlays & feedback" description="Modal, confirm dialog, drawer, and toasts.">
        <ShowcaseRow>
          <Button label="Open modal" onPress={() => setModalOpen(true)} />
          <Button label="Confirm dialog" variant="secondary" onPress={() => setConfirmOpen(true)} />
          <Button label="Open drawer" variant="secondary" onPress={() => setDrawerOpen(true)} />
        </ShowcaseRow>
        <ShowcaseRow>
          <Button label="Success toast" variant="ghost" onPress={() => toast.show({ title: 'Saved', description: 'Settings updated.', tone: 'success' })} />
          <Button label="Error toast" variant="ghost" onPress={() => toast.show({ title: 'Something went wrong', tone: 'error' })} />
          <Button label="Info toast" variant="ghost" onPress={() => toast.show({ title: 'Heads up', description: 'Order #1042 is ready.', tone: 'info' })} />
        </ShowcaseRow>
      </Section>

      <Section title="Loading, empty & error states" description="Reusable feedback components — not per-page inline markup.">
        <ShowcaseRow>
          <View style={styles.stateBox}><LoadingState label="Loading orders…" /></View>
          <View style={styles.stateBox}>
            <EmptyState icon={<Icon name="orders" color="muted" size={30} />} title="No orders yet" description="New orders will show up here." />
          </View>
          <View style={styles.stateBox}><ErrorState description="Couldn’t load data." onRetry={() => {}} /></View>
        </ShowcaseRow>
        <Text variant="overline" color="secondary">Skeletons</Text>
        <Row gap="lg" align="flex-start">
          <Skeleton width={120} height={40} radius="md" />
          <View style={{ width: 240 }}><SkeletonText lines={3} /></View>
        </Row>
      </Section>

      <Section title="Callouts" description="Inline success / warning / danger / info patterns (persist in context, unlike toasts).">
        <Callout tone="success" title="Order placed">Order #1042 was created and is now pending.</Callout>
        <Callout tone="warning" title="Not accepting orders">New orders are paused in Settings.</Callout>
        <Callout tone="danger" title="Item unavailable">Remove unavailable items before placing the order.</Callout>
        <Callout tone="info" title="Heads up">An order older than an hour is always at least “ready”.</Callout>
      </Section>

      <Section title="Grid" description="Responsive auto-wrapping layout primitive (layout/grid rules). Wash tones match Home KPIs.">
        <Grid minChildWidth={180} gap="md">
          {(
            [
              { label: 'Total orders', wash: 'lavender' as const },
              { label: 'Revenue', wash: 'mint' as const },
              { label: 'Pending', wash: 'peach' as const },
              { label: 'Popular', wash: 'gold' as const },
            ] as const
          ).map(({ label, wash }) => (
            <Card key={label} style={{ backgroundColor: tokens.colors.wash[wash] }}>
              <Text variant="overline" color="secondary">{label}</Text>
              <Text variant="h2">—</Text>
            </Card>
          ))}
        </Grid>
      </Section>

      <View style={{ height: tokens.spacing['4xl'] }} />
      </ScrollView>

      <Modal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add menu item"
        footer={
          <Row gap="sm" justify="flex-end">
            <Button label="Cancel" variant="secondary" onPress={() => setModalOpen(false)} />
            <Button label="Save" onPress={() => { setModalOpen(false); toast.show({ title: 'Item saved', tone: 'success' }); }} />
          </Row>
        }
      >
        <Stack gap="md">
          <Input label="Name" value={text} onChangeText={setText} placeholder="Item name" />
          <Textarea label="Description" value={notes} onChangeText={setNotes} numberOfLines={3} />
        </Stack>
      </Modal>

      <ConfirmDialog
        visible={confirmOpen}
        title="Delete item?"
        message="This will permanently remove the item from your menu. This cannot be undone."
        tone="danger"
        confirmLabel="Delete"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => { setConfirmOpen(false); toast.show({ title: 'Item deleted', tone: 'info' }); }}
      />

      <Drawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} title="Order #1042">
        <Stack gap="md">
          <Row justify="space-between"><Text variant="body" color="secondary">Status</Text><StatusBadge status="preparing" /></Row>
          <Row justify="space-between"><Text variant="body" color="secondary">Customer</Text><Text variant="bodyStrong">Ava Thompson</Text></Row>
          <Row justify="space-between"><Text variant="body" color="secondary">Total</Text><Text variant="bodyStrong">$36.00</Text></Row>
        </Stack>
      </Drawer>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { flex: 1, backgroundColor: tokens.colors.surface.raised },
  content: { padding: tokens.spacing['2xl'], maxWidth: 1000, width: '100%', alignSelf: 'center' },
  header: { marginBottom: tokens.spacing['2xl'], gap: tokens.spacing.xs },
  elevationCard: {
    width: 140,
    height: 80,
    backgroundColor: tokens.colors.surface.base,
    borderRadius: tokens.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layoutKey: { width: 140 },
  layoutTrack: {
    flex: 1,
    maxWidth: 300,
    height: 10,
    backgroundColor: tokens.colors.surface.sunken,
    borderRadius: tokens.radius.pill,
    overflow: 'hidden',
  },
  iconCell: { width: 74 },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.colors.surface.sunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.xl },
  formCol: { flex: 1, minWidth: 260, gap: tokens.spacing.md },
  navDemo: {
    flexDirection: 'row',
    height: 280,
    borderRadius: tokens.radius.lg,
    borderWidth: tokens.border.hairline,
    borderColor: tokens.colors.border.subtle,
    overflow: 'hidden',
    backgroundColor: tokens.colors.surface.raised,
  },
  navDemoMain: { flex: 1, minWidth: 0 },
  navDemoBody: { padding: tokens.spacing.lg },
  stateBox: {
    width: 240,
    height: 200,
    backgroundColor: tokens.colors.surface.base,
    borderRadius: tokens.radius.lg,
    borderWidth: tokens.border.hairline,
    borderColor: tokens.colors.border.subtle,
    justifyContent: 'center',
  },
});
