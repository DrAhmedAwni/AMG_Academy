'use client';

import { useQuery } from '@tanstack/react-query';
import { QRTicketCard } from '@/components/cards/QRTicketCard';
import { PageHeader } from '@/components/ui';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/states';
import { api } from '@/lib/api';
import { QrCode } from 'lucide-react';

interface QRTicketItem {
  id: string;
  event: { id: string; title: string; startDate: string };
  status: string;
  fallbackCode: string;
  issuedAt: string | null;
}

export default function MyQRTicketsPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['my-qr-tickets'],
    queryFn: async () => {
      const { data } = await api.get('/qr-tickets');
      return data;
    },
  });

  if (isLoading) return <LoadingSkeleton lines={4} />;
  if (isError) return <ErrorState title="Failed to load tickets" description={error?.message ?? 'Something went wrong'} onRetry={refetch} />;

  const tickets: QRTicketItem[] = data?.data?.data ?? data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My QR"
        accent="Tickets"
        description="Approved event passes with scannable QR codes and fallback ticket codes."
      />

      {tickets.length === 0 ? (
        <EmptyState
          title="No QR tickets"
          description="Complete registration and payment to receive your ticket."
          icon={<QrCode className="h-7 w-7" />}
        />
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <QRTicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}
