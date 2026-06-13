'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Button, Card, FilterPill, Input, PageHeader, StatusBadge } from '@/components/ui';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/states';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { CheckCircle2, ClipboardList, RefreshCw, XCircle } from 'lucide-react';

interface RegistrationItem {
  id: string;
  user: { id: string; name: string; email: string };
  event: { id: string; title: string };
  status: string;
  paymentStatus: string;
  qrTicketStatus?: string;
  attendanceStatus?: string;
  adminNotes: string | null;
  createdAt: string;
}

type RegistrationFilter = 'all' | 'pending' | 'approved' | 'confirmed' | 'attended' | 'rejected';

const FILTERS: { label: string; value: RegistrationFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Attended', value: 'attended' },
  { label: 'Rejected', value: 'rejected' },
];

export default function AdminRegistrationsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<RegistrationFilter>('all');
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId') ?? '';
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-registrations', eventId],
    queryFn: async () => {
      const { data } = await api.get('/registrations/admin', {
        params: eventId ? { eventId } : undefined,
      });
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/registrations/${id}/approve`, {});
      return data;
    },
    onSuccess: () => {
      toast.success('Registration approved');
      refetch();
    },
    onError: () => toast.error('Failed to approve'),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { data } = await api.patch(`/registrations/${id}/reject`, { adminNotes: notes });
      return data;
    },
    onSuccess: () => {
      toast.success('Registration rejected');
      refetch();
    },
    onError: () => toast.error('Failed to reject'),
  });

  const registrations: RegistrationItem[] = data?.data?.data ?? data?.data ?? [];
  const filteredRegistrations = useMemo(() => {
    const term = search.trim().toLowerCase();
    return registrations.filter((registration) => {
      const userName = registration.user?.name ?? '';
      const userEmail = registration.user?.email ?? '';
      const eventTitle = registration.event?.title ?? '';
      const matchesStatus =
        filter === 'all' ||
        registration.status.toLowerCase() === filter ||
        (filter === 'confirmed' && registration.status.toLowerCase() === 'approved') ||
        (filter === 'attended' && registration.attendanceStatus?.toLowerCase() === 'attended');
      const matchesSearch =
        !term ||
        userName.toLowerCase().includes(term) ||
        userEmail.toLowerCase().includes(term) ||
        eventTitle.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [filter, registrations, search]);

  const counts = useMemo(
    () =>
      ({
        all: registrations.length,
        pending: registrations.filter((registration) => registration.status.toLowerCase() === 'pending').length,
        approved: registrations.filter((registration) => registration.status.toLowerCase() === 'approved').length,
        confirmed: registrations.filter((registration) => ['approved', 'confirmed'].includes(registration.status.toLowerCase())).length,
        attended: registrations.filter((registration) => registration.attendanceStatus?.toLowerCase() === 'attended').length,
        rejected: registrations.filter((registration) => registration.status.toLowerCase() === 'rejected').length,
      }) satisfies Record<RegistrationFilter | 'approved', number>,
    [registrations],
  );

  if (isLoading) return <LoadingSkeleton lines={6} />;
  if (isError) return <ErrorState title="Failed to load registrations" description={error?.message ?? 'Something went wrong'} onRetry={refetch} />;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Registrations"
        description="Review attendee requests, payment status, and QR generation workflow."
        actions={
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <Card variant="default" className="space-y-4">
        <Input
          label="Search registrations"
          placeholder="Name, email, or event"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <FilterPill
              key={item.value}
              active={filter === item.value}
              count={counts[item.value]}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </FilterPill>
          ))}
        </div>
      </Card>

      {filteredRegistrations.length === 0 ? (
        <EmptyState
          title="No registrations"
          description="No registrations match the selected filters."
          icon={<ClipboardList className="h-7 w-7" />}
        />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-surface-border/60 bg-surface-card/75 shadow-card">
          <table className="w-full text-left text-sm text-text-secondary">
            <thead className="bg-surface-elevated/70 text-text-primary">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">QR</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/25">
              {filteredRegistrations.map((reg) => (
                <tr key={reg.id} className="transition-colors hover:bg-gold/[0.035]">
                  <td className="px-4 py-3 text-text-primary">{reg.user?.name ?? 'Unknown user'}</td>
                  <td className="px-4 py-3">{reg.event?.title ?? 'Unknown event'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={reg.status} />
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={reg.paymentStatus} /></td>
                  <td className="px-4 py-3">
                    <StatusBadge status={reg.qrTicketStatus ?? 'not_issued'} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {reg.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => approveMutation.mutate(reg.id)}>
                            <CheckCircle2 className="h-4 w-4" />
                            Confirm & Generate QR
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => rejectMutation.mutate({ id: reg.id, notes: '' })}
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}
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
