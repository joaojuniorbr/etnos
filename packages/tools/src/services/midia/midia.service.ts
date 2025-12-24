import {
	ref,
	uploadBytes,
	getDownloadURL,
	deleteObject,
} from 'firebase/storage';
import {
	storageFirebase,
	firestoreAdapter as fs,
	FirestoreRepository,
	errorMessage,
} from '@etnos/tools';

import { QueryDocumentSnapshot } from 'firebase/firestore';

const repo = new FirestoreRepository<MidiaInterface>('midia');

export interface MidiaInterface {
	id?: string;
	url: string;
	userId: string;
	folder?: string;
	timestamp?: any;
	createdAt?: any;
}

export const midiaService = {
	getPathFromUrl(url: string): string {
		const decodeUrl = decodeURIComponent(url);
		const start = decodeUrl.indexOf('/o/') + 3;
		const end = decodeUrl.indexOf('?');
		return decodeUrl.substring(start, end);
	},

	async uploadImage(file: File, folder: string, userId: string) {
		const path = `${folder}/${Date.now()}-${file.name}`;
		const fileRef = ref(storageFirebase, path);

		await uploadBytes(fileRef, file);
		const url = await getDownloadURL(fileRef);

		await this.saveMidia({ url, userId, folder });

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
		const whereConstraints = [fs.where('userId', '==', userId)];

		if (folder) whereConstraints.push(fs.where('folder', '==', folder));

		const { data, lastDoc } = await repo.findWithPaginate({
			where: whereConstraints,
			limit: limitNumber + 1,
			startAfter: cursor,
		});

		const hasNextPage = data.length > limitNumber;
		const items = hasNextPage ? data.slice(0, limitNumber) : data;

		return {
			data: items,
			nextCursor: hasNextPage ? lastDoc : undefined,
		};
	},

	async saveMidia(props: MidiaInterface) {
		return repo.create(props);
	},

	async deleteMidia(item: MidiaInterface) {
		try {
			const path = this.getPathFromUrl(item.url);
			const fileRef = ref(storageFirebase, path);

			await deleteObject(fileRef);
			await repo.delete(item.id!);

			return true;
		} catch (error) {
			errorMessage(error);
			return false;
		}
	},

	async deleteMidiaFromUrl(url: string) {
		try {
			const path = this.getPathFromUrl(url);
			const fileRef = ref(storageFirebase, path);
			await deleteObject(fileRef);

			const items = await repo.findMany({
				where: [fs.where('url', '==', url)],
			});

			for (const item of items) {
				await repo.delete(item.id!);
			}

			return true;
		} catch (error) {
			errorMessage(error);
			return false;
		}
	},

	async getFolders(userId: string) {
		const docs = await repo.findMany({
			where: [fs.where('userId', '==', userId)],
		});

		const map = new Map<string, number>();

		docs.forEach((doc) => {
			if (!doc.folder) return;
			map.set(doc.folder, (map.get(doc.folder) ?? 0) + 1);
		});

		return Array.from(map.entries())
			.map(([folder, count]) => ({ folder, count }))
			.sort((a, b) => a.folder.localeCompare(b.folder, 'pt-BR'));
	},
};
