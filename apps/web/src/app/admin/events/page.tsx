'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { Button, Badge, FilterPill, PageHeader } from '@/components/ui';
import { StatusBadge } from '@/components/ui/status-badge';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/states';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Plus,
  RefreshCw,
  Download,
  Search,
  Users,
  Pencil,
  Archive,
  Trash2,
  Eye,
  CalendarDays,
  MapPin,
  Tag,
  Clock,
} from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location: string;
  status: string;
  price?: number;
  isFree?: boolean;
  capacity?: number;
  registrationsCount?: number;
  pendingCount?: number;
  category?: { name: string };
  thumbnailUrl?: string | null;
}

type FilterStatus = 'all' | 'draft' | 'published' | 'upcoming' | 'active' | 'finished' | 'cancelled' | 'archived';

const FILTERS: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Active', value: 'active' },
  { label: 'Finished', value: 'finished' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Archived', value: 'archived' },
];

export default function AdminEventsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [confirmArchive, setConfirmArchive] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-events', search],
    queryFn: async () => {
      const { data } = await api.get('/events/admin', { params: { search } });
      return data;
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/events/${id}/publish`);
      return data;
    },
    onSuccess: () => {
      toast.success('Event published');
      refetch();
    },
    onError: () => toast.error('Failed to publish event'),
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/events/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success('Event archived');
      setConfirmArchive(null);
      refetch();
    },
    onError: () => toast.error('Failed to archive event'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/events/${id}/hard`);
      return data;
    },
    onSuccess: () => {
      toast.success('Event deleted permanently');
      setConfirmDelete(null);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message ?? 'Failed to delete event');
    },
  });

  const events: EventItem[] = data?.data?.data ?? data?.data ?? [];

  const filteredEvents = useMemo(() => {
    if (filter === 'all') return events;
    const now = new Date();
    return events.filter((event) => {
      const startDate = new Date(event.startDate);
      switch (filter) {
        case 'draft':
          return event.status === 'draft';
        case 'published':
          return event.status === 'published';
        case 'upcoming':
          return startDate > now;
        case 'active':
          return startDate <= now && (!event.endDate || new Date(event.endDate) >= now);
        case 'finished':
          return event.endDate ? new Date(event.endDate) < now : startDate < now;
        case 'cancelled':
          return event.status === 'cancelled';
        case 'archived':
          return event.status === 'archived';
        default:
          return true;
      }
    });
  }, [events, filter]);

  const counts = useMemo(() => {
    const now = new Date();
    return {
      all: events.length,
      draft: events.filter((event) => event.status === 'draft').length,
      published: events.filter((event) => event.status === 'published').length,
      upcoming: events.filter((event) => new Date(event.startDate) > now).length,
      active: events.filter((event) => {
        const startDate = new Date(event.startDate);
        return startDate <= now && (!event.endDate || new Date(event.endDate) >= now);
      }).length,
      finished: events.filter((event) =>
        event.endDate ? new Date(event.endDate) < now : new Date(event.startDate) < now,
      ).length,
      cancelled: events.filter((event) => event.status === 'cancelled').length,
      archived: events.filter((event) => event.status === 'archived').length,
    } satisfies Record<FilterStatus, number>;
  }, [events]);

  if (isLoading) return <LoadingSkeleton lines={6} variant="table" />;
  if (isError)
    return (
      <ErrorState
        title="Failed to load events"
        description={error?.message ?? 'Something went wrong'}
        onRetry={refetch}
      />
    );

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Events"
        accent="Management"
        description="Create, edit, archive, cancel, and monitor AMG Academy events from one operations surface."
        actions={
          <>
          <Button variant="glass" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="secondary" size="sm">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Link href="/admin/events/new">
            <Button variant="glow" size="sm">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </Link>
          </>
        }
      />

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <FilterPill
            key={f.value}
            onClick={() => setFilter(f.value)}
            active={filter === f.value}
            count={counts[f.value]}
          >
            {f.label}
          </FilterPill>
        ))}
      </div>

      {/* Search */}
      <div className="glass relative max-w-md rounded-3xl p-4">
        <Search className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by title, location, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-surface-border/70 bg-surface-card/90 py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-cyan/50 focus:outline-none focus:ring-2 focus:ring-cyan/15"
        />
      </div>

      {/* Event cards/table */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          title="No events found"
          description={search ? 'Try a different search term.' : 'Create your first event to get started.'}
        />
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event, idx) => (
            <div
              key={event.id}
              className="premium-ring animate-slide-up group rounded-3xl border border-surface-border/60 bg-surface-card/75 p-4 transition-all duration-200 hover:border-cyan/35 hover:bg-surface-card/90"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Thumbnail */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-surface-elevated/50 text-text-muted">
                  {event.thumbnailUrl ? (
                    <img
                      src={event.thumbnailUrl}
                      alt=""
                      className="h-full w-full rounded-lg object-cover"
                    />
                  ) : (
                    <CalendarDays className="h-6 w-6" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-text-primary">
                      {event.title}
                    </h3>
                    <StatusBadge status={event.status} />
                    {event.isFree && <Badge variant="success">Free</Badge>}
                    {!event.isFree && typeof event.price === 'number' ? (
                      <Badge variant="paid">{event.price} EGP</Badge>
                    ) : null}
                  </div>
                  {event.description && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-text-muted">
                      {event.description}
                    </p>
                  )}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                    {event.startDate && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(event.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                    {event.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                    )}
                    {event.category?.name && (
                      <span className="inline-flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {event.category.name}
                      </span>
                    )}
                    {event.capacity && (
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {event.registrationsCount ?? 0}/{event.capacity}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                  <div className="flex items-center gap-3 text-xs">
                    {event.pendingCount && event.pendingCount > 0 ? (
                      <Badge variant="pending" size="sm">
                        {event.pendingCount} pending
                      </Badge>
                    ) : null}
                    <span className="text-text-muted">
                      {event.registrationsCount ?? 0} registered
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                    <Link href={`/admin/events/${event.id}`}>
                      <Button variant="ghost" size="sm" icon>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/events/${event.id}/edit`}>
                      <Button variant="ghost" size="sm" icon>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/registrations?eventId=${event.id}`}>
                      <Button variant="secondary" size="sm">
                        Registrations
                      </Button>
                    </Link>
                    {event.status === 'draft' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => publishMutation.mutate(event.id)}
                      >
                        Publish
                      </Button>
                    )}
                    {confirmArchive === event.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => archiveMutation.mutate(event.id)}
                          loading={archiveMutation.isPending}
                        >
                          Archive
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmArchive(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon
                        onClick={() => setConfirmArchive(event.id)}
                      >
                        <Archive className="h-4 w-4 text-status-error/70 hover:text-status-error" />
                      </Button>
                    )}
                    {(event.registrationsCount ?? 0) === 0 && confirmDelete === event.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => deleteMutation.mutate(event.id)}
                          loading={deleteMutation.isPending}
                        >
                          Delete
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (event.registrationsCount ?? 0) === 0 ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon
                        onClick={() => setConfirmDelete(event.id)}
                      >
                        <Trash2 className="h-4 w-4 text-status-error/70 hover:text-status-error" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
