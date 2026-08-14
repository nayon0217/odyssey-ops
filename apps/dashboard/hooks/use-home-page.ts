import { useGetHomeSummary } from '@odyssey/api-client';
import type { GetHomeSummary200 } from '@odyssey/types';

/**
 * Orchestrates the Home page: fetches the dashboard summary via the generated hook.
 * All data-shaping lives here so the page component stays presentational.
 */
export function useHomePage() {
  const query = useGetHomeSummary();

  return {
    // The mutator throws on non-2xx, so a resolved response is always the success body.
    summary: query.data?.data as GetHomeSummary200 | undefined,
    isLoading: query.isLoading,
    isError: Boolean(query.error),
    refetch: query.refetch,
  };
}
