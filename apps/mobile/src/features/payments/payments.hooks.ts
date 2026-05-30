import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PaymentAction } from './payments.api';
import * as paymentsApi from './payments.api';

export const paymentQueryKeys = {
  all: ['payments'] as const,
  detail: (paymentId: string) => [...paymentQueryKeys.all, 'detail', paymentId] as const,
};

export function usePaymentQuery(paymentId: string | undefined) {
  return useQuery({
    queryKey: paymentQueryKeys.detail(paymentId ?? ''),
    queryFn: () => paymentsApi.getPayment(paymentId ?? ''),
    enabled: Boolean(paymentId),
    refetchInterval: (query) =>
      query.state.data?.status === 'pending' ? 10_000 : false,
  });
}

export function usePaymentActionMutation(paymentId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (action: PaymentAction) => {
      if (!paymentId) {
        throw new Error('Payment id is required');
      }

      return paymentsApi.mockPaymentAction(paymentId, action);
    },
    onSuccess: async (payment) => {
      queryClient.setQueryData(paymentQueryKeys.detail(payment.id), payment);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: paymentQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['events'] }),
        queryClient.invalidateQueries({ queryKey: ['registrations'] }),
        queryClient.invalidateQueries({ queryKey: ['qr-tickets'] }),
        queryClient.invalidateQueries({ queryKey: ['tickets'] }),
        queryClient.invalidateQueries({ queryKey: ['courses'] }),
        queryClient.invalidateQueries({ queryKey: ['enrollments'] }),
      ]);
    },
  });
}

export const getPaymentDisplayState = paymentsApi.getPaymentDisplayState;
export const isSuccessfulPaymentStatus = paymentsApi.isSuccessfulPaymentStatus;
