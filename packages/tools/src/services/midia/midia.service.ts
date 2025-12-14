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
	QueryConstraint,
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
		cursor?: QueryDocumentSnapshot,
		folder?: string
	) {
		const collectionRef = collection(dbFirebase, COLLECTION);

		const constraints: QueryConstraint[] = [
			where('userId', '==', userId),
			limit(limitNumber),
		];

		if (folder) {
			constraints.unshift(where('folder', '==', folder));
		}

		if (cursor) {
			constraints.push(startAfter(cursor));
		}

		const q = query(collectionRef, ...constraints);

		const snapshot = await getDocs(q);

		const hasNextPage = snapshot.docs.length === limitNumber;

		return {
			data: snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as MidiaInterface[],

			nextCursor: hasNextPage
				? snapshot.docs[snapshot.docs.length - 1]
				: undefined,
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

	async getFolders(userId: string) {
		const collectionRef = collection(dbFirebase, COLLECTION);

		const q = query(collectionRef, where('userId', '==', userId));

		const snapshot = await getDocs(q);

		const map = new Map<string, number>();

		snapshot.docs.forEach((doc) => {
			const folder = doc.data().folder;
			if (!folder) return;

			map.set(folder, (map.get(folder) ?? 0) + 1);
		});

		return Array.from(map.entries())
			.map(([folder, count]) => ({
				folder,
				count,
			}))
			.sort((a, b) => a.folder.localeCompare(b.folder, 'pt-BR'));
	},
};
