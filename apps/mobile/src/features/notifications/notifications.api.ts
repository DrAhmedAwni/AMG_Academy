import { apiRequest } from '../../lib/api';
import type { PaginationMeta } from '../../types/api';

export interface ApiPage<T> {
  data: T[];
  meta: PaginationMeta;
}

type ListEnvelope<T> = {
  data?: T[];
  items?: T[];
  meta: PaginationMeta;
};

type PreferencesEnvelope = Record<string, boolean> | { data: Record<string, boolean> };

function unwrapPreferences(response: PreferencesEnvelope): Record<string, boolean> {
  if (
    'data' in response &&
    typeof response.data === 'object' &&
    response.data !== null
  ) {
    return response.data;
  }

  return response as Record<string, boolean>;
}

export interface MobileNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
}

export interface MobileAnnouncement {
  id: string;
  title: string;
  body: string;
  targetRoles: string[];
  status: string;
  publishedAt: string | null;
  createdAt: string;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  read?: boolean;
}

export function normalizeNotification(raw: MobileNotification): MobileNotification {
  return raw;
}

export async function listNotifications(filters: NotificationFilters = {}): Promise<ApiPage<MobileNotification>> {
  const params: Record<string, string | undefined> = {};
  if (filters.page) params.page = String(filters.page);
  if (filters.limit) params.limit = String(filters.limit);
  if (filters.read !== undefined) params.read = String(filters.read);

  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();

  const response = await apiRequest<ListEnvelope<MobileNotification>>(
    `/notifications${query ? `?${query}` : ''}`,
  );
  const data = response.data ?? response.items ?? [];

  return {
    data: data.map(normalizeNotification),
    meta: response.meta,
  };
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await apiRequest(`/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: 'PATCH',
  });
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiRequest('/notifications/read-all', { method: 'PATCH' });
}

export async function getNotificationPreferences(): Promise<Record<string, boolean>> {
  const response = await apiRequest<PreferencesEnvelope>('/notifications/preferences');
  return unwrapPreferences(response);
}

export async function updateNotificationPreferences(
  preferences: Record<string, boolean>,
): Promise<Record<string, boolean>> {
  await apiRequest<unknown>('/notifications/preferences', {
    method: 'PATCH',
    body: JSON.stringify(preferences),
    headers: { 'Content-Type': 'application/json' },
  });
  return preferences;
}

export async function listPublishedAnnouncements(
  filters: NotificationFilters = {},
): Promise<ApiPage<MobileAnnouncement>> {
  const params: Record<string, string | undefined> = {};
  if (filters.page) params.page = String(filters.page);
  if (filters.limit) params.limit = String(filters.limit);

  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();

  const response = await apiRequest<{ items: MobileAnnouncement[]; meta: PaginationMeta }>(
    `/announcements${query ? `?${query}` : ''}`,
  );

  return {
    data: response.items,
    meta: response.meta,
  };
}
