'use client';

import { useQuery } from '@tanstack/react-query';
import type { CountNotificationRecipientsPayload } from '@etnos/types';
import { notificationKeys } from '../../query-keys';
import { notificationsService } from '@etnos/services';

export const useNotificationRecipientsCount = (
	payload: CountNotificationRecipientsPayload | null,
	options?: { enabled?: boolean },
) =>
	useQuery({
		queryKey: notificationKeys.recipientsCount(
			payload?.targetType ?? 'none',
			payload?.schoolId ?? 'none',
			payload?.userId ?? 'none',
		),
		queryFn: () => notificationsService.countRecipients(payload!),
		enabled: options?.enabled !== false && Boolean(payload),
	});
