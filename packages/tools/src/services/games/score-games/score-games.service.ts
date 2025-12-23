import { firestoreAdapter as fs, FirestoreRepository } from '@etnos/tools';

export interface ScoreInterface {
	id?: string;
	characterSlug: string;
	score: number;
	slug: string;
	timestamp?: any;
	userId: string;
	createdAt?: any;
}

const repo = new FirestoreRepository<ScoreInterface>('score-games');

export const scoreGamesService = {
	async saveScore(
		slug: string,
		characterSlug: string,
		score: number,
		userId: string
	) {
		const existingScore = await repo.findOne({
			where: [
				fs.where('slug', '==', slug),
				fs.where('characterSlug', '==', characterSlug),
				fs.where('userId', '==', userId),
			],
		});

		if (existingScore?.id) {
			return repo.update(existingScore.id, { score });
		}

		return repo.create({
			slug,
			characterSlug,
			score,
			userId,
		} as ScoreInterface);
	},

	async getScore(userId: string) {
		return repo.findMany({
			where: [fs.where('userId', '==', userId)],
		});
	},

	async getFromGameScore(slug: string, characterSlug: string, userId: string) {
		if (!userId) return null;

		return repo.findOne({
			where: [
				fs.where('slug', '==', slug),
				fs.where('characterSlug', '==', characterSlug),
				fs.where('userId', '==', userId),
			],
		});
	},
};
