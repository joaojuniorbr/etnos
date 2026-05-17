import { describe, expect, it } from 'vitest';
import { gameConfigKeys } from './games';

describe('gameConfigKeys', () => {
	it('retorna chaves de configuracao de jogos', () => {
		expect(gameConfigKeys.byGame('memory-game')).toEqual([
			'config-games',
			'memory-game',
		]);
		expect(gameConfigKeys.config('memory-game', 'anita')).toEqual([
			'config-games',
			'memory-game',
			'anita',
		]);
		expect(gameConfigKeys.score('memory-game', 'user-1', 'anita')).toEqual([
			'games',
			'score',
			'memory-game',
			'user-1',
			'anita',
		]);
		expect(gameConfigKeys.memoryContent('anita')).toEqual([
			'game',
			'memory-game',
			'anita',
		]);
		expect(gameConfigKeys.guessContent('anita')).toEqual([
			'game',
			'guess-game',
			'anita',
		]);
	});
});
