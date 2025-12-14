import { dbFirebase } from '@etnos/tools';
import {
	collection,
	doc,
	setDoc,
	getDoc,
	getDocs,
	deleteDoc,
	query,
	where,
	serverTimestamp,
} from 'firebase/firestore';

const COLLECTION = 'config-games';
const collectionRef = collection(dbFirebase, COLLECTION);

export interface ConfigGamesInterface {
	gameSlug: string;
	characterSlug: string;
	imageCoverUrl: string;
}

const getConfigId = (gameSlug: string, characterSlug: string) =>
	`${gameSlug}_${characterSlug}`;

export const configGamesService = {
	async save(data: ConfigGamesInterface) {
		const id = getConfigId(data.gameSlug, data.characterSlug);
		const docRef = doc(collectionRef, id);

		await setDoc(
			docRef,
			{
				...data,
				timestamp: serverTimestamp(),
				createdAt: serverTimestamp(),
			},
			{ merge: true }
		);

		return {
			id,
			...data,
		};
	},

	async get(gameSlug: string, characterSlug: string) {
		const id = getConfigId(gameSlug, characterSlug);
		const docRef = doc(collectionRef, id);

		const snapshot = await getDoc(docRef);

		if (!snapshot.exists()) return null;

		return {
			id: snapshot.id,
			...snapshot.data(),
		} as ConfigGamesInterface & { id: string };
	},

	async getByGame(gameSlug: string) {
		const q = query(collectionRef, where('gameSlug', '==', gameSlug));
		const snapshot = await getDocs(q);

		return snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		})) as (ConfigGamesInterface & { id: string })[];
	},

	async remove(gameSlug: string, characterSlug: string) {
		const id = getConfigId(gameSlug, characterSlug);
		const docRef = doc(collectionRef, id);

		await deleteDoc(docRef);

		return true;
	},
};
