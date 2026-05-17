'use client';

import { useQuery } from '@tanstack/react-query';
import {
	ADMIN_DASHBOARD_ALL_SCHOOLS,
	type AdminDashboardNpsInterface,
} from '@etnos/types';
import { schoolService } from '@etnos/services';

export const useAdminDashboardNps = (
	gameSlug: string,
	schoolId: string,
	options?: { enabled?: boolean },
) =>
	useQuery<AdminDashboardNpsInterface>({
		queryKey: ['schools', 'admin-dashboard-nps', gameSlug, schoolId],
		queryFn: () =>
			schoolService.getDashboardNps({
				gameSlug,
				schoolId:
					schoolId === ADMIN_DASHBOARD_ALL_SCHOOLS ? undefined : schoolId,
			}),
		enabled: options?.enabled !== false && Boolean(gameSlug),
	});
