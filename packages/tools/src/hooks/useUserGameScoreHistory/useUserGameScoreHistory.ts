'use client';

import { useQuery } from '@tanstack/react-query';
import type { ScoreHistory } from '@etnos/types';
import { schoolKeys } from '../../query-keys';
import { schoolService } from '@etnos/services';

export const useUserGameScoreHistory = (
	schoolId: string,
	userId?: string,
	options?: { enabled?: boolean },
) =>
	useQuery<ScoreHistory[]>({
		queryKey: schoolKeys.userGameHistory(schoolId, userId ?? ''),
		queryFn: () => schoolService.getUserGameScoreHistory(schoolId, userId!),
		enabled:
			options?.enabled !== false && Boolean(schoolId) && Boolean(userId),
	});
