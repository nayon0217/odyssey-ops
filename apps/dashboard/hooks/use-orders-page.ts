import { useQueryClient } from '@tanstack/react-query';
import {
  useListOrders,
  useGetOrder,
  useTransitionOrder,
  type ListOrdersParams,
  type GetOrder200,
} from '@odyssey/api-client';

/** Invalidate everything a status change can affect: orders, home KPIs, customer spend. */
function useInvalidateOrderData() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey[0];
        return (
          typeof key === 'string' &&
          (key.startsWith('/orders') || key.startsWith('/home') || key.startsWith('/customers'))
        );
      },
    });
}

export function useOrdersPage(params: ListOrdersParams) {
  const invalidate = useInvalidateOrderData();
  const ordersQuery = useListOrders(params);
  const transition = useTransitionOrder({ mutation: { onSuccess: invalidate } });

  return {
    orders: ordersQuery.data?.data ?? [],
    isLoading: ordersQuery.isLoading,
    isError: Boolean(ordersQuery.error),
    refetch: ordersQuery.refetch,
    transition,
  };
}

export function useOrderDetail(orderId: string | null) {
  const query = useGetOrder(orderId ?? '', { query: { enabled: Boolean(orderId) } });
  // The mutator throws on non-2xx, so a resolved response is always the success body.
  return {
    order: query.data?.data as GetOrder200 | undefined,
    isLoading: query.isLoading,
    isError: Boolean(query.error),
  };
}
