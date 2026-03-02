import { api } from '../../../helpers';
import type { MemoryGameContentInterface } from '@etnos/types';

export const memoryGameContentService = {
	saveContent(props: Partial<MemoryGameContentInterface>) {
		return api.post('/games/memory', props).then((res) => res.data);
	},

	getContent(slug: string) {
		return api.get(`/games/memory/${slug}`).then((res) => res.data);
	},

	deleteContent(id: string) {
		return api.delete(`/games/memory/${id}`).then((res) => res.data);
	},

	getMemoryGameImages(characterSlug: string): Promise<
		{ name: string; image: string; id: string }[]
	> {
		return api
			.get(`/games/memory/images/${characterSlug}`)
			.then((res) => res.data);
	},
};
