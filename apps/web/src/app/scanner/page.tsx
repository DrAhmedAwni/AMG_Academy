'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Card } from '@/components/ui';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/states';
import { api } from '@/lib/api';

interface EventItem {
  id: string;
  title: string;
  slug: string;
  startDate: string;
}

export default function ScannerPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['scanner-events'],
    queryFn: async () => {
      const { data } = await api.get('/events/admin', { params: { status: 'published' } });
      return data;
    },
  });

  if (isLoading) return <LoadingSkeleton lines={4} />;
  if (isError) return <ErrorState title="Failed to load events" description={error?.message ?? 'Something went wrong'} onRetry={refetch} />;

  const events: EventItem[] = data?.data?.data ?? data?.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-text-primary">Select Event</h1>

      {events.length === 0 ? (
        <EmptyState title="No events" description="No published events available." />
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Link key={event.id} href={`/scanner/scan?eventId=${event.id}`}>
              <Card className="hover:border-brand-action transition-colors">
                <h3 className="font-heading text-lg font-semibold text-text-primary">{event.title}</h3>
                <p className="text-sm text-text-secondary">{new Date(event.startDate).toLocaleDateString()}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
