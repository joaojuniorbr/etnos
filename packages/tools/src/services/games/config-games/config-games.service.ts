import { firestoreAdapter as fs, FirestoreRepository } from '@etnos/tools';

export interface ConfigGamesInterface {
	id?: string;
	gameSlug: string;
	characterSlug: string;
	imageCoverUrl: string;
}

const repo = new FirestoreRepository<ConfigGamesInterface>('config-games');

const getConfigId = (gameSlug: string, characterSlug: string) =>
	`${gameSlug}_${characterSlug}`;

export const configGamesService = {
	async save(data: ConfigGamesInterface) {
		const id = getConfigId(data.gameSlug, data.characterSlug);

		await repo.update(id, data);

		return {
			id,
			...data,
		};
	},

	async get(gameSlug: string, characterSlug: string) {
		const id = getConfigId(gameSlug, characterSlug);

		return repo.findOne({
			where: [fs.where('__name__', '==', id)],
		});
	},

	async getByGame(gameSlug: string) {
		return repo.findMany({
			where: [fs.where('gameSlug', '==', gameSlug)],
		});
	},

	async remove(gameSlug: string, characterSlug: string) {
		const id = getConfigId(gameSlug, characterSlug);

		await repo.delete(id);
		return true;
	},
};
