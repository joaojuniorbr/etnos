'use client';

import { useQuery } from '@tanstack/react-query';
import { configGamesService } from '@etnos/services';

export const useGamesConfig = (gameSlug: string) =>
	useQuery({
		queryKey: ['config-games', gameSlug],
		enabled: !!gameSlug,
		queryFn: () => configGamesService.getByGame(gameSlug),
	});
