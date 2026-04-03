'use client';

import { useQuery } from '@tanstack/react-query';
import { scoreGamesService, useAuth } from '@etnos/tools';

export const useScoreHistory = (gameSlug?: string) => {
	const { user } = useAuth();
	const userId = user?.uid ?? '';

	return useQuery({
		queryKey: ['games', 'score-history', userId, gameSlug],
		queryFn: () => scoreGamesService.getScoreHistory(userId, gameSlug),
		enabled: !!userId,
	});
};
