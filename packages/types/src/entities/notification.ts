export type NotificationTargetType = 'GLOBAL' | 'SCHOOL' | 'INDIVIDUAL';

export interface NotificationTemplateInterface {
  id: string;
  title: string;
  message: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationLogInterface {
  id: string;
  title: string;
  message: string;
  targetType: NotificationTargetType;
  schoolId?: string | null;
  schoolName?: string | null;
  sentBy: string;
  sentByEmail?: string | null;
  sentAt: string;
  tokenCount: number;
}

export interface SendNotificationPayload {
  title: string;
  message: string;
  targetType: NotificationTargetType;
  schoolId?: string;
  userId?: string;
}

export interface CreateNotificationTemplatePayload {
  title: string;
  message: string;
}

export interface UpdateNotificationTemplatePayload {
  title?: string;
  message?: string;
}

export interface RegisterPushTokenPayload {
  token: string;
  platform?: string;
}
