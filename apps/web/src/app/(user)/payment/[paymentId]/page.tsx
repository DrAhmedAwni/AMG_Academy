'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui';
import { LoadingSkeleton, ErrorState } from '@/components/states';
import { PaymentSummary } from '@/components/payments/payment-summary';
import { PaymentActions } from '@/components/payments/payment-actions';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PaymentDetail {
  id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  createdAt: string;
  registration: { id: string; event: { id: string; title: string } } | null;
  enrollment: { id: string; course: { id: string; title: string } } | null;
}

export default function PaymentPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['payment', paymentId],
    queryFn: async () => {
      const { data: response } = await api.get(`/payments/${paymentId}`);
      return response.data ?? response as PaymentDetail;
    },
  });

  const mockAction = useMutation({
    mutationFn: async (action: 'success' | 'fail' | 'cancel') => {
      const { data: response } = await api.post(`/payments/${paymentId}/mock-${action}`);
      return response.data ?? response;
    },
    onSuccess: (result: PaymentDetail) => {
      toast.success(
        result.status === 'successful'
          ? 'Payment successful!'
          : result.status === 'failed'
            ? 'Payment failed'
            : 'Payment cancelled',
      );
      queryClient.invalidateQueries({ queryKey: ['payment', paymentId] });
      refetch();
    },
    onError: () => toast.error('Mock action failed'),
  });

  if (isLoading) return <LoadingSkeleton lines={6} variant="card" />;
  if (isError) return <ErrorState title="Failed to load payment" description={error?.message ?? 'Payment not found'} onRetry={refetch} />;
  if (!data) return null;

  const payment = data;
  const itemType = payment.registration ? 'EVENT' as const : 'COURSE' as const;
  const itemTitle = payment.registration?.event?.title ?? payment.enrollment?.course?.title ?? 'N/A';
  const returnHref = payment.registration ? '/events' : '/courses';

  return (
    <div className="animate-fade-in space-y-6">
      <Link
        href={returnHref}
        className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-secondary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {itemType === 'EVENT' ? 'Events' : 'Courses'}
      </Link>

      <h1 className="font-heading text-2xl font-bold text-text-primary">Payment</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <PaymentSummary
            id={payment.id}
            amount={payment.amount}
            currency={payment.currency}
            status={payment.status}
            provider={payment.provider}
            createdAt={payment.createdAt}
            itemType={itemType}
            itemTitle={itemTitle}
          />
        </div>

        <div className="space-y-6">
          <Card variant="elevated" className="space-y-4 p-6">
            <h3 className="font-heading text-lg font-semibold text-text-primary">Actions</h3>

            {payment.status === 'successful' && (
              <div className="flex flex-col items-center gap-3 rounded-xl bg-success/10 p-6 text-center">
                <CheckCircle2 className="h-12 w-12 text-success" />
                <div>
                  <p className="text-lg font-semibold text-success">Payment Successful</p>
                  <p className="text-sm text-text-secondary">
                    {itemType === 'EVENT'
                      ? 'Your registration is being processed. You will receive a QR ticket once approved.'
                      : 'You now have full access to this course.'}
                  </p>
                </div>
              </div>
            )}

            {payment.status === 'failed' && (
              <div className="rounded-xl bg-error/10 p-4 text-center">
                <p className="font-semibold text-error">Payment Failed</p>
                <p className="mt-1 text-sm text-text-secondary">You can try again or choose another payment method.</p>
              </div>
            )}

            {payment.status === 'cancelled' && (
              <div className="rounded-xl bg-text-muted/10 p-4 text-center">
                <p className="font-semibold text-text-muted">Payment Cancelled</p>
              </div>
            )}

            <PaymentActions
              status={payment.status}
              onSuccess={() => mockAction.mutate('success')}
              onFail={() => mockAction.mutate('fail')}
              onCancel={() => mockAction.mutate('cancel')}
              loading={mockAction.isPending}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
