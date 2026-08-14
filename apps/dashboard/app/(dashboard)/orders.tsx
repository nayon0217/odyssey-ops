import { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Card,
  Drawer,
  Modal,
  Table,
  Select,
  Input,
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
} from '@odyssey/shared';
import type { OrderAction, ListOrders200Item, ListOrdersStatus } from '@odyssey/types';
import { PageScaffold } from '../../components/PageScaffold';
import { useOrdersPage, useOrderDetail, useNewOrder } from '../../hooks/use-orders-page';
import { formatMoney, formatRelative, normalizeYyyymmddInput, yyyymmddToIsoBound } from '../../lib/format';
import {
  computeDraftTotalCents,
  isDraftValid,
  toOrderItems,
  type DraftLine,
} from '../../lib/order-draft';

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
  const [customerFilter, setCustomerFilter] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newOrderOpen, setNewOrderOpen] = useState(false);

  const params = useMemo(
    () => ({
      status: (statusFilter || undefined) as ListOrdersStatus | undefined,
      customerId: customerFilter || undefined,
      from: yyyymmddToIsoBound(fromDate, 'start'),
      to: yyyymmddToIsoBound(toDate, 'end'),
    }),
    [statusFilter, customerFilter, fromDate, toDate],
  );
  const page = useOrdersPage(params);

  const statusOptions = [
    { label: 'All statuses', value: '' },
    ...ORDER_STATUSES.map((s) => ({ label: ORDER_STATUS_LABELS[s], value: s })),
  ];
  const customerOptions = [
    { label: 'All customers', value: '' },
    ...page.customers.map((c) => ({ label: c.name, value: c.id })),
  ];
  const hasFilters = Boolean(statusFilter || customerFilter || fromDate || toDate);

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
    <PageScaffold
      title="Orders"
      subtitle="Track and advance orders through their lifecycle"
      actions={<Button label="New order" onPress={() => setNewOrderOpen(true)} />}
      overlay={
        <>
          <OrderDetailDrawer
            orderId={selectedId}
            onClose={() => setSelectedId(null)}
            isTransitioning={page.transition.isPending}
            onAction={(id, action) =>
              page.transition.mutate(
                { id, data: { action } },
                {
                  onSuccess: () =>
                    toast.show({ title: `Order ${ORDER_ACTION_LABELS[action].toLowerCase()}`, tone: 'success' }),
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
          <NewOrderModal visible={newOrderOpen} onClose={() => setNewOrderOpen(false)} />
        </>
      }
    >
      <Row gap="md" wrap="wrap" style={styles.filters}>
        <View style={styles.filterSelect}>
          <Select value={statusFilter} onValueChange={setStatusFilter} options={statusOptions} placeholder="Status" />
        </View>
        <View style={styles.filterSelect}>
          <Select value={customerFilter} onValueChange={setCustomerFilter} options={customerOptions} placeholder="Customer" />
        </View>
        <View style={styles.filterDate}>
          <Input
            value={fromDate}
            onChangeText={(v) => setFromDate(normalizeYyyymmddInput(v))}
            placeholder="From (yyyymmdd)"
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.filterDate}>
          <Input
            value={toDate}
            onChangeText={(v) => setToDate(normalizeYyyymmddInput(v))}
            placeholder="To (yyyymmdd)"
            keyboardType="number-pad"
          />
        </View>
        {hasFilters ? (
          <Button
            label="Clear"
            variant="ghost"
            size="sm"
            onPress={() => {
              setStatusFilter('');
              setCustomerFilter('');
              setFromDate('');
              setToDate('');
            }}
          />
        ) : null}
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
  const actions = order ? getAvailableActions(order.status) : [];

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
            <StatusBadge status={order.status} />
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

function NewOrderModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const toast = useToast();
  const { customers, availableItems, createOrder } = useNewOrder();
  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState<DraftLine[]>([{ menuItemId: '', quantity: 1 }]);
  const [notes, setNotes] = useState('');

  const priceById = useMemo(
    () => new Map(availableItems.map((item) => [item.id, item.priceCents])),
    [availableItems],
  );
  const totalCents = computeDraftTotalCents(lines, priceById);
  const valid = isDraftValid(customerId, lines);

  const itemOptions = availableItems.map((item) => ({
    label: `${item.name} · ${formatMoney(item.priceCents)}`,
    value: item.id,
  }));
  const customerOptions = customers.map((customer) => ({ label: customer.name, value: customer.id }));

  function reset() {
    setCustomerId('');
    setLines([{ menuItemId: '', quantity: 1 }]);
    setNotes('');
  }
  function updateLine(index: number, patch: Partial<DraftLine>) {
    setLines((ls) => ls.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  function submit() {
    createOrder.mutate(
      { data: { customerId, items: toOrderItems(lines), notes: notes.trim() || undefined } },
      {
        onSuccess: () => {
          toast.show({ title: 'Order placed', tone: 'success' });
          reset();
          onClose();
        },
        onError: (err) =>
          toast.show({
            title: 'Could not place order',
            description: err instanceof Error ? err.message : undefined,
            tone: 'error',
          }),
      },
    );
  }

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="New order"
      width={560}
      testID="new-order-modal"
      footer={
        <>
          <Button label="Cancel" variant="secondary" onPress={onClose} />
          <Button label="Place order" onPress={submit} disabled={!valid} loading={createOrder.isPending} />
        </>
      }
    >
      <Stack gap="md">
        <Select
          label="Customer"
          value={customerId}
          onValueChange={setCustomerId}
          options={customerOptions}
          placeholder="Select a customer"
        />
        <Stack gap="sm">
          <Text variant="label">Items</Text>
          {lines.map((line, index) => (
            <Row key={index} gap="sm" align="flex-start">
              <View style={styles.lineItem}>
                <Select
                  value={line.menuItemId}
                  onValueChange={(v) => updateLine(index, { menuItemId: v })}
                  options={itemOptions}
                  placeholder="Menu item"
                />
              </View>
              <View style={styles.lineQty}>
                <Input
                  value={String(line.quantity)}
                  onChangeText={(v) => updateLine(index, { quantity: Number(v.replace(/[^0-9]/g, '')) || 0 })}
                  keyboardType="number-pad"
                />
              </View>
              <Button
                label="Remove"
                variant="ghost"
                size="sm"
                onPress={() => setLines((ls) => (ls.length > 1 ? ls.filter((_, i) => i !== index) : ls))}
              />
            </Row>
          ))}
          <Button
            label="+ Add item"
            variant="ghost"
            size="sm"
            onPress={() => setLines((ls) => [...ls, { menuItemId: '', quantity: 1 }])}
          />
        </Stack>
        <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Optional" />
        <Divider />
        <Row justify="space-between">
          <Text variant="title">Estimated total</Text>
          <Text variant="title">{formatMoney(totalCents)}</Text>
        </Row>
        <Text variant="caption" color="muted">
          Final total is computed by the server from current prices.
        </Text>
      </Stack>
    </Modal>
  );
}

const styles = StyleSheet.create({
  filters: { alignItems: 'center' },
  filterSelect: { width: 190 },
  filterDate: { width: 148 },
  loading: { padding: tokens.spacing['2xl'] },
  lineItem: { flex: 1 },
  lineQty: { width: 88 },
});
