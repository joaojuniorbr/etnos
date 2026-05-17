import type { CharacterInterface } from '@etnos/types';
import { api } from '../api';

export const charactersService = {
	save(character: CharacterInterface) {
		return api.post('/characters', character).then((res) => res.data);
	},

	update(character: CharacterInterface) {
		return api
			.patch(`/characters/${character.id}`, character)
			.then((res) => res.data);
	},

	getCharacters(slug?: string) {
		return api
			.get('/characters', {
				params: slug ? { slug } : undefined,
			})
			.then((res) => res.data);
	},

	getCharacterBySlug(slug: string) {
		return api.get(`/characters/${slug}`).then((res) => res.data);
	},

	getCharacterAvatars(slug: string) {
		return api.get(`/characters/${slug}/avatars`).then((res) => res.data);
	},
};
