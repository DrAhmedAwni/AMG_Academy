import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NotificationFilters } from './notifications.api';
import * as notificationsApi from './notifications.api';

export const notificationQueryKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationQueryKeys.all, 'list'] as const,
  list: (filters: NotificationFilters) => [...notificationQueryKeys.lists(), filters] as const,
  preferences: () => [...notificationQueryKeys.all, 'preferences'] as const,
  announcements: () => ['announcements'] as const,
};

export function useNotificationsQuery(filters: NotificationFilters = {}) {
  return useQuery({
    queryKey: notificationQueryKeys.list(filters),
    queryFn: () => notificationsApi.listNotifications(filters),
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationsApi.markNotificationRead(notificationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllNotificationsRead(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
  });
}

export function useNotificationPreferencesQuery() {
  return useQuery({
    queryKey: notificationQueryKeys.preferences(),
    queryFn: () => notificationsApi.getNotificationPreferences(),
  });
}

export function useUpdateNotificationPreferencesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: Record<string, boolean>) =>
      notificationsApi.updateNotificationPreferences(preferences),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationQueryKeys.preferences() });
    },
  });
}

export function useAnnouncementsQuery() {
  return useQuery({
    queryKey: notificationQueryKeys.announcements(),
    queryFn: () => notificationsApi.listPublishedAnnouncements(),
  });
}
