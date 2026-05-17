'use client';

import { useQuery } from '@tanstack/react-query';
import type { UserRankingInterface } from '@etnos/types';
import { schoolKeys } from '../../query-keys';
import { schoolService } from '@etnos/services';

export const useSchoolUsersRanking = (
	schoolId: string,
	gameSlug?: string,
	characterSlug?: string,
	options?: { enabled?: boolean },
) =>
	useQuery<UserRankingInterface[]>({
		queryKey: schoolKeys.usersRanking(
			schoolId,
			gameSlug ?? 'all',
			characterSlug ?? 'all',
		),
		queryFn: () =>
			schoolService.getUsersRankingBySchool(
				schoolId,
				gameSlug,
				characterSlug,
			),
		enabled: options?.enabled !== false && Boolean(schoolId),
	});
