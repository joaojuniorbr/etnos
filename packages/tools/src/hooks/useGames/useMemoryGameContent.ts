'use client';

import { useQuery } from '@tanstack/react-query';
import { QUERY_STALE_TIME } from '../../constants/query-cache';
import { gameConfigKeys } from '../../query-keys';
import { memoryGameContentService } from '@etnos/services';

export const useMemoryGameContent = (characterSlug: string) =>
	useQuery({
		queryKey: gameConfigKeys.memoryContent(characterSlug),
		enabled: Boolean(characterSlug),
		staleTime: QUERY_STALE_TIME.catalog,
		queryFn: () => memoryGameContentService.getMemoryGameImages(characterSlug),
	});
