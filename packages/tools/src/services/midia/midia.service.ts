import {
	ref,
	uploadBytes,
	getDownloadURL,
	deleteObject,
} from 'firebase/storage';

import { dbFirebase, storageFirebase } from '@etnos/tools';
import {
	getDocs,
	collection,
	doc,
	setDoc,
	serverTimestamp,
	deleteDoc,
	query,
	where,
	limit,
	startAfter,
	QueryDocumentSnapshot,
} from 'firebase/firestore';

const COLLECTION = 'midia';

export interface MidiaInterface {
	id?: string;
	url: string;
	userId: string;
	folder?: string;
	timestamp?: string;
	createdAt?: string;
}

export const midiaService = {
	getPathFromUrl(url: string): string {
		const decodeUrl = decodeURIComponent(url);
		const start = decodeUrl.indexOf('/o/') + 3;
		const end = decodeUrl.indexOf('?');

		return decodeUrl.substring(start, end);
	},

	async uploadImage(file: File, folder: string, userId: string) {
		const fileRef = ref(
			storageFirebase,
			`${folder}/${Date.now()}-${file.name}`
		);

		await uploadBytes(fileRef, file);

		const url = await getDownloadURL(fileRef);

		this.saveMidia({
			url,
			userId,
			folder,
		});

		return { url };
	},

	async uploadMultipleImages(files: File[], folder: string, userId: string) {
		const promises = files.map((file) =>
			this.uploadImage(file, folder, userId)
		);
		return Promise.all(promises);
	},

	async getMidia(
		userId: string,
		limitNumber: number,
		cursor?: QueryDocumentSnapshot
	) {
		const collectionRef = collection(dbFirebase, COLLECTION);

		let q = query(
			collectionRef,
			where('userId', '==', userId),
			limit(limitNumber)
		);

		if (cursor) {
			q = query(
				collectionRef,
				where('userId', '==', userId),
				startAfter(cursor),
				limit(limitNumber)
			);
		}

		const snapshot = await getDocs(q);

		return {
			data: snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as MidiaInterface[],

			nextCursor:
				snapshot.docs.length > 0
					? snapshot.docs[snapshot.docs.length - 1]
					: null,
		};
	},

	async saveMidia(props: MidiaInterface) {
		const collectionRef = collection(dbFirebase, COLLECTION);
		const docRef = doc(collectionRef);
		return setDoc(docRef, {
			...props,
			timestamp: serverTimestamp(),
			createdAt: serverTimestamp(),
		});
	},

	async deleteMidia(item: MidiaInterface) {
		try {
			const path = this.getPathFromUrl(item.url);

			const fileRef = ref(storageFirebase, path);

			await deleteObject(fileRef);

			await deleteDoc(doc(dbFirebase, COLLECTION, item.id!));

			return true;
		} catch (error) {
			console.error('Erro ao apagar arquivo:', error);
			return false;
		}
	},

	async deleteMidiaFromUrl(url: string) {
		try {
			const path = this.getPathFromUrl(url);

			const fileRef = ref(storageFirebase, path);
			await deleteObject(fileRef);

			const collectionRef = collection(dbFirebase, COLLECTION);
			const q = query(collectionRef, where('url', '==', url));
			const querySnapshot = await getDocs(q);

			for (const docSnap of querySnapshot.docs) {
				await deleteDoc(docSnap.ref);
			}

			return true;
		} catch (error) {
			console.error('Erro ao apagar arquivo por URL:', error);
			return false;
		}
	},
};
