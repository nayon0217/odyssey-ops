import { useQueryClient } from '@tanstack/react-query';
import { useGetSettings, useUpdateSettings } from '@odyssey/api-client';
import type { GetSettings200 } from '@odyssey/types';

export function useSettingsPage() {
  const queryClient = useQueryClient();
  const query = useGetSettings();
  const update = useUpdateSettings({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/settings'] }) },
  });

  return {
    settings: query.data?.data as GetSettings200 | undefined,
    isLoading: query.isLoading,
    isError: Boolean(query.error),
    refetch: query.refetch,
    update,
  };
}
