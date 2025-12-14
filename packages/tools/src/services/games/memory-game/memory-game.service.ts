import {
	collection,
	deleteDoc,
	doc,
	getDocs,
	query,
	serverTimestamp,
	setDoc,
	where,
} from 'firebase/firestore';
import { dbFirebase } from '../../../hooks';

const COLLECTION = 'game-memory-game';

const collectionRef = collection(dbFirebase, COLLECTION);

export interface MemoryGameContentInterface {
	id: string;
	url: string;
	slug: string;
	idCharacter: string;
}

export const memoryGameContentService = {
	async saveContent(props: Partial<MemoryGameContentInterface>) {
		const docRef = doc(collectionRef);

		await setDoc(docRef, {
			...props,
			createdAt: serverTimestamp(),
			timestamp: serverTimestamp(),
		});

		return docRef;
	},

	async getContent(slug: string) {
		const q = query(collectionRef, where('slug', '==', slug));

		const snapshot = await getDocs(q);

		return snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		})) as MemoryGameContentInterface[];
	},

	async deleteContent(id: string) {
		try {
			await deleteDoc(doc(dbFirebase, COLLECTION, id));

			return true;
		} catch (error) {
			console.error('Erro ao apagar contenúdo:', error);
			return false;
		}
	},
};
