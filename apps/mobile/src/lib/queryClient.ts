import { QueryClient } from '@tanstack/react-query';

export const privateQueryKeyRoots = [
  'auth',
  'me',
  'registrations',
  'payments',
  'qr-tickets',
  'tickets',
  'enrollments',
  'notifications',
  'certificates',
  'profile',
  'scanner',
] as const;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error) => {
        const status = typeof error === 'object' && error && 'status' in error
          ? Number(error.status)
          : 0;
        return status >= 500 && failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export async function clearPrivateQueryCache(client: QueryClient = queryClient) {
  await Promise.all(
    privateQueryKeyRoots.map((root) =>
      client.removeQueries({ queryKey: [root], exact: false }),
    ),
  );
}

export function resetAllQueryCache(client: QueryClient = queryClient) {
  client.clear();
}
