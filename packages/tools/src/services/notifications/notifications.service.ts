import type {
  NotificationLogInterface,
  NotificationTemplateInterface,
  SendNotificationPayload,
  CreateNotificationTemplatePayload,
  UpdateNotificationTemplatePayload,
  RegisterPushTokenPayload,
} from '@etnos/types';
import { api } from '../../helpers';

export const notificationsService = {
  registerPushToken(payload: RegisterPushTokenPayload): Promise<{ ok: boolean }> {
    return api.post('/notifications/push-token', payload).then((res) => res.data);
  },

  send(payload: SendNotificationPayload): Promise<{ ok: boolean; sent: number }> {
    return api.post('/notifications/send', payload).then((res) => res.data);
  },

  getHistory(): Promise<NotificationLogInterface[]> {
    return api.get('/notifications/history').then((res) => res.data);
  },

  getTemplates(): Promise<NotificationTemplateInterface[]> {
    return api.get('/notifications/templates').then((res) => res.data);
  },

  createTemplate(
    payload: CreateNotificationTemplatePayload,
  ): Promise<NotificationTemplateInterface> {
    return api.post('/notifications/templates', payload).then((res) => res.data);
  },

  updateTemplate(
    id: string,
    payload: UpdateNotificationTemplatePayload,
  ): Promise<NotificationTemplateInterface> {
    return api.put(`/notifications/templates/${id}`, payload).then((res) => res.data);
  },

  deleteTemplate(id: string): Promise<{ ok: boolean }> {
    return api.delete(`/notifications/templates/${id}`).then((res) => res.data);
  },
};
