'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, Button, Input } from '@/components/ui';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/states';
import { PaymentStatusBadge } from '@/components/payments/payment-status-badge';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface PaymentItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  receiptRef: string | null;
  verifiedBy: { name: string } | null;
  registration: { event: { title: string } } | null;
}

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const { data } = await api.get('/payments/admin');
      return data;
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/payments/${id}/verify-manual`, {
        paymentId: id,
        status: 'manually_verified',
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Payment verified');
      refetch();
    },
    onError: () => toast.error('Failed to verify payment'),
  });

  const refundMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/payments/${id}/mark-refunded`);
      return data;
    },
    onSuccess: () => {
      toast.success('Payment marked refunded');
      refetch();
    },
    onError: () => toast.error('Failed to mark payment refunded'),
  });

  if (isLoading) return <LoadingSkeleton lines={6} />;
  if (isError) return <ErrorState title="Failed to load payments" description={error?.message ?? 'Something went wrong'} onRetry={refetch} />;

  const payments: PaymentItem[] = data?.data?.data ?? data?.data ?? [];

  const filtered = search
    ? payments.filter(
        (p) =>
          p.registration?.event?.title?.toLowerCase().includes(search.toLowerCase()) ??
          p.id.toLowerCase().includes(search.toLowerCase()),
      )
    : payments;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-text-primary">Payments</h1>

      <Card>
        <Input
          placeholder="Search by event or payment ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </Card>

      {filtered.length === 0 ? (
        <EmptyState title="No payments" description="No payments found matching your search." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-secondary">
            <thead className="bg-background-elevated text-text-primary">
              <tr>
                <th className="px-4 py-3">Event / Course</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Verified By</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((payment) => (
                <tr key={payment.id} className="hover:bg-background-elevated/50">
                  <td className="px-4 py-3 text-text-primary">
                    <Link
                      href={`/admin/payments/${payment.id}`}
                      className="inline-flex items-center gap-1.5 text-cyan hover:underline"
                    >
                      {payment.registration?.event?.title ?? 'N/A'}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {payment.amount} {payment.currency}
                  </td>
                  <td className="px-4 py-3">
                    <PaymentStatusBadge status={payment.status} />
                  </td>
                  <td className="px-4 py-3">{payment.provider}</td>
                  <td className="px-4 py-3">{payment.verifiedBy?.name ?? '-'}</td>
                  <td className="px-4 py-3">
                    {payment.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => verifyMutation.mutate(payment.id)}>
                          Verify
                        </Button>
                        <Link href={`/admin/payments/${payment.id}`}>
                          <Button size="sm" variant="secondary">
                            View
                          </Button>
                        </Link>
                      </div>
                    )}
                    {payment.status === 'refund_pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => refundMutation.mutate(payment.id)}>
                          Mark Refunded
                        </Button>
                        <Link href={`/admin/payments/${payment.id}`}>
                          <Button size="sm" variant="secondary">
                            View
                          </Button>
                        </Link>
                      </div>
                    )}
                    {payment.status !== 'pending' && payment.status !== 'refund_pending' && (
                      <Link href={`/admin/payments/${payment.id}`}>
                        <Button size="sm" variant="secondary">
                          View
                        </Button>
                      </Link>
                    )}
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
