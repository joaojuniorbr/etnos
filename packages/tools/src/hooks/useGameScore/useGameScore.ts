import { useQuery } from '@tanstack/react-query';
import { gamesService } from '../../services';

export const useGameScore = (
	userId: string,
	slug: string,
	characterSlug: string
) =>
	useQuery({
		queryKey: ['games', 'score', slug, userId],
		queryFn: () =>
			gamesService
				.getFromGameScore(slug, characterSlug, userId)
				.then((res) => res),
	});
