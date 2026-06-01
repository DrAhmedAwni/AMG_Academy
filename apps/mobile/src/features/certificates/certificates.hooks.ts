import { useQuery } from '@tanstack/react-query';
import type { CertificateFilters } from './certificates.api';
import * as certificatesApi from './certificates.api';

export const certificateQueryKeys = {
  all: ['certificates'] as const,
  lists: () => [...certificateQueryKeys.all, 'list'] as const,
  list: (filters: CertificateFilters) => [...certificateQueryKeys.lists(), filters] as const,
};

export function useCertificatesQuery(filters: CertificateFilters = {}) {
  return useQuery({
    queryKey: certificateQueryKeys.list(filters),
    queryFn: () => certificatesApi.listCertificates(filters),
  });
}
