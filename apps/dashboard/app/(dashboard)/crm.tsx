import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Card,
  Drawer,
  Table,
  Row,
  Stack,
  Divider,
  Text,
  LoadingState,
  ErrorState,
  StatusBadge,
  tokens,
  type Column,
} from '@odyssey/ui';
import type { ListCustomers200Item } from '@odyssey/types';
import { PageScaffold } from '../../components/PageScaffold';
import { useCrmPage, useCustomerDetail } from '../../hooks/use-crm-page';
import { formatMoney, formatRelative } from '../../lib/format';

export default function CrmPage() {
  const page = useCrmPage();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const columns: Column<ListCustomers200Item>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (c) => (
        <Stack gap="xxs">
          <Text variant="bodyStrong">{c.name}</Text>
          {c.email ? (
            <Text variant="caption" color="muted">
              {c.email}
            </Text>
          ) : null}
        </Stack>
      ),
    },
    {
      key: 'orders',
      header: 'Orders',
      width: 100,
      align: 'right',
      render: (c) => <Text variant="body">{c.orderCount}</Text>,
    },
    {
      key: 'spend',
      header: 'Spend',
      width: 120,
      align: 'right',
      render: (c) => <Text variant="body">{formatMoney(c.totalSpentCents)}</Text>,
    },
  ];

  return (
    <PageScaffold
      title="Customers"
      subtitle="Order history and spend"
      overlay={<CustomerDetailDrawer customerId={selectedId} onClose={() => setSelectedId(null)} />}
    >
      {page.isError ? (
        <ErrorState description="Couldn’t load customers." onRetry={page.refetch} />
      ) : (
        <Card padded={false}>
          {page.isLoading ? (
            <View style={styles.loading}>
              <LoadingState label="Loading customers…" />
            </View>
          ) : (
            <Table
              columns={columns}
              data={page.customers}
              keyExtractor={(c) => c.id}
              onRowPress={(c) => setSelectedId(c.id)}
              emptyTitle="No customers yet"
              emptyDescription="Customers will appear here once orders start coming in."
              testID="customers-table"
            />
          )}
        </Card>
      )}
    </PageScaffold>
  );
}

function CustomerDetailDrawer({ customerId, onClose }: { customerId: string | null; onClose: () => void }) {
  const { customer, isLoading } = useCustomerDetail(customerId);

  return (
    <Drawer visible={Boolean(customerId)} onClose={onClose} title={customer ? customer.name : 'Customer'} width={480}>
      {isLoading || !customer ? (
        <LoadingState label="Loading customer…" />
      ) : (
        <Stack gap="lg">
          <Stack gap="xs">
            <Text variant="bodyStrong">{customer.name}</Text>
            {customer.email ? (
              <Text variant="bodySm" color="secondary">
                {customer.email}
              </Text>
            ) : null}
            {customer.phone ? (
              <Text variant="bodySm" color="secondary">
                {customer.phone}
              </Text>
            ) : null}
          </Stack>

          <Row justify="space-between">
            <Stack gap="xxs">
              <Text variant="overline" color="secondary">
                Orders
              </Text>
              <Text variant="title">{customer.orderCount}</Text>
            </Stack>
            <Stack gap="xxs" align="flex-end">
              <Text variant="overline" color="secondary">
                Total spend
              </Text>
              <Text variant="title">{formatMoney(customer.totalSpentCents)}</Text>
            </Stack>
          </Row>

          <Divider />

          <Stack gap="sm">
            <Text variant="overline" color="secondary">
              Recent orders
            </Text>
            {customer.recentOrders.length === 0 ? (
              <Text variant="bodySm" color="muted">
                No orders yet.
              </Text>
            ) : (
              customer.recentOrders.map((o) => (
                <Row key={o.id} justify="space-between" align="center">
                  <Row gap="sm" align="center">
                    <Text variant="body">#{o.orderNumber}</Text>
                    <StatusBadge status={o.status} />
                  </Row>
                  <Stack gap="xxs" align="flex-end">
                    <Text variant="body">{formatMoney(o.totalCents)}</Text>
                    <Text variant="caption" color="muted">
                      {formatRelative(o.createdAt)}
                    </Text>
                  </Stack>
                </Row>
              ))
            )}
          </Stack>
        </Stack>
      )}
    </Drawer>
  );
}

const styles = StyleSheet.create({
  loading: { padding: tokens.spacing['2xl'] },
});
