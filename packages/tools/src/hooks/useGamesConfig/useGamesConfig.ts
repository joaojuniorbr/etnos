import { useQuery } from '@tanstack/react-query';
import { configGamesService } from '../../services';

export const useGamesConfig = (gameSlug: string) =>
	useQuery({
		queryKey: ['config-games'],
		queryFn: () => configGamesService.getByGame(gameSlug),
	});
