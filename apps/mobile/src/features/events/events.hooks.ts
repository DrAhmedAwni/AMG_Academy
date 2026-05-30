import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EventFilters, RegistrationFilters } from './events.api';
import * as eventsApi from './events.api';

export const eventQueryKeys = {
  all: ['events'] as const,
  lists: () => [...eventQueryKeys.all, 'list'] as const,
  list: (filters: EventFilters) => [...eventQueryKeys.lists(), filters] as const,
  detail: (eventSlug: string) => [...eventQueryKeys.all, 'detail', eventSlug] as const,
  reservations: (filters: RegistrationFilters = {}) =>
    ['registrations', 'mine', filters] as const,
};

export function useEventsQuery(filters: EventFilters = {}) {
  return useQuery({
    queryKey: eventQueryKeys.list(filters),
    queryFn: () => eventsApi.listEvents(filters),
  });
}

export function useEventQuery(eventSlug: string | undefined) {
  return useQuery({
    queryKey: eventQueryKeys.detail(eventSlug ?? ''),
    queryFn: () => eventsApi.getEvent(eventSlug ?? ''),
    enabled: Boolean(eventSlug),
  });
}

export function useReservationsQuery(filters: RegistrationFilters = {}) {
  return useQuery({
    queryKey: eventQueryKeys.reservations(filters),
    queryFn: () => eventsApi.listReservations(filters),
  });
}

export function useRegisterForEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => eventsApi.registerForEvent(eventId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: eventQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['registrations'] }),
        queryClient.invalidateQueries({ queryKey: ['payments'] }),
        queryClient.invalidateQueries({ queryKey: ['qr-tickets'] }),
        queryClient.invalidateQueries({ queryKey: ['tickets'] }),
      ]);
    },
  });
}

export const getEventActionState = eventsApi.getEventActionState;
export const getRegistrationPaymentRedirect = eventsApi.getRegistrationPaymentRedirect;
