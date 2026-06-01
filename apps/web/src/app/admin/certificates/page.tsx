'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Award, Ban, CheckCircle2, Download, ExternalLink, RotateCcw, Search, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Badge, Button, Card, FilterPill, Input, PageHeader } from '@/components/ui';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/states';
import { api } from '@/lib/api';

interface AdminCertificate {
  id: string;
  certificateNumber: string;
  learnerName: string;
  sourceType: string;
  sourceTitle: string;
  issuerName: string;
  status: string;
  issuedAt: string | null;
  releasedAt: string | null;
  createdAt: string;
  hours: number | null;
  credits: number | null;
  verificationUrl: string;
  downloadUrl: string;
  user: { id: string; name: string; email: string };
  reviewedBy: { id: string; name: string } | null;
  invalidReason: string | null;
}

type Filter = 'all' | 'pending_review' | 'released' | 'revoked' | 'voided';

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending_review', label: 'Pending' },
  { value: 'released', label: 'Released' },
  { value: 'revoked', label: 'Revoked' },
  { value: 'voided', label: 'Voided' },
];

function readItems(payload: any): AdminCertificate[] {
  const unwrapped = payload?.data ?? payload;
  if (Array.isArray(unwrapped?.data)) return unwrapped.data;
  if (Array.isArray(unwrapped)) return unwrapped;
  return [];
}

function statusTone(status: string) {
  switch (status) {
    case 'released':
      return 'success';
    case 'pending_review':
      return 'warning';
    case 'revoked':
    case 'voided':
      return 'error';
    default:
      return 'default';
  }
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : '-';
}

export default function AdminCertificatesPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('pending_review');
  const queryClient = useQueryClient();

  const certificatesQuery = useQuery({
    queryKey: ['admin-certificates', search, filter],
    queryFn: async () => {
      const { data } = await api.get('/certificates/admin', {
        params: {
          search: search || undefined,
          status: filter === 'all' ? undefined : filter,
          limit: 100,
        },
      });
      return data;
    },
  });

  const invalidateList = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin-certificates'] });
  };

  const releaseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/certificates/admin/${id}/release`, {
        reviewNotes: 'Released from admin queue',
      });
      return data;
    },
    onSuccess: async () => {
      toast.success('Certificate released');
      await invalidateList();
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.error?.message ?? 'Failed to release certificate'),
  });

  const revokeMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data } = await api.post(`/certificates/admin/${id}/revoke`, { reason });
      return data;
    },
    onSuccess: async () => {
      toast.success('Certificate revoked');
      await invalidateList();
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.error?.message ?? 'Failed to revoke certificate'),
  });

  const voidMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data } = await api.post(`/certificates/admin/${id}/void`, { reason });
      return data;
    },
    onSuccess: async () => {
      toast.success('Certificate voided');
      await invalidateList();
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.error?.message ?? 'Failed to void certificate'),
  });

  const certificates = useMemo(() => readItems(certificatesQuery.data), [certificatesQuery.data]);

  const requestReason = (fallback: string) => {
    const reason = window.prompt('Reason for this certificate action', fallback);
    return reason?.trim() ? reason.trim() : null;
  };

  if (certificatesQuery.isLoading) return <LoadingSkeleton lines={8} />;
  if (certificatesQuery.isError) {
    return (
      <ErrorState
        title="Failed to load certificates"
        description={certificatesQuery.error?.message ?? 'Something went wrong'}
        onRetry={certificatesQuery.refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates"
        accent="Review"
        description="Review generated course and event certificates before users can download them."
      />

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              placeholder="Search learner, certificate, or source..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <FilterPill
                key={item.value}
                active={filter === item.value}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </FilterPill>
            ))}
          </div>
        </div>
      </Card>

      {certificates.length === 0 ? (
        <EmptyState
          title="No certificates"
          description="There are no certificates matching the current filters."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-background-card">
          <table className="w-full min-w-[980px] text-left text-sm text-text-secondary">
            <thead className="bg-background-elevated text-text-primary">
              <tr>
                <th className="px-4 py-3">Learner</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Certificate</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Issued</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {certificates.map((certificate) => (
                <tr key={certificate.id} className="hover:bg-background-elevated/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-text-primary">{certificate.learnerName}</p>
                    <p className="text-xs text-text-muted">{certificate.user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <Award className="mt-0.5 h-4 w-4 text-cyan" />
                      <div>
                        <p className="font-medium text-text-primary">{certificate.sourceTitle}</p>
                        <p className="text-xs capitalize text-text-muted">{certificate.sourceType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-text-primary">
                    {certificate.certificateNumber}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusTone(certificate.status) as any}>
                      {certificate.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{formatDate(certificate.issuedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {certificate.status === 'pending_review' ? (
                        <Button
                          size="sm"
                          onClick={() => releaseMutation.mutate(certificate.id)}
                          disabled={releaseMutation.isPending}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Release
                        </Button>
                      ) : null}
                      {certificate.status === 'released' ? (
                        <>
                          <a href={certificate.downloadUrl}>
                            <Button size="sm" variant="secondary">
                              <Download className="h-4 w-4" />
                              PDF
                            </Button>
                          </a>
                          <a href={certificate.verificationUrl} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="secondary">
                              <ExternalLink className="h-4 w-4" />
                              Verify
                            </Button>
                          </a>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              const reason = requestReason('Issued in error');
                              if (reason) revokeMutation.mutate({ id: certificate.id, reason });
                            }}
                            disabled={revokeMutation.isPending}
                          >
                            <Ban className="h-4 w-4" />
                            Revoke
                          </Button>
                        </>
                      ) : null}
                      {certificate.status !== 'voided' && certificate.status !== 'released' ? (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            const reason = requestReason('Duplicate or test certificate');
                            if (reason) voidMutation.mutate({ id: certificate.id, reason });
                          }}
                          disabled={voidMutation.isPending}
                        >
                          <XCircle className="h-4 w-4" />
                          Void
                        </Button>
                      ) : null}
                      <Button size="sm" variant="ghost" onClick={() => certificatesQuery.refetch()}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
