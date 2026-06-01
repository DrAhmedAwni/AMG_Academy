import { apiRequest } from '../../lib/api';
import type { PaginationMeta } from '../../types/api';

export interface ApiPage<T> {
  data: T[];
  meta: PaginationMeta;
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

  const response = await apiRequest<{ items: MobileNotification[]; meta: PaginationMeta }>(
    `/notifications${query ? `?${query}` : ''}`,
  );

  return {
    data: response.items.map(normalizeNotification),
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
  return apiRequest<Record<string, boolean>>('/notifications/preferences');
}

export async function updateNotificationPreferences(
  preferences: Record<string, boolean>,
): Promise<Record<string, boolean>> {
  return apiRequest<Record<string, boolean>>('/notifications/preferences', {
    method: 'PATCH',
    body: JSON.stringify(preferences),
    headers: { 'Content-Type': 'application/json' },
  });
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
