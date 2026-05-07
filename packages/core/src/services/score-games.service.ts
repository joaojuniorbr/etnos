import type { AxiosInstance } from 'axios';
import type { ScoreHistory, ScoreInterface } from '@etnos/types';

const withUserGuard = <T>(
	userId: string,
	callback: () => Promise<T>,
	fallback: T,
) => (userId ? callback() : Promise.resolve(fallback));

export const createScoreGamesService = (api: AxiosInstance) => ({
	saveScore(
		slug: string,
		characterSlug: string,
		score: number,
		userId: string,
	) {
		return withUserGuard(
			userId,
			() =>
				api
					.post('/games/score', {
						slug,
						characterSlug,
						score,
					})
					.then((response) => response.data),
			null,
		);
	},

	saveScoreHistory(
		slug: string,
		characterSlug: string,
		score: number,
		userId: string,
		options?: { phase?: 'start' | 'end'; sessionId?: string },
	) {
		return withUserGuard(
			userId,
			() =>
				api
					.post('/games/score/history', {
						slug,
						characterSlug,
						score,
						...options,
					})
					.then((response) => response.data),
			null,
		);
	},

	getScore(userId: string): Promise<ScoreInterface[]> {
		return withUserGuard(
			userId,
			() => api.get('/games/score').then((response) => response.data),
			[],
		);
	},

	getScoreHistory(userId: string, gameSlug?: string): Promise<ScoreHistory[]> {
		return withUserGuard(
			userId,
			() =>
				api
					.get('/games/score/history', {
						params: gameSlug ? { gameSlug } : undefined,
					})
					.then((response) => response.data),
			[],
		);
	},

	submitGameNps(
		slug: string,
		characterSlug: string,
		rating: number,
		userId: string,
		comment?: string,
	) {
		return withUserGuard(
			userId,
			() =>
				api
					.post('/games/nps', {
						slug,
						characterSlug,
						rating,
						comment,
					})
					.then((response) => response.data),
			null,
		);
	},

	getGameNps(slug: string, userId: string) {
		return withUserGuard(
			userId,
			() => api.get(`/games/nps/${slug}`).then((response) => response.data),
			null,
		);
	},
});
