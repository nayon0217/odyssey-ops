import { View, StyleSheet } from 'react-native';
import {
  Card,
  CardHeader,
  Table,
  Badge,
  StatusBadge,
  Row,
  Stack,
  Text,
  Skeleton,
  LoadingState,
  ErrorState,
  EmptyState,
  Grid,
  Icon,
  tokens,
  type Column,
  type IconName,
} from '@odyssey/ui';
import type { GetHomeSummary200RecentOrdersItem } from '@odyssey/types';
import { PageScaffold } from '../../components/PageScaffold';
import { useHomePage } from '../../hooks/use-home-page';
import { formatMoney, formatRelative } from '../../lib/format';

export default function HomePage() {
  const page = useHomePage();

  const columns: Column<GetHomeSummary200RecentOrdersItem>[] = [
    {
      key: 'orderNumber',
      header: 'Order',
      width: 90,
      render: (o) => <Text variant="bodyStrong">#{o.orderNumber}</Text>,
    },
    { key: 'customer', header: 'Customer', render: (o) => <Text variant="body">{o.customerName ?? '—'}</Text> },
    {
      key: 'status',
      header: 'Status',
      width: 130,
      render: (o) => <StatusBadge status={o.status} />,
    },
    {
      key: 'total',
      header: 'Total',
      width: 100,
      align: 'right',
      render: (o) => <Text variant="body">{formatMoney(o.totalCents)}</Text>,
    },
    {
      key: 'placed',
      header: 'Placed',
      width: 110,
      align: 'right',
      render: (o) => (
        <Text variant="bodySm" color="muted">
          {formatRelative(o.createdAt)}
        </Text>
      ),
    },
  ];

  return (
    <PageScaffold title="Home" subtitle="Today at a glance">
      {page.isError ? (
        <ErrorState description="Couldn’t load the dashboard." onRetry={page.refetch} />
      ) : page.isLoading ? (
        <Stack gap="lg">
          <Row gap="lg" wrap="wrap">
            {Array.from({ length: 4 }).map((_, i) => (
              <View key={i} style={styles.statCol}>
                <Card>
                  <Stack gap="sm">
                    <Skeleton height={12} width="50%" />
                    <Skeleton height={28} width="70%" />
                  </Stack>
                </Card>
              </View>
            ))}
          </Row>
          <Card padded={false}>
            <View style={styles.loading}>
              <LoadingState label="Loading dashboard…" />
            </View>
          </Card>
        </Stack>
      ) : page.summary ? (
        <Stack gap="lg">
          <Grid minChildWidth={240} gap="lg">
            <StatCard label="Total orders" value={String(page.summary.totalOrders)} icon="orders" tone="lavender" />
            <StatCard label="Revenue" value={formatMoney(page.summary.revenueCents)} icon="revenue" tone="mint" />
            <StatCard label="Pending orders" value={String(page.summary.pendingOrders)} icon="timer" tone="peach" />
            <StatCard
              label="Top item"
              value={page.summary.popularItems[0]?.name ?? '—'}
              icon="star"
              tone="gold"
              kind="text"
              hint={
                page.summary.popularItems[0]
                  ? `×${page.summary.popularItems[0].quantity} sold`
                  : undefined
              }
            />
          </Grid>

          <Card>
            <CardHeader title="Popular items" />
            {page.summary.popularItems.length === 0 ? (
              <EmptyState title="No items sold yet" description="Popular items will show up here once orders come in." />
            ) : (
              <Stack gap="md">
                {page.summary.popularItems.map((item) => (
                  <Row key={item.menuItemId} justify="space-between">
                    <Text variant="body">{item.name}</Text>
                    <Badge label={`×${item.quantity}`} tone="neutral" />
                  </Row>
                ))}
              </Stack>
            )}
          </Card>

          <Card padded={false}>
            <View style={styles.tableHeader}>
              <Text variant="title">Recent orders</Text>
            </View>
            {page.summary.totalOrders === 0 ? (
              <EmptyState title="No orders yet" description="Orders will appear here as they come in." />
            ) : (
              <Table
                columns={columns}
                data={page.summary.recentOrders}
                keyExtractor={(o) => o.id}
                emptyTitle="No recent orders"
                emptyDescription="Orders will appear here as they come in."
                testID="home-recent-orders-table"
              />
            )}
          </Card>
        </Stack>
      ) : null}
    </PageScaffold>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  tone,
  kind = 'number',
}: {
  label: string;
  value: string;
  hint?: string;
  icon: IconName;
  tone: keyof typeof tokens.colors.wash;
  kind?: 'number' | 'text';
}) {
  return (
    <Card style={{ backgroundColor: tokens.colors.wash[tone] }}>
      <Stack gap="lg">
        <View style={[styles.statTile, { backgroundColor: tokens.colors.washTile[tone] }]}>
          <Icon name={icon} color={tokens.colors.washInk[tone]} size={22} strokeWidth={2} />
        </View>
        <Stack gap="xs">
          {kind === 'number' ? (
            <Text variant="statSm" numberOfLines={1} style={styles.statValue}>
              {value}
            </Text>
          ) : (
            <Text variant="h2" numberOfLines={1} style={styles.statValue}>
              {value}
            </Text>
          )}
          <Text variant="overline" color="secondary">
            {label}
          </Text>
          {hint ? (
            <Text variant="bodySm" color="muted">
              {hint}
            </Text>
          ) : null}
        </Stack>
      </Stack>
    </Card>
  );
}

const styles = StyleSheet.create({
  statCol: { flexBasis: 220, flexGrow: 1, minWidth: 200 },
  statTile: {
    width: 44,
    height: 44,
    borderRadius: tokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Let long currency values wrap / shrink the line box instead of clipping mid-digit.
  statValue: {
    flexShrink: 1,
    width: '100%',
  },
  loading: { padding: tokens.spacing['2xl'] },
  tableHeader: {
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.sm,
  },
});
