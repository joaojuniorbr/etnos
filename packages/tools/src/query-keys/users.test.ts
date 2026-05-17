import { describe, expect, it } from 'vitest';
import { userKeys } from './users';

describe('userKeys', () => {
	it('retorna chaves de usuarios', () => {
		expect(userKeys.admin('school-1', true)).toEqual([
			'users',
			'admin',
			'school-1',
			true,
			'all',
		]);
		expect(userKeys.admin('school-1', false, 'ana')).toEqual([
			'users',
			'admin',
			'school-1',
			false,
			'ana',
		]);
		expect(userKeys.searchWithPush('ana')).toEqual([
			'users',
			'search',
			'ana',
			'push',
		]);
	});
});
