'use client';

import { useQuery } from '@tanstack/react-query';
import type { NotificationTemplateInterface } from '@etnos/types';
import { notificationKeys } from '../../query-keys';
import { notificationsService } from '@etnos/services';

export const useNotificationTemplates = (options?: { enabled?: boolean }) =>
	useQuery<NotificationTemplateInterface[]>({
		queryKey: notificationKeys.templates(),
		queryFn: () => notificationsService.getTemplates(),
		enabled: options?.enabled !== false,
	});
