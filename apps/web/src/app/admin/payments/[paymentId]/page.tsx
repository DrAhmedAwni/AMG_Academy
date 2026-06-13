'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Input } from '@/components/ui';
import { LoadingSkeleton, ErrorState } from '@/components/states';
import { PaymentStatusBadge } from '@/components/payments/payment-status-badge';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, DollarSign, CreditCard, Calendar, User, FileText } from 'lucide-react';
import Link from 'next/link';

interface PaymentDetail {
  id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  providerRef: string | null;
  receiptRef: string | null;
  verifiedAt: string | null;
  createdAt: string;
  registration: {
    id: string;
    event: { id: string; title: string } | null;
    user: { id: string; name: string } | null;
  } | null;
  enrollment: {
    id: string;
    course: { id: string; title: string } | null;
    user: { id: string; name: string } | null;
  } | null;
  verifiedBy: { id: string; name: string } | null;
}

export default function AdminPaymentDetailPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [receiptRef, setReceiptRef] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-payment', paymentId],
    queryFn: async () => {
      const { data: response } = await api.get(`/payments/admin/${paymentId}`);
      return response.data ?? response as PaymentDetail;
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (status: string) => {
      const { data: response } = await api.post(`/payments/${paymentId}/verify-manual`, {
        paymentId,
        status,
        receiptRef: receiptRef || undefined,
      });
      return response.data ?? response;
    },
    onSuccess: () => {
      toast.success('Payment updated');
      queryClient.invalidateQueries({ queryKey: ['admin-payment', paymentId] });
      refetch();
    },
    onError: () => toast.error('Failed to update payment'),
  });

  if (isLoading) return <LoadingSkeleton lines={8} variant="card" />;
  if (isError) return <ErrorState title="Failed to load payment" description={error?.message ?? 'Payment not found'} onRetry={refetch} />;
  if (!data) return null;

  const payment = data;
  const itemType = payment.registration ? 'EVENT' : 'COURSE';
  const itemTitle = payment.registration?.event?.title ?? payment.enrollment?.course?.title ?? 'N/A';
  const userName = payment.registration?.user?.name ?? payment.enrollment?.user?.name ?? 'N/A';

  return (
    <div className="animate-fade-in space-y-6">
      <Link
        href="/admin/payments"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-secondary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Payments
      </Link>

      <h1 className="font-heading text-2xl font-bold text-text-primary">Payment Details</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="elevated" className="space-y-4 p-6">
            <h3 className="font-heading text-lg font-semibold text-text-primary">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-text-muted">
                  <User className="h-4 w-4" />
                  User
                </span>
                <span className="font-medium text-text-primary">{userName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-text-muted">
                  <FileText className="h-4 w-4" />
                  {itemType}
                </span>
                <span className="font-medium text-text-primary">{itemTitle}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-text-muted">
                  <DollarSign className="h-4 w-4" />
                  Amount
                </span>
                <span className="font-semibold text-text-primary">
                  {payment.amount} {payment.currency}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-text-muted">
                  <CreditCard className="h-4 w-4" />
                  Provider
                </span>
                <span className="font-medium text-text-primary capitalize">{payment.provider}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-text-muted">
                  <Calendar className="h-4 w-4" />
                  Created
                </span>
                <span className="font-medium text-text-primary">
                  {new Date(payment.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Status</span>
                <PaymentStatusBadge status={payment.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Provider Ref</span>
                <span className="font-medium text-text-primary">{payment.providerRef ?? '-'}</span>
              </div>
              {payment.verifiedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Verified At</span>
                  <span className="font-medium text-text-primary">
                    {new Date(payment.verifiedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}
              {payment.verifiedBy && (
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Verified By</span>
                  <span className="font-medium text-text-primary">{payment.verifiedBy.name}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="elevated" className="space-y-4 p-6">
            <h3 className="font-heading text-lg font-semibold text-text-primary">Admin Actions</h3>

            {payment.status === 'pending' && (
              <div className="space-y-3">
                <Input
                  placeholder="Receipt reference (optional)"
                  value={receiptRef}
                  onChange={(e) => setReceiptRef(e.target.value)}
                />
                <Button
                  className="w-full"
                  variant="gold"
                  onClick={() => verifyMutation.mutate('manually_verified')}
                  loading={verifyMutation.isPending}
                >
                  Verify & Approve
                </Button>
                <Button
                  className="w-full"
                  variant="danger"
                  onClick={() => verifyMutation.mutate('failed')}
                  loading={verifyMutation.isPending}
                >
                  Mark as Failed
                </Button>
              </div>
            )}

            {payment.status !== 'pending' && (
              <p className="text-sm text-text-muted">No actions available for {payment.status} payments.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
