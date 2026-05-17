'use client';

import { useQuery } from '@tanstack/react-query';
import type { SchoolRankingInterface } from '@etnos/types';
import { schoolKeys } from '../../query-keys';
import { schoolService } from '@etnos/services';

export const useSchoolRanking = (
	gameSlug?: string,
	options?: { enabled?: boolean },
) =>
	useQuery<SchoolRankingInterface[]>({
		queryKey: schoolKeys.ranking(gameSlug),
		queryFn: () => schoolService.getRanking(gameSlug),
		enabled: options?.enabled !== false,
	});
