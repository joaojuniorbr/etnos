'use client';

import { useQuery } from '@tanstack/react-query';
import { scoreGamesService } from '../../services';

export const useGameScore = (
	userId: string,
	slug: string,
	characterSlug: string
) =>
	useQuery({
		queryKey: ['games', 'score', slug, userId],
		queryFn: () =>
			scoreGamesService
				.getFromGameScore(slug, characterSlug, userId)
				.then((res) => res),
	});
