import { describe, expect, it, vi } from 'vitest';
import {
	createMemoryGameDeck,
	getAvailableMemoryGameLevels,
	getMemoryGameLevelConfig,
	getMemoryGameLevelContent,
	resolveMemoryGameTurn,
	shuffleArray,
} from './memory-game.utils.js';

const content = [
	{ name: 'A', image: 'a.jpg' },
	{ name: 'B', image: 'b.jpg' },
	{ name: 'C', image: 'c.jpg' },
	{ name: 'D', image: 'd.jpg' },
	{ name: 'E', image: 'e.jpg' },
	{ name: 'F', image: 'f.jpg' },
];

describe('memory-game utils', () => {
	it('mantém arrays vazios ou com um item sem alterações ao embaralhar', () => {
		expect(shuffleArray([])).toEqual([]);
		expect(shuffleArray([1])).toEqual([1]);
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

	it('cria o deck com pares duplicados e ids únicos', () => {
		const deck = createMemoryGameDeck(
			content.slice(0, 2),
			<T>(items: T[]) => items,
		);

		expect(deck).toEqual([
			{ id: 0, name: 'A', image: 'a.jpg', isFlipped: false, isMatched: false },
			{ id: 1, name: 'A', image: 'a.jpg', isFlipped: false, isMatched: false },
			{ id: 2, name: 'B', image: 'b.jpg', isFlipped: false, isMatched: false },
			{ id: 3, name: 'B', image: 'b.jpg', isFlipped: false, isMatched: false },
		]);
	});

	it('retorna configuração de nível e níveis disponíveis', () => {
		expect(getMemoryGameLevelConfig(2)).toEqual({
			level: 2,
			label: 'Nível 2',
			pairs: 6,
			pointBonus: 100,
			pointPenalty: 100,
			pointAddition: 200,
		});

		expect(getAvailableMemoryGameLevels(12)).toEqual([
			getMemoryGameLevelConfig(1),
			getMemoryGameLevelConfig(2),
			getMemoryGameLevelConfig(3),
			getMemoryGameLevelConfig(4),
		]);
	});

	it('seleciona conteúdo do nível usando o embaralhamento informado', () => {
		const result = getMemoryGameLevelContent(content, 1, <T>(items: T[]) =>
			[...items].reverse(),
		);

		expect(result).toEqual([
			{ name: 'F', image: 'f.jpg' },
			{ name: 'E', image: 'e.jpg' },
			{ name: 'D', image: 'd.jpg' },
		]);
	});

	it('resolve turno com acerto', () => {
		const cards = [
			{ id: 0, name: 'A', image: 'a.jpg', isFlipped: true, isMatched: false },
			{ id: 1, name: 'A', image: 'a.jpg', isFlipped: true, isMatched: false },
		];

		const result = resolveMemoryGameTurn(cards, [0, 1], 100, 1, {
			pointAddition: 100,
			pointBonus: 50,
			pointPenalty: 50,
		});

		expect(result).toEqual({
			cards: [
				{ id: 0, name: 'A', image: 'a.jpg', isFlipped: true, isMatched: true },
				{ id: 1, name: 'A', image: 'a.jpg', isFlipped: true, isMatched: true },
			],
			score: 250,
			isFinished: true,
			isMatch: true,
			consecutiveMatches: 2,
		});
	});

	it('resolve turno com acerto sem finalizar o jogo', () => {
		const cards = [
			{ id: 0, name: 'A', image: 'a.jpg', isFlipped: true, isMatched: false },
			{ id: 1, name: 'A', image: 'a.jpg', isFlipped: true, isMatched: false },
			{ id: 2, name: 'B', image: 'b.jpg', isFlipped: false, isMatched: false },
		];

		const result = resolveMemoryGameTurn(cards, [0, 1], 100, 0, {
			pointAddition: 100,
			pointBonus: 50,
			pointPenalty: 50,
		});

		expect(result).toEqual({
			cards: [
				{ id: 0, name: 'A', image: 'a.jpg', isFlipped: true, isMatched: true },
				{ id: 1, name: 'A', image: 'a.jpg', isFlipped: true, isMatched: true },
				{
					id: 2,
					name: 'B',
					image: 'b.jpg',
					isFlipped: false,
					isMatched: false,
				},
			],
			score: 200,
			isFinished: false,
			isMatch: true,
			consecutiveMatches: 1,
		});
	});

	it('resolve turno com erro', () => {
		const cards = [
			{ id: 0, name: 'A', image: 'a.jpg', isFlipped: true, isMatched: false },
			{ id: 1, name: 'B', image: 'b.jpg', isFlipped: true, isMatched: false },
			{ id: 2, name: 'C', image: 'c.jpg', isFlipped: false, isMatched: false },
		];

		const result = resolveMemoryGameTurn(cards, [0, 1], 100, 2, {
			pointAddition: 100,
			pointBonus: 50,
			pointPenalty: 50,
		});

		expect(result).toEqual({
			cards: [
				{
					id: 0,
					name: 'A',
					image: 'a.jpg',
					isFlipped: false,
					isMatched: false,
				},
				{
					id: 1,
					name: 'B',
					image: 'b.jpg',
					isFlipped: false,
					isMatched: false,
				},
				{
					id: 2,
					name: 'C',
					image: 'c.jpg',
					isFlipped: false,
					isMatched: false,
				},
			],
			score: 50,
			isFinished: false,
			isMatch: false,
			consecutiveMatches: 0,
		});
	});
});
