'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, CheckCircle2, RotateCcw, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Badge, Button, Card, FilterPill, Input, PageHeader } from '@/components/ui';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/states';
import { api } from '@/lib/api';

interface AdminStudyGroup {
  id: string;
  title: string;
  description: string | null;
  owner?: { name: string } | null;
  type: 'STUDENT' | 'INSTRUCTOR_LED';
  joinMode: 'OPEN' | 'REQUEST' | 'INVITE_ONLY';
  status: string;
  memberCount: number;
  messageCount: number;
  fileCount: number;
  sessionCount: number;
  createdAt: string;
}

type TypeFilter = 'all' | 'STUDENT' | 'INSTRUCTOR_LED';
type StatusFilter = 'all' | 'pending_review' | 'active' | 'rejected' | 'archived';

const typeFilters: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'STUDENT', label: 'Student-led' },
  { value: 'INSTRUCTOR_LED', label: 'Instructor-led' },
];

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: 'pending_review', label: 'Pending' },
  { value: 'active', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'archived', label: 'Archived' },
  { value: 'all', label: 'All' },
];

function readItems(payload: any): AdminStudyGroup[] {
  const unwrapped = payload?.data ?? payload;
  if (Array.isArray(unwrapped?.data)) return unwrapped.data;
  if (Array.isArray(unwrapped)) return unwrapped;
  return [];
}

function typeLabel(type: AdminStudyGroup['type']) {
  return type === 'STUDENT' ? 'Student-led' : 'Instructor-led';
}

function joinModeLabel(mode: AdminStudyGroup['joinMode']) {
  if (mode === 'OPEN') return 'Open';
  if (mode === 'INVITE_ONLY') return 'Invite only';
  return 'Approval';
}

function statusVariant(status: string) {
  if (status === 'ACTIVE') return 'success' as const;
  if (status === 'PENDING_REVIEW') return 'warning' as const;
  if (status === 'REJECTED') return 'error' as const;
  return 'muted' as const;
}

function statusLabel(status: string) {
  if (status === 'PENDING_REVIEW') return 'Pending Review';
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminStudyGroupsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<TypeFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('pending_review');
  const queryClient = useQueryClient();

  const groupsQuery = useQuery({
    queryKey: ['admin-study-groups', search, filter, status],
    queryFn: async () => {
      const { data } = await api.get('/study-groups/admin/review', {
        params: {
          search: search || undefined,
          type: filter === 'all' ? undefined : filter,
          status: status === 'all' ? undefined : status,
          limit: '100',
        },
      });
      return data;
    },
  });

  const invalidateList = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin-study-groups'] });
  };

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/study-groups/admin/${encodeURIComponent(id)}/approve`);
    },
    onSuccess: async () => {
      toast.success('Study group approved');
      await invalidateList();
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.error?.message ?? 'Failed to approve study group'),
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/study-groups/admin/${encodeURIComponent(id)}/reject`);
    },
    onSuccess: async () => {
      toast.success('Study group rejected');
      await invalidateList();
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.error?.message ?? 'Failed to reject study group'),
  });

  const groups = useMemo(() => readItems(groupsQuery.data), [groupsQuery.data]);

  if (groupsQuery.isLoading) return <LoadingSkeleton lines={8} />;
  if (groupsQuery.isError) {
    return (
      <ErrorState
        title="Failed to load study groups"
        description={groupsQuery.error?.message ?? 'Something went wrong'}
        onRetry={groupsQuery.refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Groups"
        accent="Community"
        description="Monitor student-led and instructor-led learning groups."
      />

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              placeholder="Search groups..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {typeFilters.map((item) => (
              <FilterPill
                key={item.value}
                active={filter === item.value}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </FilterPill>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((item) => (
              <FilterPill
                key={item.value}
                active={status === item.value}
                onClick={() => setStatus(item.value)}
              >
                {item.label}
              </FilterPill>
            ))}
          </div>
        </div>
      </Card>

      {groups.length === 0 ? (
        <EmptyState title="No study groups" description="No groups match the current filters." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-background-card">
          <table className="w-full min-w-[820px] text-left text-sm text-text-secondary">
            <thead className="bg-background-elevated text-text-primary">
              <tr>
                <th className="px-4 py-3">Group</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Join Mode</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Activity</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {groups.map((group) => (
                <tr key={group.id} className="hover:bg-background-elevated/50">
                  <td className="px-4 py-3">
                    <p className="max-w-xs truncate font-medium text-text-primary">{group.title}</p>
                    {group.description ? (
                      <p className="mt-1 max-w-sm truncate text-xs text-text-muted">{group.description}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{group.owner?.name ?? 'Unknown'}</td>
                  <td className="px-4 py-3">
                    <Badge variant="muted">{typeLabel(group.type)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={group.joinMode === 'OPEN' ? 'success' : 'warning'}>
                      {joinModeLabel(group.joinMode)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(group.status)}>
                      {statusLabel(group.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {group.memberCount} members · {group.messageCount} messages · {group.sessionCount} sessions
                  </td>
                  <td className="px-4 py-3 text-text-muted">{formatDate(group.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {group.status === 'PENDING_REVIEW' ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => approveMutation.mutate(group.id)}
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => rejectMutation.mutate(group.id)}
                            disabled={rejectMutation.isPending}
                          >
                            <Ban className="h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      ) : null}
                      <Button size="sm" variant="ghost" onClick={() => groupsQuery.refetch()}>
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
