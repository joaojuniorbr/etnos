'use client';

import { useQuery } from '@tanstack/react-query';
import type { SchoolRankingInterface } from '@etnos/types';
import { schoolService } from '../../services';

export const useSchoolRanking = (
	gameSlug?: string,
	options?: { enabled?: boolean },
) =>
	useQuery<SchoolRankingInterface[]>({
		queryKey: ['schools', 'ranking', gameSlug ?? 'all'],
		queryFn: () => schoolService.getRanking(gameSlug),
		enabled: options?.enabled !== false,
	});
