'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QRTicketCard } from '@/components/cards/QRTicketCard';
import { PageHeader } from '@/components/ui';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/states';
import { api } from '@/lib/api';
import { QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

interface QRTicketItem {
  id: string;
  event: { id: string; title: string; startDate: string; endDate?: string; status?: string };
  status: string;
  qrPayload?: string | null;
  fallbackCode: string;
  issuedAt: string | null;
}

const deletableTicketStatuses = new Set(['revoked', 'expired']);
const deletableEventStatuses = new Set(['cancelled', 'archived', 'ended', 'finished']);

function canDeleteTicket(ticket: QRTicketItem) {
  const ticketStatus = ticket.status.toLowerCase();
  const eventStatus = ticket.event.status?.toLowerCase();

  return (
    deletableTicketStatuses.has(ticketStatus) ||
    (eventStatus ? deletableEventStatuses.has(eventStatus) : false)
  );
}

export default function MyQRTicketsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['my-qr-tickets'],
    queryFn: async () => {
      const { data } = await api.get('/qr-tickets');
      return data;
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      await api.delete(`/qr-tickets/${ticketId}`);
    },
    onSuccess: async () => {
      toast.success('QR ticket removed from your wallet.');
      await queryClient.invalidateQueries({ queryKey: ['my-qr-tickets'] });
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
            <QRTicketCard
              key={ticket.id}
              ticket={ticket}
              canDelete={canDeleteTicket(ticket)}
              deleteLoading={deleteMutation.isPending && deleteMutation.variables === ticket.id}
              onDelete={() => {
                if (confirm('Remove this QR ticket from your wallet?')) {
                  deleteMutation.mutate(ticket.id);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
