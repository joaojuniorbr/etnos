import { describe, expect, it, vi } from 'vitest';
import {
	createMemoryGameDeck,
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
			(items) => items
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

		const result = resolveMemoryGameTurn(cards, [1, 2], 0);

		expect(result.isMatch).toBe(true);
		expect(result.score).toBe(100);
		expect(result.isFinished).toBe(true);
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

		const result = resolveMemoryGameTurn(cards, [1, 2], 0);

		expect(result.cards.find((card) => card.id === 3)?.isMatched).toBe(false);
	});

	it('desvira um par incorreto e impede score negativo', () => {
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

		const result = resolveMemoryGameTurn(cards, [1, 2], 0);

		expect(result.isMatch).toBe(false);
		expect(result.score).toBe(0);
		expect(result.isFinished).toBe(false);
		expect(
			result.cards.every((card) => !card.isFlipped && !card.isMatched)
		).toBe(true);
	});
});
