'use client';

import { useQuery } from '@tanstack/react-query';
import { GamesEnum } from '@etnos/types';
import { guessGameContentService } from '@etnos/services';

export const useGuessGameContent = (characterSlug: string) =>
	useQuery({
		queryKey: ['game', GamesEnum.GUESS_GAME, characterSlug],
		queryFn: () => guessGameContentService.getContent(characterSlug),
		enabled: !!characterSlug,
	});

export const useGuessGamePlayableContent = (
	characterSlug: string,
	round: number,
) =>
	useQuery({
		queryKey: ['game', GamesEnum.GUESS_GAME, 'play', characterSlug, round],
		queryFn: () => guessGameContentService.getPlayableContent(characterSlug),
		enabled: !!characterSlug,
	});
