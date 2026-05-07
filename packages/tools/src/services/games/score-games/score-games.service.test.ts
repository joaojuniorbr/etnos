import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock } = vi.hoisted(() => ({
	apiMock: {
		get: vi.fn(),
		post: vi.fn(),
	},
}));

vi.mock('../../../helpers', () => ({
	api: apiMock,
}));

import { scoreGamesService } from './score-games.service';

describe('scoreGamesService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve salvar score quando userId existir', async () => {
		apiMock.post.mockResolvedValueOnce({ data: { ok: true } });

		await scoreGamesService.saveScore('memory-game', 'joao', 10, 'user-1');

		expect(apiMock.post).toHaveBeenCalledWith('/games/score', {
			slug: 'memory-game',
			characterSlug: 'joao',
			score: 10,
		});
	});

	it('deve retornar null quando userId não existir em saveScore', async () => {
		const result = await scoreGamesService.saveScore(
			'memory-game',
			'joao',
			10,
			'',
		);

		expect(result).toBeNull();
		expect(apiMock.post).not.toHaveBeenCalled();
	});

	it('deve salvar histórico de score quando userId existir', async () => {
		apiMock.post.mockResolvedValueOnce({ data: { ok: true } });

		await scoreGamesService.saveScoreHistory(
			'memory-game',
			'joao',
			10,
			'user-1',
		);

		expect(apiMock.post).toHaveBeenCalledWith('/games/score/history', {
			slug: 'memory-game',
			characterSlug: 'joao',
			score: 10,
		});
	});

	it('deve retornar null quando userId não existir em saveScoreHistory', async () => {
		const result = await scoreGamesService.saveScoreHistory(
			'memory-game',
			'joao',
			10,
			'',
		);

		expect(result).toBeNull();
		expect(apiMock.post).not.toHaveBeenCalled();
	});

	it('deve buscar scores do usuário', async () => {
		apiMock.get.mockResolvedValueOnce({ data: [{ score: 100 }] });

		const result = await scoreGamesService.getScore('user-1');

		expect(apiMock.get).toHaveBeenCalledWith('/games/score');
		expect(result).toEqual([{ score: 100 }]);
	});

	it('deve retornar lista vazia quando não houver userId em getScore', async () => {
		const result = await scoreGamesService.getScore('');

		expect(result).toEqual([]);
		expect(apiMock.get).not.toHaveBeenCalled();
	});

	it('deve buscar score de jogo/personagem', async () => {
		apiMock.get.mockResolvedValueOnce({ data: { score: 50 } });

		await scoreGamesService.getFromGameScore('memory-game', 'joao', 'user-1');

		expect(apiMock.get).toHaveBeenCalledWith('/games/score/memory-game/joao');
	});

	it('deve retornar null quando não houver userId em getFromGameScore', async () => {
		const result = await scoreGamesService.getFromGameScore(
			'memory-game',
			'joao',
			'',
		);

		expect(result).toBeNull();
		expect(apiMock.get).not.toHaveBeenCalled();
	});

	it('deve buscar histórico de score do usuário com filtro de jogo', async () => {
		apiMock.get.mockResolvedValueOnce({
			data: [{ gameSlug: 'memory-game', score: 80 }],
		});

		const result = await scoreGamesService.getScoreHistory(
			'user-1',
			'memory-game',
		);

		expect(apiMock.get).toHaveBeenCalledWith('/games/score/history', {
			params: { gameSlug: 'memory-game' },
		});
		expect(result).toEqual([{ gameSlug: 'memory-game', score: 80 }]);
	});

	it('deve retornar lista vazia quando não houver userId em getScoreHistory', async () => {
		const result = await scoreGamesService.getScoreHistory('', 'memory-game');

		expect(result).toEqual([]);
		expect(apiMock.get).not.toHaveBeenCalled();
	});

	it('deve enviar NPS quando userId existir', async () => {
		apiMock.post.mockResolvedValueOnce({ data: { id: 'nps-1' } });

		await scoreGamesService.submitGameNps(
			'memory-game',
			'anita',
			5,
			'user-1',
			'Ótimo',
		);

		expect(apiMock.post).toHaveBeenCalledWith('/games/nps', {
			slug: 'memory-game',
			characterSlug: 'anita',
			rating: 5,
			comment: 'Ótimo',
		});
	});

	it('deve retornar null quando userId não existir em submitGameNps', async () => {
		const result = await scoreGamesService.submitGameNps(
			'guess-game',
			'anita',
			3,
			'',
		);

		expect(result).toBeNull();
		expect(apiMock.post).not.toHaveBeenCalled();
	});

	it('deve buscar NPS do jogo quando userId existir', async () => {
		apiMock.get.mockResolvedValueOnce({ data: { id: 'nps-1' } });

		const result = await scoreGamesService.getGameNps('memory-game', 'user-1');

		expect(apiMock.get).toHaveBeenCalledWith('/games/nps/memory-game');
		expect(result).toEqual({ id: 'nps-1' });
	});

	it('deve retornar null quando userId não existir em getGameNps', async () => {
		const result = await scoreGamesService.getGameNps('memory-game', '');

		expect(result).toBeNull();
		expect(apiMock.get).not.toHaveBeenCalled();
	});
});
