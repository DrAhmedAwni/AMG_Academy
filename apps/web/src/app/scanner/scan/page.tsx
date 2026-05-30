'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { QRScanner } from '@/components/scanner/QRScanner';
import { Card } from '@/components/ui';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

function ScanContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  const [result, setResult] = useState<{
    valid: boolean;
    attendeeName?: string;
    eventName?: string;
    reason?: string;
    previousCheckInTime?: string;
  } | null>(null);

  const scanMutation = useMutation({
    mutationFn: async (token: string) => {
      if (!eventId) throw new Error('No event selected');
      const { data } = await api.post('/qr/scan', { token, eventId });
      return data.data;
    },
    onSuccess: (data) => {
      setResult(data);
      if (data.valid) {
        toast.success(`Checked in: ${data.attendeeName}`);
      } else {
        toast.error(`Invalid: ${data.reason}`);
      }
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? 'Scan failed';
      toast.error(message);
    },
  });

  if (!eventId) {
    return (
      <Card>
        <p className="text-text-secondary">No event selected. Please select an event first.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-text-primary">QR Scanner</h1>
      <QRScanner onScan={(token) => scanMutation.mutate(token)} onError={(err) => toast.error(err)} />

      {result && (
        <Card className={result.valid ? 'border-success' : 'border-error'}>
          {result.valid ? (
            <div className="space-y-1">
              <p className="text-success font-semibold">Valid Ticket</p>
              <p className="text-text-primary">Attendee: {result.attendeeName}</p>
              <p className="text-text-secondary">Event: {result.eventName}</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-error font-semibold">Invalid Ticket</p>
              <p className="text-text-primary">Reason: {result.reason}</p>
              {result.previousCheckInTime && (
                <p className="text-text-secondary">
                  Previously checked in at: {new Date(result.previousCheckInTime).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default function ScannerScanPage() {
  return (
    <Suspense fallback={<div className="p-6 text-text-secondary">Loading scanner...</div>}>
      <ScanContent />
    </Suspense>
  );
}
