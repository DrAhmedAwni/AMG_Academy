import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TicketFilters } from './tickets.api';
import * as ticketsApi from './tickets.api';

export const ticketQueryKeys = {
  all: ['qr-tickets'] as const,
  wallet: (filters: TicketFilters = {}) => [...ticketQueryKeys.all, 'wallet', filters] as const,
};

export function useTicketsQuery(filters: TicketFilters = {}) {
  return useQuery({
    queryKey: ticketQueryKeys.wallet(filters),
    queryFn: () => ticketsApi.listTickets(filters),
  });
}

export function useDeleteTicketMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketId: string) => ticketsApi.deleteTicket(ticketId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ticketQueryKeys.all });
    },
  });
}

export const canDeleteTicket = ticketsApi.canDeleteTicket;
export const getTicketWalletState = ticketsApi.getTicketWalletState;
export const isTicketDisplayable = ticketsApi.isTicketDisplayable;
