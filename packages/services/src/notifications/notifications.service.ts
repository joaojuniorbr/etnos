import type {
	NotificationLogInterface,
	NotificationTemplateInterface,
	SendNotificationPayload,
	CreateNotificationTemplatePayload,
	UpdateNotificationTemplatePayload,
	RegisterPushTokenPayload,
	UnregisterPushTokenPayload,
	CountNotificationRecipientsPayload,
} from '@etnos/types';
import { api } from '../api';

export const notificationsService = {
	registerPushToken(
		payload: RegisterPushTokenPayload,
	): Promise<{ ok: boolean }> {
		return api
			.post('/notifications/push-token', payload)
			.then((res) => res.data);
	},

	unregisterPushToken(
		payload?: UnregisterPushTokenPayload,
	): Promise<{ ok: boolean }> {
		return api
			.delete(
				'/notifications/push-token',
				payload ? { data: payload } : undefined,
			)
			.then((res) => res.data);
	},

	send(
		payload: SendNotificationPayload,
	): Promise<{ ok: boolean; sent: number }> {
		return api.post('/notifications/send', payload).then((res) => res.data);
	},

	countRecipients(
		payload: CountNotificationRecipientsPayload,
	): Promise<{ count: number }> {
		return api
			.get('/notifications/recipients-count', { params: payload })
			.then((res) => res.data);
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
		return api
			.post('/notifications/templates', payload)
			.then((res) => res.data);
	},

	updateTemplate(
		id: string,
		payload: UpdateNotificationTemplatePayload,
	): Promise<NotificationTemplateInterface> {
		return api
			.put(`/notifications/templates/${id}`, payload)
			.then((res) => res.data);
	},

	deleteTemplate(id: string): Promise<{ ok: boolean }> {
		return api.delete(`/notifications/templates/${id}`).then((res) => res.data);
	},
};
