'use client';

import { useQuery } from '@tanstack/react-query';
import type { AdminDashboardNpsInterface } from '@etnos/types';
import { schoolService } from '../../services';

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
				schoolId: schoolId === 'all' ? undefined : schoolId,
			}),
		enabled: options?.enabled !== false && Boolean(gameSlug),
	});
