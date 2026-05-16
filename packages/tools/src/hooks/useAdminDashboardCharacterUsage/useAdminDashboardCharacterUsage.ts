'use client';

import { useQuery } from '@tanstack/react-query';
import type { AdminDashboardCharacterUsageInterface } from '@etnos/types';
import { schoolService } from '../../services';

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
				schoolId: schoolId === 'all' ? undefined : schoolId,
			}),
		enabled: options?.enabled !== false && Boolean(gameSlug),
	});
