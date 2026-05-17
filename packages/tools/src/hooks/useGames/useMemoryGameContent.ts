'use client';

import { useQuery } from '@tanstack/react-query';
import { GamesEnum } from '@etnos/types';
import { memoryGameContentService } from '@etnos/services';

export const useMemoryGameContent = (characterSlug: string) =>
	useQuery({
		queryKey: ['game', GamesEnum.MEMORY_GAME, characterSlug],
		queryFn: () => memoryGameContentService.getMemoryGameImages(characterSlug),
	});
