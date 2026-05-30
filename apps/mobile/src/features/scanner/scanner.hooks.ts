import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RecentScanFilters, ScanQrInput, ScannerEventFilters } from './scanner.api';
import * as scannerApi from './scanner.api';

export const scannerQueryKeys = {
  all: ['scanner'] as const,
  events: (filters: ScannerEventFilters = {}) => [...scannerQueryKeys.all, 'events', filters] as const,
  recent: (filters: RecentScanFilters = {}) => [...scannerQueryKeys.all, 'recent', filters] as const,
};

export function useScannerEventsQuery(filters: ScannerEventFilters = {}) {
  return useQuery({
    queryKey: scannerQueryKeys.events(filters),
    queryFn: () => scannerApi.listScannerEvents(filters),
  });
}

export function useRecentScansQuery(filters: RecentScanFilters = {}) {
  return useQuery({
    queryKey: scannerQueryKeys.recent(filters),
    queryFn: () => scannerApi.listRecentScans(filters),
  });
}

export function useScanQrMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ScanQrInput) => scannerApi.scanQrTicket(input),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: scannerQueryKeys.all });
    },
  });
}

export const buildRecentScanResult = scannerApi.buildRecentScanResult;
export const deserializeScannerResult = scannerApi.deserializeScannerResult;
export const normalizeScannerResult = scannerApi.normalizeScannerResult;
export const serializeScannerResult = scannerApi.serializeScannerResult;
