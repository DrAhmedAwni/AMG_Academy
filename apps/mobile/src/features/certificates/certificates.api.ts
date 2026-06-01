import { apiRequest, buildApiUrl } from '../../lib/api';
import type { PaginationMeta } from '../../types/api';

export interface MobileCertificate {
  id: string;
  certificateNumber: string;
  sourceType: 'event' | 'course';
  sourceTitle: string;
  learnerName: string;
  issuerName: string;
  status: 'released';
  issuedAt: string | null;
  releasedAt: string | null;
  hours: number | null;
  credits: number | null;
  verificationUrl: string;
  downloadUrl: string;
  publicDownloadUrl: string;
}

export interface CertificatePage {
  data: MobileCertificate[];
  meta: PaginationMeta;
}

export interface CertificateFilters {
  page?: number;
  limit?: number;
}

export async function listCertificates(filters: CertificateFilters = {}): Promise<CertificatePage> {
  const response = await apiRequest<{ data: MobileCertificate[]; meta: PaginationMeta }>(
    '/certificates',
    {
      query: {
        page: filters.page,
        limit: filters.limit,
      },
    },
  );

  return {
    data: response.data,
    meta: response.meta,
  };
}

export function getCertificatePublicDownloadUrl(certificate: MobileCertificate) {
  const apiPath = certificate.publicDownloadUrl.replace(/^\/api\/v1/, '');
  return buildApiUrl(apiPath);
}
