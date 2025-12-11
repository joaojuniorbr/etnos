import {
	collection,
	doc,
	getDocs,
	serverTimestamp,
	setDoc,
} from 'firebase/firestore';
import { dbFirebase } from '../../hooks';

const COLLECTION = 'character';

export const charactersService = {
	async save(props: {
		slug: string;
		name: number;
		description: string;
		region: string;
		imageUrl: string;
	}) {
		const collectionRef = collection(dbFirebase, COLLECTION);
		const docRef = doc(collectionRef);

		const getCharacter = await getDocs(collectionRef);

		const character = getCharacter.docs
			.map((doc) => doc.data())
			.find((doc) => doc.slug === props.slug);

		if (character) {
			return null;
		}

		return setDoc(docRef, {
			...props,
			timestamp: serverTimestamp(),
			createdAt: serverTimestamp(),
		});
	},
};
