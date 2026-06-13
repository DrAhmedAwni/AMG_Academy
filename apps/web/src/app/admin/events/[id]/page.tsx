'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Button, Input, Badge } from '@/components/ui';
import { StatusBadge } from '@/components/ui/status-badge';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/states';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  CreditCard,
  QrCode,
  Trash2,
  User,
  Phone,
  Mail,
  Stethoscope,
  Building2,
} from 'lucide-react';

interface Registration {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    specialty?: string;
    clinic?: string;
  };
  status: string;
  paymentStatus: string;
  attendanceStatus?: string;
  adminNotes?: string | null;
  createdAt: string;
}

type FilterStatus = 'all' | 'pending' | 'confirmed' | 'attended' | 'rejected';

const FILTERS: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Attended', value: 'attended' },
  { label: 'Rejected', value: 'rejected' },
];

export default function AdminEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');

  const { data: eventData, isLoading: eventLoading } = useQuery({
    queryKey: ['admin-event', id],
    queryFn: async () => {
      const { data } = await api.get(`/events/admin/${id}`);
      return data.data;
    },
  });

  const { data: regData, isLoading: regLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-event-registrations', id],
    queryFn: async () => {
      const { data } = await api.get('/registrations/admin');
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (regId: string) => {
      const { data } = await api.patch(`/registrations/${regId}/approve`, {});
      return data;
    },
    onSuccess: () => {
      toast.success('Registration confirmed');
      refetch();
    },
    onError: () => toast.error('Failed to confirm'),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ regId, notes }: { regId: string; notes: string }) => {
      const { data } = await api.patch(`/registrations/${regId}/reject`, { adminNotes: notes });
      return data;
    },
    onSuccess: () => {
      toast.success('Registration rejected');
      refetch();
    },
    onError: () => toast.error('Failed to reject'),
  });

  const markPaidMutation = useMutation({
    mutationFn: async (regId: string) => {
      const { data } = await api.patch(`/registrations/${regId}/approve`, {});
      return data;
    },
    onSuccess: () => {
      toast.success('Payment marked');
      refetch();
    },
    onError: () => toast.error('Failed to mark payment'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (regId: string) => {
      const { data } = await api.delete(`/registrations/${regId}`);
      return data;
    },
    onSuccess: () => {
      toast.success('Registration removed');
      refetch();
    },
    onError: () => toast.error('Failed to remove'),
  });

  const allRegistrations: Registration[] = regData?.data?.data ?? regData?.data ?? [];
  const registrationsForEvent = allRegistrations.filter(
    (reg) => reg.user?.id || reg.id,
  );

  const filteredRegistrations = useMemo(() => {
    let filtered = registrationsForEvent;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.user?.name?.toLowerCase().includes(q) ||
          r.user?.email?.toLowerCase().includes(q) ||
          r.user?.phone?.toLowerCase().includes(q) ||
          r.user?.clinic?.toLowerCase().includes(q),
      );
    }
    if (filter !== 'all') {
      filtered = filtered.filter((r) => r.status === filter);
    }
    return filtered;
  }, [registrationsForEvent, search, filter]);

  const isLoading = eventLoading || regLoading;

  if (isLoading) return <LoadingSkeleton lines={8} variant="table" />;
  if (isError)
    return (
      <ErrorState
        title="Failed to load event data"
        description={error?.message ?? 'Something went wrong'}
        onRetry={refetch}
      />
    );

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon onClick={() => router.push('/admin/events')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl font-bold text-text-primary">
                {eventData?.title ?? 'Event Details'}
              </h1>
              <StatusBadge status={eventData?.status ?? 'unknown'} />
            </div>
            <p className="mt-0.5 text-sm text-text-secondary">
              Manage registrations, approvals, and attendance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="secondary" size="sm">
            <Download className="h-4 w-4" />
            Download Sheet
          </Button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200',
              filter === f.value
                ? 'border-gold/40 bg-gold/10 text-gold-light shadow-glow-sm'
                : 'border-surface-border/40 text-text-muted hover:border-surface-border/60 hover:text-text-secondary',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by name, phone, email, clinic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-surface-border/50 bg-surface-card py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/15"
        />
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-3 text-sm">
        <span className="text-text-muted">
          Total: <strong className="text-text-primary">{filteredRegistrations.length}</strong>
        </span>
        <span className="text-text-muted">
          Pending:{' '}
          <strong className="text-pending">
            {registrationsForEvent.filter((r) => r.status === 'pending').length}
          </strong>
        </span>
        <span className="text-text-muted">
          Confirmed:{' '}
          <strong className="text-success">
            {registrationsForEvent.filter((r) => r.status === 'confirmed' || r.status === 'approved').length}
          </strong>
        </span>
        <span className="text-text-muted">
          Rejected:{' '}
          <strong className="text-status-error">
            {registrationsForEvent.filter((r) => r.status === 'rejected').length}
          </strong>
        </span>
      </div>

      {/* Registrations Table */}
      {filteredRegistrations.length === 0 ? (
        <EmptyState
          title={search ? 'No matching registrations' : 'No registrations yet'}
          description={
            search
              ? 'Try a different search term.'
              : 'Registrations will appear here when users sign up.'
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-surface-border/30">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-border/30 bg-surface-elevated/30">
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Name
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Contact
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Specialty / Clinic
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Payment
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Status
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Attendance
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/15">
              {filteredRegistrations.map((reg, idx) => (
                <tr
                  key={reg.id}
                  className={cn(
                    'transition-colors hover:bg-surface-elevated/15',
                    idx % 2 === 0 ? 'bg-transparent' : 'bg-surface-main/15',
                  )}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold-light">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">
                          {reg.user?.name ?? 'Unknown'}
                        </p>
                        <p className="text-xs text-text-muted">{reg.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                        <Mail className="h-3 w-3 text-text-muted" />
                        {reg.user?.email}
                      </span>
                      {reg.user?.phone && (
                        <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                          <Phone className="h-3 w-3 text-text-muted" />
                          {reg.user.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="space-y-1">
                      {reg.user?.specialty && (
                        <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                          <Stethoscope className="h-3 w-3 text-text-muted" />
                          {reg.user.specialty}
                        </span>
                      )}
                      {reg.user?.clinic && (
                        <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                          <Building2 className="h-3 w-3 text-text-muted" />
                          {reg.user.clinic}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={reg.paymentStatus} />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={reg.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={reg.attendanceStatus ?? 'n/a'} />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      {reg.status === 'pending' && (
                        <>
                          <Button
                            variant="gold"
                            size="sm"
                            onClick={() => approveMutation.mutate(reg.id)}
                            loading={approveMutation.isPending}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Confirm
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() =>
                              rejectMutation.mutate({ regId: reg.id, notes: '' })
                            }
                            loading={rejectMutation.isPending}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                      {reg.status === 'approved' && (
                        <>
                          {reg.paymentStatus !== 'paid' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => markPaidMutation.mutate(reg.id)}
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              Mark Paid
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" icon>
                            <QrCode className="h-4 w-4 text-gold" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        icon
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this registration?')) {
                            deleteMutation.mutate(reg.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-status-error/60" />
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
