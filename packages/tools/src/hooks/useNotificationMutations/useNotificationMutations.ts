'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
	CreateNotificationTemplatePayload,
	SendNotificationPayload,
	UpdateNotificationTemplatePayload,
} from '@etnos/types';
import { notificationKeys } from '../../query-keys';
import { notificationsService } from '@etnos/services';

export const useNotificationMutations = () => {
	const queryClient = useQueryClient();

	const invalidateTemplates = () => {
		void queryClient.invalidateQueries({
			queryKey: notificationKeys.templates(),
		});
	};

	const invalidateHistory = () => {
		void queryClient.invalidateQueries({
			queryKey: notificationKeys.history(),
		});
	};

	const sendNotification = useMutation({
		mutationFn: (payload: SendNotificationPayload) =>
			notificationsService.send(payload),
		onSuccess: invalidateHistory,
	});

	const createTemplate = useMutation({
		mutationFn: (payload: CreateNotificationTemplatePayload) =>
			notificationsService.createTemplate(payload),
		onSuccess: invalidateTemplates,
	});

	const updateTemplate = useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string;
			payload: UpdateNotificationTemplatePayload;
		}) => notificationsService.updateTemplate(id, payload),
		onSuccess: invalidateTemplates,
	});

	const deleteTemplate = useMutation({
		mutationFn: (id: string) => notificationsService.deleteTemplate(id),
		onSuccess: invalidateTemplates,
	});

	return {
		sendNotification,
		createTemplate,
		updateTemplate,
		deleteTemplate,
	};
};
