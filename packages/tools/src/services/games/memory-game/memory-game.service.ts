import { firestoreAdapter as fs } from '../../../helpers';
import { FirestoreRepository } from '../../../firestore';

export interface MemoryGameContentInterface {
	id: string;
	url: string;
	slug: string;
	idCharacter: string;
}

const repo = new FirestoreRepository<MemoryGameContentInterface>(
	'game-memory-game'
);

export const memoryGameContentService = {
	async saveContent(props: Partial<MemoryGameContentInterface>) {
		return repo.create(props as MemoryGameContentInterface);
	},

	async getContent(slug: string) {
		return repo.findMany({
			where: [fs.where('slug', '==', slug)],
		});
	},

	async deleteContent(id: string) {
		try {
			await repo.delete(id);
			return true;
		} catch (error) {
			console.error('Erro ao apagar conteúdo:', error);
			return false;
		}
	},

	async getMemoryGameImages(
		characterSlug: string
	): Promise<{ name: string; image: string; id: string }[]> {
		const docs = await this.getContent(characterSlug);

		return docs.map((doc, index) => ({
			id: doc.id,
			name: `${characterSlug}-${index + 1}`,
			image: doc.url,
		}));
	},
};
