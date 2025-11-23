import { describe, it, expect } from 'vitest';
import {
	CharactersContent,
	getCharacterBySlug,
	getAllCharacters,
	CharacterInterface,
} from './';

describe('CharactersContent', () => {
	it('deve conter todos os personagens esperados', () => {
		const keys = Object.keys(CharactersContent);
		expect(keys).toEqual(['iara', 'tonico', 'dandara', 'zeca', 'anita']);
	});

	it('cada personagem deve seguir a interface CharacterInterface', () => {
		Object.values(CharactersContent).forEach((character) => {
			const typed: CharacterInterface = character;
			expect(typed).toHaveProperty('name');
			expect(typed).toHaveProperty('region');
			expect(typed).toHaveProperty('description');
			expect(typed).toHaveProperty('slug');
		});
	});
});

describe('getCharacterBySlug', () => {
	it('deve retornar o personagem correto pelo slug', () => {
		const iara = getCharacterBySlug('iara');
		expect(iara?.name).toBe('Iara Curumim');
		expect(iara?.region).toBe('Amazônia');
	});

	it('deve retornar undefined para slug inexistente', () => {
		const result = getCharacterBySlug('inexistente');
		expect(result).toBeUndefined();
	});
});

describe('getAllCharacters', () => {
	it('deve retornar todos os personagens', () => {
		const all = getAllCharacters();
		expect(all).toHaveLength(5);
		expect(all.map((c) => c.slug)).toContain('iara');
		expect(all.map((c) => c.slug)).toContain('anita');
	});
});
