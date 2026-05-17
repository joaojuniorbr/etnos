'use client';

import { useQuery } from '@tanstack/react-query';
import { gameConfigKeys } from '../../query-keys';
import { scoreGamesService } from '@etnos/services';

export const useGameScore = (
	userId: string,
	slug: string,
	characterSlug: string,
) =>
	useQuery({
		queryKey: gameConfigKeys.score(slug, userId, characterSlug),
		enabled: Boolean(userId && slug && characterSlug),
		queryFn: () =>
			scoreGamesService
				.getFromGameScore(slug, characterSlug, userId)
				.then((res) => res),
	});
