'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EventCard } from '@/components/cards/EventCard';
import { FilterPill, PageHeader } from '@/components/ui';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/states';
import { api } from '@/lib/api';
import { Search, CalendarDays } from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  location: string;
  price: number;
  currency: string;
  isFree: boolean;
  capacity: number;
  remainingSpots: number;
  thumbnailUrl: string | null;
  category: { name: string };
  isRegistered: boolean;
  registrationStatus: string | null;
}

type FilterKey = 'all' | 'upcoming' | 'active' | 'finished' | 'free' | 'paid';

const FILTERS: { label: string; value: FilterKey }[] = [
  { label: 'All', value: 'all' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Active', value: 'active' },
  { label: 'Finished', value: 'finished' },
  { label: 'Free', value: 'free' },
  { label: 'Paid', value: 'paid' },
];

async function fetchEvents(params: Record<string, string>) {
  const { data } = await api.get('/events', { params });
  return data;
}

export default function EventsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['events', search],
    queryFn: () => fetchEvents({ search }),
  });

  const events: EventItem[] = data?.data?.data ?? data?.data ?? [];

  const filteredEvents = useMemo(() => {
    const now = new Date();
    return events.filter((e) => {
      const startDate = new Date(e.startDate);
      switch (filter) {
        case 'all':
          return true;
        case 'upcoming':
          return startDate > now;
        case 'active':
          return startDate <= now;
        case 'finished':
          return startDate < now;
        case 'free':
          return e.isFree;
        case 'paid':
          return !e.isFree;
        default:
          return true;
      }
    });
  }, [events, filter]);

  const counts = useMemo(() => {
    const now = new Date();
    return {
      all: events.length,
      upcoming: events.filter((event) => new Date(event.startDate) > now).length,
      active: events.filter((event) => new Date(event.startDate) <= now).length,
      finished: events.filter((event) => new Date(event.startDate) < now).length,
      free: events.filter((event) => event.isFree).length,
      paid: events.filter((event) => !event.isFree).length,
    } satisfies Record<FilterKey, number>;
  }, [events]);

  if (isLoading) return <LoadingSkeleton lines={6} variant="card" />;
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
        description="Browse AMG Academy congresses, workshops, and live education experiences."
      />

      {/* Search + Filter */}
      <div className="surface-card flex flex-col gap-4 rounded-3xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-surface-border bg-surface-main/60 py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/10"
          />
        </div>
      </div>

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

      {/* Event cards */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          title="No events found"
          description={search ? 'Try a different search term.' : 'No events are available at this time.'}
          icon={<CalendarDays className="h-7 w-7" />}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
