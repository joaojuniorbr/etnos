import { describe, expect, it, vi } from 'vitest';
import {
	createMemoryGameDeck,
	getAvailableMemoryGameLevels,
	getMemoryGameLevelConfig,
	getMemoryGameLevelContent,
	resolveMemoryGameTurn,
	shuffleArray,
} from './memory-game.utils';
import type { MemoryGameCard } from './memory-game.types';

describe('memory-game utils', () => {
	it('mantém arrays vazios ou com um item sem alterar a referência lógica', () => {
		expect(shuffleArray([])).toEqual([]);
		expect(shuffleArray(['a'])).toEqual(['a']);
	});

	it('embaralha usando crypto.getRandomValues', () => {
		const getRandomValues = vi.fn((values: Uint32Array) => {
			values[0] = 0;
			values[1] = 0;
			values[2] = 0xffffffff;
			return values;
		});

		vi.stubGlobal('crypto', { getRandomValues });

		expect(shuffleArray(['a', 'b', 'c'])).toEqual(['b', 'a', 'c']);
		expect(getRandomValues).toHaveBeenCalledTimes(1);
	});

	it('duplica o conteudo para montar o deck', () => {
		const deck = createMemoryGameDeck(
			[
				{ name: 'chimarrao', image: '/chimarrao.jpg' },
				{ name: 'churrasco', image: '/churrasco.jpg' },
			],
			(items) => items,
		);

		expect(deck).toHaveLength(4);
		expect(deck.map((card) => card.name)).toEqual([
			'chimarrao',
			'chimarrao',
			'churrasco',
			'churrasco',
		]);
		expect(deck.every((card) => !card.isFlipped && !card.isMatched)).toBe(true);
	});

	it('retorna os niveis disponiveis de acordo com a quantidade de pares', () => {
		expect(getAvailableMemoryGameLevels(2)).toEqual([]);
		expect(getAvailableMemoryGameLevels(3).map((level) => level.level)).toEqual(
			[1],
		);
		expect(getAvailableMemoryGameLevels(6).map((level) => level.level)).toEqual(
			[1, 2],
		);
		expect(getAvailableMemoryGameLevels(9).map((level) => level.level)).toEqual(
			[1, 2, 3],
		);
	});

	it('retorna configuracao do nivel e limita o conteudo conforme os pares', () => {
		expect(getMemoryGameLevelConfig(2)).toEqual({
			label: 'Nível 2',
			level: 2,
			pairs: 6,
			pointAddition: 200,
			pointBonus: 100,
			pointPenalty: 100,
		});

		const content = getMemoryGameLevelContent(
			[
				{ name: '1', image: '/1.jpg' },
				{ name: '2', image: '/2.jpg' },
				{ name: '3', image: '/3.jpg' },
				{ name: '4', image: '/4.jpg' },
			],
			1,
			(items) => items,
		);

		expect(content).toHaveLength(3);
		expect(content.map((item) => item.name)).toEqual(['1', '2', '3']);
	});

	it('marca um par correto, soma pontos e informa finalizacao', () => {
		const cards: MemoryGameCard[] = [
			{
				id: 1,
				name: 'chimarrao',
				image: '/a.jpg',
				isFlipped: true,
				isMatched: false,
			},
			{
				id: 2,
				name: 'chimarrao',
				image: '/a.jpg',
				isFlipped: true,
				isMatched: false,
			},
		];

		const result = resolveMemoryGameTurn(
			cards,
			[1, 2],
			0,
			0,
			getMemoryGameLevelConfig(1),
		);

		expect(result.isMatch).toBe(true);
		expect(result.score).toBe(100);
		expect(result.isFinished).toBe(true);
		expect(result.consecutiveMatches).toBe(1);
		expect(result.cards.every((card) => card.isMatched)).toBe(true);
	});

	it('marca apenas o par correspondente quando ainda existem outras cartas', () => {
		const cards: MemoryGameCard[] = [
			{
				id: 1,
				name: 'chimarrao',
				image: '/a.jpg',
				isFlipped: true,
				isMatched: false,
			},
			{
				id: 2,
				name: 'chimarrao',
				image: '/a.jpg',
				isFlipped: true,
				isMatched: false,
			},
			{
				id: 3,
				name: 'churrasco',
				image: '/b.jpg',
				isFlipped: false,
				isMatched: false,
			},
		];

		const result = resolveMemoryGameTurn(
			cards,
			[1, 2],
			0,
			0,
			getMemoryGameLevelConfig(1),
		);

		expect(result.cards.find((card) => card.id === 3)?.isMatched).toBe(false);
	});

	it('aplica bonus de combo em acertos consecutivos', () => {
		const cards: MemoryGameCard[] = [
			{
				id: 1,
				name: 'chimarrao',
				image: '/a.jpg',
				isFlipped: true,
				isMatched: false,
			},
			{
				id: 2,
				name: 'chimarrao',
				image: '/a.jpg',
				isFlipped: true,
				isMatched: false,
			},
		];

		const result = resolveMemoryGameTurn(
			cards,
			[1, 2],
			100,
			1,
			getMemoryGameLevelConfig(1),
		);

		expect(result.score).toBe(250);
		expect(result.consecutiveMatches).toBe(2);
	});

	it('usa a configuracao do nivel para aumentar a pontuacao', () => {
		const cards: MemoryGameCard[] = [
			{
				id: 1,
				name: 'chimarrao',
				image: '/a.jpg',
				isFlipped: true,
				isMatched: false,
			},
			{
				id: 2,
				name: 'chimarrao',
				image: '/a.jpg',
				isFlipped: true,
				isMatched: false,
			},
		];

		const result = resolveMemoryGameTurn(
			cards,
			[1, 2],
			200,
			1,
			getMemoryGameLevelConfig(2),
		);

		expect(result.score).toBe(500);
		expect(result.consecutiveMatches).toBe(2);
	});

	it('desvira um par incorreto, desconta pontos e reseta o combo', () => {
		const cards: MemoryGameCard[] = [
			{
				id: 1,
				name: 'chimarrao',
				image: '/a.jpg',
				isFlipped: true,
				isMatched: false,
			},
			{
				id: 2,
				name: 'churrasco',
				image: '/b.jpg',
				isFlipped: true,
				isMatched: false,
			},
		];

		const result = resolveMemoryGameTurn(
			cards,
			[1, 2],
			0,
			3,
			getMemoryGameLevelConfig(1),
		);

		expect(result.isMatch).toBe(false);
		expect(result.score).toBe(-50);
		expect(result.isFinished).toBe(false);
		expect(result.consecutiveMatches).toBe(0);
		expect(
			result.cards.every((card) => !card.isFlipped && !card.isMatched),
		).toBe(true);
	});
});
