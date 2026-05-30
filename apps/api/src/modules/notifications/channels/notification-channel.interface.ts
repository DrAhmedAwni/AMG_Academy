import { NotificationChannelType, NotificationType } from '@amg/shared';

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
}

export interface NotificationChannel {
  readonly type: NotificationChannelType;
  send(payload: NotificationPayload): Promise<void>;
}
