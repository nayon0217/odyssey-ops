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
import { PageScaffold } from '../../components/PageScaffold';
import { useMenuPage, type MenuItem } from '../../hooks/use-menu-page';
import { formatMoney } from '../../lib/format';
import {
  parsePriceInput,
  validateCategoryName,
  validateMenuItemForm,
  type MenuItemFormErrors,
} from '../../lib/form-validation';

type FormState = { name: string; description: string; price: string; categoryId: string; isAvailable: boolean };
const EMPTY_FORM: FormState = { name: '', description: '', price: '', categoryId: '', isAvailable: true };

export default function MenuPage() {
  const page = useMenuPage();
  const toast = useToast();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<MenuItemFormErrors>({});
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState<string>();

  function saveCategory() {
    const error = validateCategoryName(categoryName);
    setCategoryError(error);
    if (error) return;
    page.createCategory.mutate(
      { data: { name: categoryName.trim() } },
      {
        onSuccess: () => {
          setCategoryOpen(false);
          setCategoryName('');
          setCategoryError(undefined);
          toast.show({ title: 'Category created', tone: 'success' });
        },
        onError: () => toast.show({ title: 'Could not create category', tone: 'error' }),
      },
    );
  }

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
    setFormErrors({});
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
    setFormErrors({});
    setModalOpen(true);
  }

  function save() {
    const nextErrors = validateMenuItemForm(form);
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const price = parsePriceInput(form.price);
    if ('error' in price) return;

    const data = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      priceCents: price.cents,
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
      actions={
        <Row gap="sm">
          <Button label="New category" variant="secondary" onPress={() => setCategoryOpen(true)} />
          <Button label="Add item" onPress={openCreate} />
        </Row>
      }
      overlay={
        <>
        <Modal
          visible={categoryOpen}
          onClose={() => setCategoryOpen(false)}
          title="New category"
          testID="new-category-modal"
          footer={
            <>
              <Button label="Cancel" variant="secondary" onPress={() => setCategoryOpen(false)} />
              <Button label="Create" onPress={saveCategory} loading={page.createCategory.isPending} />
            </>
          }
        >
          <Input
            label="Category name"
            value={categoryName}
            onChangeText={(v) => {
              setCategoryName(v);
              setCategoryError(undefined);
            }}
            placeholder="e.g. Specials"
            errorText={categoryError}
          />
        </Modal>
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
              onChangeText={(name) => {
                setForm((f) => ({ ...f, name }));
                setFormErrors((e) => ({ ...e, name: undefined }));
              }}
              placeholder="e.g. Margherita Pizza"
              errorText={formErrors.name}
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
                  onChangeText={(price) => {
                    setForm((f) => ({ ...f, price }));
                    setFormErrors((e) => ({ ...e, price: undefined }));
                  }}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  errorText={formErrors.price}
                />
              </View>
              <View style={styles.flex}>
                <Select
                  label="Category"
                  value={form.categoryId}
                  onValueChange={(categoryId) => {
                    setForm((f) => ({ ...f, categoryId }));
                    setFormErrors((e) => ({ ...e, categoryId: undefined }));
                  }}
                  options={page.categories.map((c) => ({ label: c.name, value: c.id }))}
                  placeholder="Select"
                  errorText={formErrors.categoryId}
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
        </>
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
