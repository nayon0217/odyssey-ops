import { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Button,
  Card,
  Modal,
  Table,
  Tabs,
  Switch,
  Input,
  Textarea,
  Select,
  Badge,
  Row,
  Stack,
  Text,
  LoadingState,
  ErrorState,
  useToast,
  tokens,
  type Column,
} from '@odyssey/ui';
import { parseMoneyToCents } from '@odyssey/shared';
import { PageScaffold } from '../../components/PageScaffold';
import { useMenuPage, type MenuItem } from '../../hooks/use-menu-page';
import { formatMoney } from '../../lib/format';

type FormState = { name: string; description: string; price: string; categoryId: string; isAvailable: boolean };
const EMPTY_FORM: FormState = { name: '', description: '', price: '', categoryId: '', isAvailable: true };

export default function MenuPage() {
  const page = useMenuPage();
  const toast = useToast();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [nameError, setNameError] = useState<string>();

  const categoryTabs = useMemo(
    () => [{ key: 'all', label: 'All' }, ...page.categories.map((c) => ({ key: c.id, label: c.name }))],
    [page.categories],
  );

  const visibleItems = useMemo(() => {
    if (activeCategory === 'all') return page.items;
    return page.itemsByCategory.get(activeCategory) ?? [];
  }, [activeCategory, page.items, page.itemsByCategory]);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, categoryId: page.categories[0]?.id ?? '' });
    setNameError(undefined);
    setModalOpen(true);
  }

  function openEdit(item: MenuItem) {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description ?? '',
      price: (item.priceCents / 100).toFixed(2),
      categoryId: item.categoryId,
      isAvailable: item.isAvailable,
    });
    setNameError(undefined);
    setModalOpen(true);
  }

  function save() {
    if (!form.name.trim()) {
      setNameError('Name is required');
      return;
    }
    const data = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      priceCents: parseMoneyToCents(form.price),
      categoryId: form.categoryId,
      isAvailable: form.isAvailable,
    };
    const onSuccess = () => {
      setModalOpen(false);
      toast.show({ title: editing ? 'Item updated' : 'Item created', tone: 'success' });
    };
    const onError = () => toast.show({ title: 'Could not save item', tone: 'error' });

    if (editing) {
      page.updateItem.mutate({ id: editing.id, data }, { onSuccess, onError });
    } else {
      page.createItem.mutate({ data }, { onSuccess, onError });
    }
  }

  const columns: Column<MenuItem>[] = [
    {
      key: 'name',
      header: 'Item',
      render: (item) => (
        <Stack gap="xxs">
          <Text variant="bodyStrong">{item.name}</Text>
          {item.description ? (
            <Text variant="caption" color="muted" numberOfLines={1}>
              {item.description}
            </Text>
          ) : null}
        </Stack>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      width: 140,
      render: (item) => (
        <Badge label={page.categoriesById.get(item.categoryId)?.name ?? '—'} tone="neutral" />
      ),
    },
    {
      key: 'price',
      header: 'Price',
      width: 110,
      align: 'right',
      render: (item) => <Text variant="body">{formatMoney(item.priceCents)}</Text>,
    },
    {
      key: 'availability',
      header: 'Available',
      width: 120,
      render: (item) => (
        <Switch
          value={item.isAvailable}
          onValueChange={() => page.toggleAvailability(item)}
          testID={`avail-${item.id}`}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      width: 90,
      align: 'right',
      render: (item) => <Button label="Edit" variant="ghost" size="sm" onPress={() => openEdit(item)} />,
    },
  ];

  return (
    <PageScaffold
      title="Menu"
      subtitle="Manage categories, items, prices, and availability"
      actions={<Button label="Add item" onPress={openCreate} />}
      overlay={
        <Modal
          visible={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editing ? 'Edit item' : 'Add item'}
          testID="menu-item-modal"
          footer={
            <>
              <Button label="Cancel" variant="secondary" onPress={() => setModalOpen(false)} />
              <Button
                label={editing ? 'Save changes' : 'Create item'}
                onPress={save}
                loading={page.createItem.isPending || page.updateItem.isPending}
              />
            </>
          }
        >
          <Stack gap="md">
            <Input
              label="Name"
              value={form.name}
              onChangeText={(name) => setForm((f) => ({ ...f, name }))}
              placeholder="e.g. Margherita Pizza"
              errorText={nameError}
            />
            <Textarea
              label="Description"
              value={form.description}
              onChangeText={(description) => setForm((f) => ({ ...f, description }))}
              placeholder="Optional"
              numberOfLines={2}
            />
            <Row gap="md" align="flex-start">
              <View style={styles.flex}>
                <Input
                  label="Price (USD)"
                  value={form.price}
                  onChangeText={(price) => setForm((f) => ({ ...f, price }))}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.flex}>
                <Select
                  label="Category"
                  value={form.categoryId}
                  onValueChange={(categoryId) => setForm((f) => ({ ...f, categoryId }))}
                  options={page.categories.map((c) => ({ label: c.name, value: c.id }))}
                  placeholder="Select"
                />
              </View>
            </Row>
            <Row gap="sm">
              <Switch
                value={form.isAvailable}
                onValueChange={(isAvailable) => setForm((f) => ({ ...f, isAvailable }))}
              />
              <Text variant="body">Available for ordering</Text>
            </Row>
          </Stack>
        </Modal>
      }
    >
      {page.isError ? (
        <ErrorState description="Couldn’t load the menu." onRetry={page.refetch} />
      ) : (
        <Stack gap="lg">
          <Tabs tabs={categoryTabs} activeKey={activeCategory} onChange={setActiveCategory} />
          <Card padded={false}>
            {page.isLoading ? (
              <View style={styles.loading}>
                <LoadingState label="Loading menu…" />
              </View>
            ) : (
              <Table
                columns={columns}
                data={visibleItems}
                keyExtractor={(item) => item.id}
                emptyTitle="No items in this category"
                emptyDescription="Add your first item to get started."
                testID="menu-items-table"
              />
            )}
          </Card>
        </Stack>
      )}
    </PageScaffold>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loading: { padding: tokens.spacing['2xl'] },
});
