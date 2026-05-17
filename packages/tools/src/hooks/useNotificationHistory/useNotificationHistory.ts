'use client';

import { useQuery } from '@tanstack/react-query';
import type { NotificationLogInterface } from '@etnos/types';
import { notificationKeys } from '../../query-keys';
import { notificationsService } from '@etnos/services';

export const useNotificationHistory = (options?: { enabled?: boolean }) =>
	useQuery<NotificationLogInterface[]>({
		queryKey: notificationKeys.history(),
		queryFn: () => notificationsService.getHistory(),
		enabled: options?.enabled !== false,
	});
