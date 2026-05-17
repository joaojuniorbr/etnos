import type { AxiosInstance } from 'axios';
import type { CharacterInterface, MidiaInterface } from '@etnos/types';

export const createCharactersService = (api: AxiosInstance) => ({
	getCharacters(slug?: string): Promise<CharacterInterface[]> {
		return api
			.get('/characters', {
				params: slug ? { slug } : undefined,
			})
			.then((response) => response.data);
	},

	getCharacterBySlug(slug: string): Promise<CharacterInterface | null> {
		return api.get(`/characters/${slug}`).then((response) => response.data);
	},

	getCharacterAvatars(slug: string): Promise<MidiaInterface[]> {
		return api
			.get(`/characters/${slug}/avatars`)
			.then((response) => response.data);
	},
});
