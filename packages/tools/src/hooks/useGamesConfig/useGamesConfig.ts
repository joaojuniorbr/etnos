'use client';

import { useQuery } from '@tanstack/react-query';
import { QUERY_STALE_TIME } from '../../constants/query-cache';
import { gameConfigKeys } from '../../query-keys';
import { configGamesService } from '@etnos/services';

export const useGamesConfig = (gameSlug: string) =>
	useQuery({
		queryKey: gameConfigKeys.byGame(gameSlug),
		enabled: !!gameSlug,
		staleTime: QUERY_STALE_TIME.catalog,
		queryFn: () => configGamesService.getByGame(gameSlug),
	});
