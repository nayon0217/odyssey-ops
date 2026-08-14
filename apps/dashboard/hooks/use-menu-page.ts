import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useListMenuCategories,
  useListMenuItems,
  useCreateMenuItem,
  useUpdateMenuItem,
  useCreateMenuCategory,
  getListMenuItemsQueryKey,
} from '@odyssey/api-client';
import type { ListMenuItems200Item, ListMenuCategories200Item } from '@odyssey/types';

export type MenuItem = ListMenuItems200Item;
export type MenuCategory = ListMenuCategories200Item;

type MenuItemsCache = { status: number; data: MenuItem[]; headers: Headers };

/** Stable display order: category grouping → sortOrder → name → id. */
function compareMenuItems(a: MenuItem, b: MenuItem): number {
  return (
    a.categoryId.localeCompare(b.categoryId) ||
    a.sortOrder - b.sortOrder ||
    a.name.localeCompare(b.name) ||
    a.id.localeCompare(b.id)
  );
}

/**
 * Orchestrates the Menu page: fetches categories + items via generated hooks, groups
 * items by category, and exposes create/update mutations that invalidate on success.
 * All data-shaping lives here so the page component stays presentational.
 */
export function useMenuPage() {
  const queryClient = useQueryClient();
  const categoriesQuery = useListMenuCategories();
  const itemsQuery = useListMenuItems();

  const invalidateItems = () => queryClient.invalidateQueries({ queryKey: ['/menu-items'] });
  const invalidateCategories = () =>
    queryClient.invalidateQueries({ queryKey: ['/menu-categories'] });

  const createItem = useCreateMenuItem({ mutation: { onSuccess: invalidateItems } });
  const updateItem = useUpdateMenuItem({ mutation: { onSuccess: invalidateItems } });
  const createCategory = useCreateMenuCategory({ mutation: { onSuccess: invalidateCategories } });

  const categories = categoriesQuery.data?.data ?? [];
  const items = useMemo(() => {
    const raw = itemsQuery.data?.data ?? [];
    return [...raw].sort(compareMenuItems);
  }, [itemsQuery.data?.data]);

  const categoriesById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const itemsByCategory = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of items) {
      const list = map.get(item.categoryId) ?? [];
      list.push(item);
      map.set(item.categoryId, list);
    }
    return map;
  }, [items]);

  return {
    categories,
    categoriesById,
    items,
    itemsByCategory,
    isLoading: categoriesQuery.isLoading || itemsQuery.isLoading,
    isError: Boolean(categoriesQuery.error || itemsQuery.error),
    refetch: () => {
      categoriesQuery.refetch();
      itemsQuery.refetch();
    },
    createItem,
    updateItem,
    createCategory,
    toggleAvailability: (item: MenuItem) => {
      const nextAvailable = !item.isAvailable;
      const queryKey = getListMenuItemsQueryKey();
      const previous = queryClient.getQueryData<MenuItemsCache>(queryKey);

      // Flip in place first so the row stays put; refetch uses a stable sort.
      if (previous?.data) {
        queryClient.setQueryData<MenuItemsCache>(queryKey, {
          ...previous,
          data: previous.data.map((row) =>
            row.id === item.id ? { ...row, isAvailable: nextAvailable } : row,
          ),
        });
      }

      updateItem.mutate(
        { id: item.id, data: { isAvailable: nextAvailable } },
        {
          onError: () => {
            if (previous) queryClient.setQueryData(queryKey, previous);
          },
        },
      );
    },
  };
}
