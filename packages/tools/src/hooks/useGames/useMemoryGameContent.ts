'use client';

import { useQuery } from '@tanstack/react-query';
import { GamesEnum } from './useGames';
import { memoryGameContentService } from '../../services';

export const useMemoryGameContent = (characterSlug: string) =>
	useQuery({
		queryKey: ['game', GamesEnum.MEMORY_GAME, characterSlug],
		queryFn: () => memoryGameContentService.getMemoryGameImages(characterSlug),
	});
