'use client';

import { useQuery } from '@tanstack/react-query';
import {
	ADMIN_DASHBOARD_ALL_SCHOOLS,
	type UserRankingInterface,
} from '@etnos/types';
import { schoolService } from '@etnos/services';

export const useAdminPerformanceTopUsers = (
	gameSlug: string,
	schoolId: string,
	options?: { limit?: number; enabled?: boolean },
) => {
	const limit = options?.limit ?? 10;

	return useQuery<UserRankingInterface[]>({
		queryKey: [
			'schools',
			'admin-performance-top-users',
			gameSlug,
			schoolId,
			limit,
		],
		queryFn: async () => {
			if (schoolId === ADMIN_DASHBOARD_ALL_SCHOOLS) {
				return schoolService.getDashboardTopUsers({ gameSlug, limit });
			}

			const ranking = await schoolService.getUsersRankingBySchool(
				schoolId,
				gameSlug,
			);
			return ranking.slice(0, limit);
		},
		enabled: options?.enabled !== false && Boolean(gameSlug),
	});
};
