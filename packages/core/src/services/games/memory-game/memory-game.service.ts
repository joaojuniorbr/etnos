import type { AxiosInstance } from 'axios';

export type MemoryGameContentItem = {
	id: string;
	name: string;
	image: string;
};

export const createMemoryGameService = (api: AxiosInstance) => ({
	getMemoryGameImages(characterSlug: string): Promise<MemoryGameContentItem[]> {
		return api
			.get(`/games/memory/images/${characterSlug}`)
			.then((response) => response.data);
	},
});
