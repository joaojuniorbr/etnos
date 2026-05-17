'use client';

import { useQuery } from '@tanstack/react-query';
import { GamesEnum, type MemoryGameContentInterface } from '@etnos/types';
import { memoryGameContentService } from '@etnos/services';

export const useMemoryGameEditorContent = (
	characterSlug: string,
	options?: { enabled?: boolean },
) =>
	useQuery<MemoryGameContentInterface[]>({
		queryKey: ['game', GamesEnum.MEMORY_GAME, 'editor', characterSlug],
		queryFn: () => memoryGameContentService.getContent(characterSlug),
		enabled: options?.enabled !== false && Boolean(characterSlug),
	});
