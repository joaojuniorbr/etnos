import { dbFirebase } from '@etnos/tools';
import {
	getDocs,
	collection,
	doc,
	setDoc,
	updateDoc,
	serverTimestamp,
} from 'firebase/firestore';

const COLLECTION = 'games';

export interface ScoreInterface {
	characterSlug: string;
	score: number;
	slug: string;
	timestamp: string;
	userId: string;
	createdAt?: string;
}

export const gamesService = {
	async saveScore(
		slug: string,
		characterSlug: string,
		score: number,
		userId: string
	) {
		const collectionRef = collection(dbFirebase, COLLECTION);
		const docRef = doc(collectionRef);

		const getScoreGame = await getDocs(collectionRef);

		const scoreGame = getScoreGame.docs
			.map((doc) => doc.data())
			.find(
				(doc) =>
					doc.slug === slug &&
					doc.userId === userId &&
					doc.characterSlug === characterSlug
			);

		if (scoreGame) {
			const scoreDoc = getScoreGame.docs.find(
				(d) =>
					d.data().slug === slug &&
					d.data().userId === userId &&
					d.data().characterSlug === characterSlug
			);

			return updateDoc(scoreDoc?.ref ?? docRef, {
				score,
				timestamp: serverTimestamp(),
			});
		}

		return setDoc(docRef, {
			slug,
			characterSlug,
			score,
			userId,
			timestamp: serverTimestamp(),
			createdAt: serverTimestamp(),
		});
	},

	async getScore(userId: string) {
		const collectionRef = collection(dbFirebase, COLLECTION);
		const getScoreGame = await getDocs(collectionRef);
		return getScoreGame.docs
			.filter((doc) => doc.data().userId === userId)
			.map((doc) => doc.data() as ScoreInterface);
	},

	async getFromGameScore(slug: string, characterSlug: string, userId: string) {
		const collectionRef = collection(dbFirebase, COLLECTION);
		const getScoreGame = await getDocs(collectionRef);
		return getScoreGame.docs
			.map((doc) => doc.data() as ScoreInterface)
			.find(
				(doc) =>
					doc.slug === slug &&
					doc.characterSlug === characterSlug &&
					doc.userId === userId
			);
	},
};
