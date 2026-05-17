import { describe, expect, it } from 'vitest';
import { characterKeys } from './characters';

describe('characterKeys', () => {
	it('retorna chaves de personagens', () => {
		expect(characterKeys.all()).toEqual(['characters', 'all']);
		expect(characterKeys.filter('anita')).toEqual([
			'characters',
			'filter',
			'anita',
		]);
		expect(characterKeys.detail('anita')).toEqual([
			'characters',
			'detail',
			'anita',
		]);
		expect(characterKeys.avatars('anita')).toEqual([
			'characters',
			'anita',
			'avatars',
		]);
		expect(characterKeys.selected('anita')).toEqual([
			'characters',
			'selected',
			'anita',
		]);
		expect(characterKeys.selected()).toEqual(['characters', 'selected', undefined]);
	});
});
