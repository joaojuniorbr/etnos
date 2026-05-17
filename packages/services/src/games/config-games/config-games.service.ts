import { api } from '../../api';
import type { ConfigGamesInterface } from '@etnos/types';

export const configGamesService = {
	save(data: ConfigGamesInterface) {
		return api.post('/games/config', data).then((res) => res.data);
	},

	get(gameSlug: string, characterSlug: string) {
		return api
			.get(`/games/config/${gameSlug}/${characterSlug}`)
			.then((res) => res.data);
	},

	getByGame(gameSlug: string) {
		return api.get(`/games/config/by-game/${gameSlug}`).then((res) => res.data);
	},

	remove(gameSlug: string, characterSlug: string) {
		return api
			.delete(`/games/config/${gameSlug}/${characterSlug}`)
			.then((res) => res.data);
	},
};
