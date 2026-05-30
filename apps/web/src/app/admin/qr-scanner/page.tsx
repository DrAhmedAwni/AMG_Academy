'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Card, Input } from '@/components/ui';
import { QRScanner } from '@/components/scanner/QRScanner';
import { ErrorState, LoadingSkeleton } from '@/components/states';
import { api } from '@/lib/api';

export default function AdminQrScannerPage() {
  const [eventId, setEventId] = useState('');
  const [result, setResult] = useState<any>(null);

  const eventsQuery = useQuery({
    queryKey: ['admin-qr-events'],
    queryFn: async () => (await api.get('/events', { params: { page: 1, limit: 100 } })).data.data,
  });

  const scanMutation = useMutation({
    mutationFn: async (token: string) => (await api.post('/qr/scan', { token, eventId })).data.data,
    onSuccess: (data) => {
      setResult(data);
      toast.success(data.valid ? `Checked in ${data.attendeeName}` : `Rejected: ${data.reason}`);
    },
  });

  if (eventsQuery.isLoading) {
    return <LoadingSkeleton lines={4} />;
  }

  if (eventsQuery.isError) {
    return (
      <ErrorState
        title="Scanner setup failed."
        description="Please retry once events can be loaded."
        onRetry={() => void eventsQuery.refetch()}
      />
    );
  }

  const events = eventsQuery.data?.data ?? eventsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold text-text-primary">Admin QR scanner</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Validate tickets without leaving the admin console.
        </p>
      </div>

      <Card>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-text-primary">Event</span>
          <select
            value={eventId}
            onChange={(event) => setEventId(event.target.value)}
            className="h-11 rounded-md border border-surface-border bg-surface px-3 text-sm text-text-primary"
          >
            <option value="">Select an event</option>
            {events.map((event: any) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </label>
      </Card>

      {eventId ? (
        <QRScanner onScan={(token) => scanMutation.mutate(token)} onError={(error) => toast.error(error)} />
      ) : (
        <Card>
          <Input label="Event required" value="Choose an event before scanning." readOnly />
        </Card>
      )}

      {result ? (
        <Card className={result.valid ? 'border-green-500/30' : 'border-red-500/30'}>
          <p className="font-medium text-text-primary">
            {result.valid ? 'Valid ticket' : 'Invalid ticket'}
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            {result.valid
              ? `${result.attendeeName} checked into ${result.eventName}`
              : result.reason}
          </p>
        </Card>
      ) : null}
    </div>
  );
}
