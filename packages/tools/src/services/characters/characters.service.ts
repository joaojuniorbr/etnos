import { firestoreAdapter as fs } from '../../helpers';
import { FirestoreRepository } from '../../firestore';

export interface CharacterInterface {
	id: string;
	name: string;
	region: string;
	description: string;
	slug: string;
}

const repo = new FirestoreRepository<CharacterInterface>('character');

export const charactersService = {
	async save(character: CharacterInterface) {
		const exists = await repo.findOne({
			where: [fs.where('slug', '==', character.slug)],
		});

		if (exists) return null;

		return repo.create(character);
	},

	async update(character: CharacterInterface) {
		const existing = await repo.findOne({
			where: [fs.where('slug', '==', character.slug)],
		});

		if (existing && existing.id !== character.id) return null;

		return repo.update(character.id, character);
	},

	getCharacters() {
		return repo.findMany({
			orderBy: fs.orderBy('name', 'asc'),
		});
	},

	getCharacterBySlug(slug: string) {
		return repo.findOne({
			where: [fs.where('slug', '==', slug)],
		});
	},
};
