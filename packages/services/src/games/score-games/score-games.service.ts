import { api } from '../../api';

export const scoreGamesService = {
	saveScore(
		slug: string,
		characterSlug: string,
		score: number,
		userId: string,
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

	saveScoreHistory(
		slug: string,
		characterSlug: string,
		score: number,
		userId: string,
		options?: { phase?: 'start' | 'end'; sessionId?: string },
	) {
		if (!userId) return Promise.resolve(null);

		return api
			.post('/games/score/history', {
				slug,
				characterSlug,
				score,
				...options,
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

	getScoreHistory(userId: string, gameSlug?: string) {
		if (!userId) return Promise.resolve([]);

		return api
			.get('/games/score/history', {
				params: { gameSlug },
			})
			.then((res) => res.data);
	},

	submitGameNps(
		slug: string,
		characterSlug: string,
		rating: number,
		userId: string,
		comment?: string,
	) {
		if (!userId) return Promise.resolve(null);

		return api
			.post('/games/nps', {
				slug,
				characterSlug,
				rating,
				comment,
			})
			.then((res) => res.data);
	},

	getGameNps(slug: string, userId: string) {
		if (!userId) return Promise.resolve(null);

		return api.get(`/games/nps/${slug}`).then((res) => res.data);
	},
};
