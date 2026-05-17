'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@etnos/tools';
import { scoreGamesService } from '@etnos/services';

export const useScoreHistory = (gameSlug?: string) => {
	const { user } = useAuth();
	const userId = user?.uid ?? '';

	return useQuery({
		queryKey: ['games', 'score-history', userId, gameSlug],
		queryFn: () => scoreGamesService.getScoreHistory(userId, gameSlug),
		enabled: !!userId,
	});
};
