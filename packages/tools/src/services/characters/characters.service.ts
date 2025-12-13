import {
	collection,
	doc,
	getDocs,
	orderBy,
	query,
	serverTimestamp,
	setDoc,
	updateDoc,
	where,
} from 'firebase/firestore';
import { dbFirebase } from '../../hooks';

const COLLECTION = 'character';

const collectionRef = collection(dbFirebase, COLLECTION);

export interface CharacterInterface {
	id: string;
	name: string;
	region: string;
	description: string;
	slug: string;
}

export const charactersService = {
	async save(props: CharacterInterface) {
		const q = query(collectionRef, where('slug', '==', props.slug));
		const snap = await getDocs(q);

		if (!snap.empty) return null;

		const docRef = doc(collectionRef);

		await setDoc(docRef, {
			...props,
			createdAt: serverTimestamp(),
			timestamp: serverTimestamp(),
		});

		return docRef;
	},

	async update(props: CharacterInterface) {
		const q = query(collectionRef, where('slug', '==', props.slug));
		const snap = await getDocs(q);

		if (snap && !snap.empty) {
			const foundId = snap.docs[0]?.id;

			if (foundId !== props.id) return null;
		}

		const docRef = doc(collectionRef, props.id);

		await updateDoc(docRef, {
			...props,
			timestamp: serverTimestamp(),
		});

		return docRef;
	},

	async getCharacters() {
		const q = query(collectionRef, orderBy('name', 'asc'));

		const snapshot = await getDocs(q);

		return snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		})) as CharacterInterface[];
	},

	async getCharacterBySlug(slug: string) {
		const q = query(collectionRef, where('slug', '==', slug));
		const snap = await getDocs(q);

		if (!snap || snap.empty || !snap.docs[0]) return null;

		return snap.docs[0].data() as CharacterInterface;
	},
};
