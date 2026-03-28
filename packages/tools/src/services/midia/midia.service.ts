import { api } from '../../helpers';
import type { MidiaInterface } from '@etnos/types';

export const midiaService = {
	getPathFromUrl(url: string): string {
		const decodeUrl = decodeURIComponent(url);
		const start = decodeUrl.indexOf('/o/') + 3;
		const end = decodeUrl.indexOf('?');
		return decodeUrl.substring(start, end);
	},

	async uploadImage(file: File, folder: string, userId: string) {
		if (!userId) throw new Error('Usuário não encontrado');

		const formData = new FormData();
		formData.append('file', file);
		formData.append('folder', folder);

		const response = await api.post('/midia/upload', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});

		return response.data;
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
		cursor?: number,
		folder?: string,
		showAll?: boolean
	) {
		if (!userId) {
			return {
				data: [],
				nextCursor: undefined,
			};
		}

		const page = cursor ?? 1;

		const response = await api.get(showAll ? '/midia/admin' : '/midia', {
			params: {
				limit: limitNumber,
				page,
				folder,
			},
		});

		return response.data;
	},

	saveMidia(props: MidiaInterface) {
		return api.post('/midia', props).then((res) => res.data);
	},

	async deleteMidia(item: MidiaInterface, showAll?: boolean) {
		if (item.id) {
			const path = showAll ? `/midia/admin/${item.id}` : `/midia/${item.id}`;
			return api.delete(path).then((res) => res.data);
		}

		return this.deleteMidiaFromUrl(item.url, showAll);
	},

	async deleteMidiaFromUrl(url: string, showAll?: boolean) {
		return api
			.delete(showAll ? '/midia/admin/by-url' : '/midia/by-url', {
				params: { url },
			})
			.then((res) => res.data);
	},

	getFolders(userId: string, showAll?: boolean) {
		if (!userId) return Promise.resolve([]);

		return api
			.get(showAll ? '/midia/admin/folders' : '/midia/folders')
			.then((res) => res.data);
	},
};
