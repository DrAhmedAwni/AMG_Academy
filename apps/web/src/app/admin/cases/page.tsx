'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, CheckCircle2, RotateCcw, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Badge, Button, Card, FilterPill, Input, PageHeader } from '@/components/ui';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/states';
import { api } from '@/lib/api';

interface AdminCase {
  id: string;
  title: string;
  authorName: string;
  categoryName: string;
  status: string;
  createdAt: string;
  description: string;
  tags: string[];
}

type Filter = 'all' | 'pending' | 'approved' | 'rejected';

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

function readItems(payload: any): AdminCase[] {
  const unwrapped = payload?.data ?? payload;
  if (Array.isArray(unwrapped?.data)) return unwrapped.data;
  if (Array.isArray(unwrapped)) return unwrapped;
  return [];
}

function statusVariant(status: string) {
  switch (status) {
    case 'approved':
      return 'success' as const;
    case 'pending':
      return 'warning' as const;
    case 'rejected':
      return 'error' as const;
    default:
      return 'default' as const;
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminCasesPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('pending');
  const queryClient = useQueryClient();

  const casesQuery = useQuery({
    queryKey: ['admin-cases', search, filter],
    queryFn: async () => {
      const params: Record<string, string | undefined> = {
        search: search || undefined,
        status: filter === 'all' ? undefined : filter,
        limit: '100',
      };
      const { data } = await api.get('/cases/admin/review', { params });
      return data;
    },
  });

  const invalidateList = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin-cases'] });
  };

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/cases/admin/${encodeURIComponent(id)}/approve`);
    },
    onSuccess: async () => {
      toast.success('Case approved');
      await invalidateList();
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.error?.message ?? 'Failed to approve case'),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, rejectionReason }: { id: string; rejectionReason: string }) => {
      await api.post(`/cases/admin/${encodeURIComponent(id)}/reject`, {
        rejectionReason,
      });
    },
    onSuccess: async () => {
      toast.success('Case rejected');
      await invalidateList();
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.error?.message ?? 'Failed to reject case'),
  });

  const adminCases = useMemo(() => readItems(casesQuery.data), [casesQuery.data]);

  const requestReason = (fallback: string) => {
    const reason = window.prompt('Reason for rejection', fallback);
    return reason?.trim() ? reason.trim() : null;
  };

  if (casesQuery.isLoading) return <LoadingSkeleton lines={8} />;
  if (casesQuery.isError) {
    return (
      <ErrorState
        title="Failed to load cases"
        description={casesQuery.error?.message ?? 'Something went wrong'}
        onRetry={casesQuery.refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cases"
        accent="Review"
        description="Review and moderate case forum submissions before they are published."
      />

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              placeholder="Search by title or author..."
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

      {adminCases.length === 0 ? (
        <EmptyState
          title="No cases"
          description="There are no cases matching the current filters."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-background-card">
          <table className="w-full min-w-[720px] text-left text-sm text-text-secondary">
            <thead className="bg-background-elevated text-text-primary">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {adminCases.map((c) => (
                <tr key={c.id} className="hover:bg-background-elevated/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-text-primary max-w-xs truncate">{c.title}</p>
                    {c.tags.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {c.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="muted" size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{c.authorName}</td>
                  <td className="px-4 py-3 text-text-secondary">{c.categoryName}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(c.status)}>
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {c.status === 'pending' ? (
                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutate(c.id)}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Approve
                        </Button>
                      ) : null}
                      {c.status === 'pending' || c.status === 'approved' ? (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            const reason = requestReason(
                              c.status === 'pending'
                                ? 'Contains PHI or does not meet guidelines'
                                : 'No longer meets community standards',
                            );
                            if (reason) rejectMutation.mutate({ id: c.id, rejectionReason: reason });
                          }}
                          disabled={rejectMutation.isPending}
                        >
                          <Ban className="h-4 w-4" />
                          Reject
                        </Button>
                      ) : null}
                      <Button size="sm" variant="ghost" onClick={() => casesQuery.refetch()}>
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
