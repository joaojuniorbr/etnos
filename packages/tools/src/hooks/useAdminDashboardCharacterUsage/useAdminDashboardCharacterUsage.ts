'use client';

import { useQuery } from '@tanstack/react-query';
import {
	ADMIN_DASHBOARD_ALL_SCHOOLS,
	type AdminDashboardCharacterUsageInterface,
} from '@etnos/types';
import { schoolService } from '@etnos/services';

export const useAdminDashboardCharacterUsage = (
	gameSlug: string,
	schoolId: string,
	options?: { enabled?: boolean },
) =>
	useQuery<AdminDashboardCharacterUsageInterface>({
		queryKey: [
			'schools',
			'admin-dashboard-character-usage',
			gameSlug,
			schoolId,
		],
		queryFn: () =>
			schoolService.getDashboardCharacterUsage({
				gameSlug,
				schoolId:
					schoolId === ADMIN_DASHBOARD_ALL_SCHOOLS ? undefined : schoolId,
			}),
		enabled: options?.enabled !== false && Boolean(gameSlug),
	});
