'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Input, PageHeader, StatusBadge } from '@/components/ui';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/states';
import { api } from '@/lib/api';
import { RefreshCw, UserCheck } from 'lucide-react';

interface AttendanceItem {
  id: string;
  event: { title: string };
  attendee: { name: string } | null;
  scanner: { name: string } | null;
  status: string;
  scanTime: string;
}

export default function AdminAttendancePage() {
  const [eventId, setEventId] = useState('');
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-attendance', eventId],
    queryFn: async () => {
      const trimmedEventId = eventId.trim();
      const { data } = await api.get('/attendance/admin', {
        params: trimmedEventId ? { eventId: trimmedEventId } : undefined,
      });
      return data;
    },
  });

  if (isLoading) return <LoadingSkeleton lines={6} />;
  if (isError) return <ErrorState title="Failed to load attendance" description={error?.message ?? 'Something went wrong'} onRetry={refetch} />;

  const records: AttendanceItem[] = data?.data?.data ?? data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        accent="Logs"
        description="Review scanner activity, attendee check-ins, and event validation results."
        actions={
          <Button variant="glass" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <Card variant="glass">
        <Input
          label="Event ID filter"
          placeholder="Optional event ID"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className="max-w-sm"
        />
      </Card>

      {records.length === 0 ? (
        <EmptyState
          title="No attendance records"
          description="Scanned attendance records will appear here."
          icon={<UserCheck className="h-7 w-7" />}
        />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-surface-border/60 bg-surface-card/75 shadow-card">
          <table className="w-full text-left text-sm text-text-secondary">
            <thead className="bg-surface-elevated/70 text-text-primary">
              <tr>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Attendee</th>
                <th className="px-4 py-3">Scanner</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Scan Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/25">
              {records.map((record) => (
                <tr key={record.id} className="transition-colors hover:bg-cyan/[0.035]">
                  <td className="px-4 py-3 text-text-primary">{record.event.title}</td>
                  <td className="px-4 py-3">{record.attendee?.name ?? 'N/A'}</td>
                  <td className="px-4 py-3">{record.scanner?.name ?? 'N/A'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="px-4 py-3">{new Date(record.scanTime).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
