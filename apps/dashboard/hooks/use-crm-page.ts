import { useListCustomers, useGetCustomer } from '@odyssey/api-client';
import type { GetCustomer200 } from '@odyssey/types';

export function useCrmPage() {
  const query = useListCustomers();

  return {
    customers: query.data?.data ?? [],
    isLoading: query.isLoading,
    isError: Boolean(query.error),
    refetch: query.refetch,
  };
}

export function useCustomerDetail(customerId: string | null) {
  const query = useGetCustomer(customerId ?? '', { query: { enabled: Boolean(customerId) } });
  // The mutator throws on non-2xx, so a resolved response is always the success body.
  return {
    customer: query.data?.data as GetCustomer200 | undefined,
    isLoading: query.isLoading,
    isError: Boolean(query.error),
  };
}
