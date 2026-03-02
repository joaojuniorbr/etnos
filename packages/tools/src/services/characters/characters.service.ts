import { api } from '../../helpers';

export interface CharacterInterface {
	id: string;
	name: string;
	region: string;
	description: string;
	slug: string;
	imageUrl?: string;
}

export const charactersService = {
	save(character: CharacterInterface) {
		return api.post('/characters', character).then((res) => res.data);
	},

	update(character: CharacterInterface) {
		return api
			.patch(`/characters/${character.id}`, character)
			.then((res) => res.data);
	},

	getCharacters() {
		return api.get('/characters').then((res) => res.data);
	},

	getCharacterBySlug(slug: string) {
		return api.get(`/characters/${slug}`).then((res) => res.data);
	},
};
