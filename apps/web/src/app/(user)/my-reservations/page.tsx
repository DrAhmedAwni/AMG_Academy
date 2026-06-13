'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, PageHeader, StatusBadge } from '@/components/ui';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/states';
import { api } from '@/lib/api';
import { CalendarDays, QrCode, Ticket, CreditCard } from 'lucide-react';

interface RegistrationItem {
  id: string;
  event: { id: string; title: string; startDate: string; slug: string };
  status: string;
  paymentStatus: string;
  paymentId: string | null;
  qrTicketStatus: string;
  adminNotes: string | null;
  createdAt: string;
}

export default function MyReservationsPage() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['my-reservations'],
    queryFn: async () => {
      const { data } = await api.get('/registrations');
      return data;
    },
  });

  if (isLoading) return <LoadingSkeleton lines={6} />;
  if (isError) return <ErrorState title="Failed to load reservations" description={error?.message ?? 'Something went wrong'} onRetry={refetch} />;

  const registrations: RegistrationItem[] = data?.data?.data ?? data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Reservations"
        description="Track approval, payment, and QR ticket status for your AMG Academy events."
      />

      {registrations.length === 0 ? (
        <EmptyState
          title="No reservations"
          description="Registered events will appear here with approval and ticket status."
          icon={<Ticket className="h-7 w-7" />}
        />
      ) : (
        <div className="grid gap-4">
          {registrations.map((reg) => (
            <Card key={reg.id} variant="default">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-text-primary">
                    {reg.event.title}
                  </h3>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-text-secondary">
                    <CalendarDays className="h-4 w-4 text-gold" />
                    {new Date(reg.event.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <StatusBadge status={reg.status} />
                  <StatusBadge status={reg.paymentStatus} />
                  <StatusBadge status={reg.qrTicketStatus} />
                  {reg.paymentStatus === 'pending' && reg.paymentId && (
                    <Button variant="gold" size="sm" onClick={() => router.push(`/payment/${reg.paymentId}`)}>
                      <CreditCard className="h-4 w-4" />
                      Pay Now
                    </Button>
                  )}
                  <Link href="/my-qr-tickets">
                    <Button variant="secondary" size="sm">
                      <QrCode className="h-4 w-4" />
                      Tickets
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
