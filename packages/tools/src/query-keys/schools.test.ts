import { describe, expect, it } from 'vitest';
import { schoolKeys } from './schools';

describe('schoolKeys', () => {
	it('retorna chaves de escolas', () => {
		expect(schoolKeys.all()).toEqual(['schools', 'all']);
		expect(schoolKeys.managed()).toEqual(['schools', 'me', 'managed']);
		expect(schoolKeys.gameAccess('school-1')).toEqual([
			'schools',
			'game-access',
			'school-1',
		]);
		expect(schoolKeys.viewerUsers('school-1')).toEqual([
			'schools',
			'viewer',
			'users',
			'school-1',
			'',
		]);
		expect(schoolKeys.viewerUsers('school-1', 'ana')).toEqual([
			'schools',
			'viewer',
			'users',
			'school-1',
			'ana',
		]);
		expect(schoolKeys.userGameHistory('school-1')).toEqual([
			'schools',
			'school-1',
			'user-game-score-history',
			'',
		]);
		expect(schoolKeys.userGameHistory('school-1', 'user-1')).toEqual([
			'schools',
			'school-1',
			'user-game-score-history',
			'user-1',
		]);
		expect(schoolKeys.accessUsers('school-1')).toEqual([
			'schools',
			'admin',
			'access-users',
			'school-1',
		]);
		expect(schoolKeys.ranking()).toEqual(['schools', 'ranking', 'all']);
		expect(schoolKeys.ranking('memory-game')).toEqual([
			'schools',
			'ranking',
			'memory-game',
		]);
		expect(schoolKeys.usersRanking('school-1')).toEqual([
			'schools',
			'users-ranking',
			'school-1',
			'all',
			'all',
		]);
		expect(
			schoolKeys.usersRanking('school-1', 'memory-game', 'anita'),
		).toEqual([
			'schools',
			'users-ranking',
			'school-1',
			'memory-game',
			'anita',
		]);
	});
});
