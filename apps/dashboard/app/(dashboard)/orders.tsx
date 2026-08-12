import { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Card,
  Drawer,
  Table,
  Select,
  Badge,
  StatusBadge,
  Button,
  Row,
  Stack,
  Divider,
  Text,
  LoadingState,
  ErrorState,
  useToast,
  tokens,
  type Column,
} from '@odyssey/ui';
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  ORDER_ACTION_LABELS,
  getAvailableActions,
  type OrderStatus,
  type OrderAction,
} from '@odyssey/shared';
import type { ListOrders200Item, ListOrdersStatus } from '@odyssey/api-client';
import { PageScaffold } from '../../components/PageScaffold';
import { useOrdersPage, useOrderDetail } from '../../hooks/use-orders-page';
import { formatMoney, formatRelative } from '../../lib/format';

const ACTION_VARIANT: Record<OrderAction, 'primary' | 'secondary' | 'destructive'> = {
  accept: 'primary',
  start_preparing: 'primary',
  mark_ready: 'primary',
  complete: 'primary',
  cancel: 'destructive',
};

export default function OrdersPage() {
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const params = useMemo(
    () => ({ status: (statusFilter || undefined) as ListOrdersStatus | undefined }),
    [statusFilter],
  );
  const page = useOrdersPage(params);

  const statusOptions = [
    { label: 'All statuses', value: '' },
    ...ORDER_STATUSES.map((s) => ({ label: ORDER_STATUS_LABELS[s], value: s })),
  ];

  const columns: Column<ListOrders200Item>[] = [
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
      render: (o) => <StatusBadge status={o.status as OrderStatus} />,
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
    <PageScaffold
      title="Orders"
      subtitle="Track and advance orders through their lifecycle"
      overlay={
        <OrderDetailDrawer
          orderId={selectedId}
          onClose={() => setSelectedId(null)}
          isTransitioning={page.transition.isPending}
          onAction={(id, action) =>
            page.transition.mutate(
              { id, data: { action } },
              {
                onSuccess: () => toast.show({ title: `Order ${ORDER_ACTION_LABELS[action].toLowerCase()}`, tone: 'success' }),
                onError: (err) =>
                  toast.show({
                    title: 'Action not allowed',
                    description: err instanceof Error ? err.message : undefined,
                    tone: 'error',
                  }),
              },
            )
          }
        />
      }
    >
      <Row gap="md" style={styles.filters}>
        <View style={styles.filterSelect}>
          <Select value={statusFilter} onValueChange={setStatusFilter} options={statusOptions} placeholder="Status" />
        </View>
        <Text variant="bodySm" color="muted">
          {page.orders.length} order{page.orders.length === 1 ? '' : 's'}
        </Text>
      </Row>

      {page.isError ? (
        <ErrorState description="Couldn’t load orders." onRetry={page.refetch} />
      ) : (
        <Card padded={false}>
          {page.isLoading ? (
            <View style={styles.loading}>
              <LoadingState label="Loading orders…" />
            </View>
          ) : (
            <Table
              columns={columns}
              data={page.orders}
              keyExtractor={(o) => o.id}
              onRowPress={(o) => setSelectedId(o.id)}
              emptyTitle="No orders match this filter"
              emptyDescription="Try a different status."
              testID="orders-table"
            />
          )}
        </Card>
      )}
    </PageScaffold>
  );
}

function OrderDetailDrawer({
  orderId,
  onClose,
  onAction,
  isTransitioning,
}: {
  orderId: string | null;
  onClose: () => void;
  onAction: (id: string, action: OrderAction) => void;
  isTransitioning: boolean;
}) {
  const { order, isLoading } = useOrderDetail(orderId);
  const actions = order ? getAvailableActions(order.status as OrderStatus) : [];

  return (
    <Drawer
      visible={Boolean(orderId)}
      onClose={onClose}
      title={order ? `Order #${order.orderNumber}` : 'Order'}
      width={480}
      footer={
        order && actions.length ? (
          <Row gap="sm" wrap="wrap">
            {actions.map((action) => (
              <Button
                key={action}
                label={ORDER_ACTION_LABELS[action]}
                variant={ACTION_VARIANT[action]}
                onPress={() => onAction(order.id, action)}
                loading={isTransitioning}
              />
            ))}
          </Row>
        ) : undefined
      }
    >
      {isLoading || !order ? (
        <LoadingState label="Loading order…" />
      ) : (
        <Stack gap="lg">
          <Row justify="space-between">
            <StatusBadge status={order.status as OrderStatus} />
            <Text variant="bodySm" color="muted">
              {formatRelative(order.createdAt)}
            </Text>
          </Row>

          <Stack gap="xs">
            <Text variant="overline" color="secondary">
              Customer
            </Text>
            <Text variant="bodyStrong">{order.customer?.name ?? '—'}</Text>
            {order.customer?.email ? (
              <Text variant="bodySm" color="secondary">
                {order.customer.email}
              </Text>
            ) : null}
          </Stack>

          <Divider />

          <Stack gap="sm">
            <Text variant="overline" color="secondary">
              Items
            </Text>
            {order.items.map((item) => (
              <Row key={item.id} justify="space-between">
                <Text variant="body">
                  {item.quantity}× {item.nameSnapshot}
                </Text>
                <Text variant="body">{formatMoney(item.unitPriceCentsSnapshot * item.quantity)}</Text>
              </Row>
            ))}
          </Stack>

          <Divider />

          <Row justify="space-between">
            <Text variant="title">Total</Text>
            <Text variant="title">{formatMoney(order.totalCents)}</Text>
          </Row>

          {order.notes ? (
            <Stack gap="xs">
              <Text variant="overline" color="secondary">
                Notes
              </Text>
              <Text variant="body" color="secondary">
                {order.notes}
              </Text>
            </Stack>
          ) : null}

          {actions.length === 0 ? (
            <Badge label="No further actions" tone="neutral" />
          ) : null}
        </Stack>
      )}
    </Drawer>
  );
}

const styles = StyleSheet.create({
  filters: { alignItems: 'center' },
  filterSelect: { width: 200 },
  loading: { padding: tokens.spacing['2xl'] },
});
