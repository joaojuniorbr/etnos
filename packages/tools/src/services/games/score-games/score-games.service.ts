import { api } from '../../../helpers';

export interface ScoreInterface {
	id?: string;
	characterSlug: string;
	score: number;
	slug: string;
	timestamp?: any;
	userId: string;
	createdAt?: any;
}

export const scoreGamesService = {
	saveScore(
		slug: string,
		characterSlug: string,
		score: number,
		userId: string
	) {
		if (!userId) return Promise.resolve(null);

		return api
			.post('/games/score', {
				slug,
				characterSlug,
				score,
			})
			.then((res) => res.data);
	},

	getScore(userId: string) {
		if (!userId) return Promise.resolve([]);

		return api.get('/games/score').then((res) => res.data);
	},

	getFromGameScore(slug: string, characterSlug: string, userId: string) {
		if (!userId) return Promise.resolve(null);

		return api
			.get(`/games/score/${slug}/${characterSlug}`)
			.then((res) => res.data);
	},
};
