import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AxiosInstance } from 'axios';
import { createScoreGamesService } from './score-games.service';

const createApiMock = () =>
	({
		get: vi.fn(),
		post: vi.fn(),
	}) as unknown as AxiosInstance & {
		get: ReturnType<typeof vi.fn>;
		post: ReturnType<typeof vi.fn>;
	};

describe('createScoreGamesService', () => {
	let api: ReturnType<typeof createApiMock>;
	let service: ReturnType<typeof createScoreGamesService>;

	beforeEach(() => {
		api = createApiMock();
		api.post.mockResolvedValue({ data: { ok: true } });
		api.get.mockResolvedValue({ data: [{ score: 10 }] });
		service = createScoreGamesService(api);
	});

	it('retorna fallback quando userId não existe em saveScore', async () => {
		await expect(
			service.saveScore('memory-game', 'anita', 100, ''),
		).resolves.toBeNull();
		expect(api.post).not.toHaveBeenCalled();
	});

	it('salva score quando userId existe', async () => {
		await expect(
			service.saveScore('memory-game', 'anita', 100, 'user-1'),
		).resolves.toEqual({ ok: true });

		expect(api.post).toHaveBeenCalledWith('/games/score', {
			slug: 'memory-game',
			characterSlug: 'anita',
			score: 100,
		});
	});

	it('retorna fallback quando userId não existe em saveScoreHistory', async () => {
		await expect(
			service.saveScoreHistory('memory-game', 'anita', 80, ''),
		).resolves.toBeNull();
		expect(api.post).not.toHaveBeenCalled();
	});

	it('salva histórico de score quando userId existe', async () => {
		await expect(
			service.saveScoreHistory('memory-game', 'anita', 80, 'user-1'),
		).resolves.toEqual({ ok: true });

		expect(api.post).toHaveBeenCalledWith('/games/score/history', {
			slug: 'memory-game',
			characterSlug: 'anita',
			score: 80,
		});
	});

	it('retorna lista vazia quando userId não existe em getScore', async () => {
		await expect(service.getScore('')).resolves.toEqual([]);
		expect(api.get).not.toHaveBeenCalled();
	});

	it('busca scores quando userId existe', async () => {
		await expect(service.getScore('user-1')).resolves.toEqual([{ score: 10 }]);
		expect(api.get).toHaveBeenCalledWith('/games/score');
	});

	it('retorna lista vazia quando userId não existe em getScoreHistory', async () => {
		await expect(service.getScoreHistory('')).resolves.toEqual([]);
		expect(api.get).not.toHaveBeenCalled();
	});

	it('busca histórico de scores com e sem filtro de jogo', async () => {
		await expect(
			service.getScoreHistory('user-1', 'memory-game'),
		).resolves.toEqual([{ score: 10 }]);
		await expect(service.getScoreHistory('user-1')).resolves.toEqual([
			{ score: 10 },
		]);

		expect(api.get).toHaveBeenCalledWith('/games/score/history', {
			params: { gameSlug: 'memory-game' },
		});
		expect(api.get).toHaveBeenCalledWith('/games/score/history', {
			params: undefined,
		});
	});

	it('retorna null quando userId não existe em submitGameNps', async () => {
		await expect(
			service.submitGameNps('memory-game', 'anita', 4, '', 'x'),
		).resolves.toBeNull();
		expect(api.post).not.toHaveBeenCalled();
	});

	it('envia NPS quando userId existe', async () => {
		await expect(
			service.submitGameNps('memory-game', 'anita', 4, 'user-1', 'ok'),
		).resolves.toEqual({ ok: true });

		expect(api.post).toHaveBeenCalledWith('/games/nps', {
			slug: 'memory-game',
			characterSlug: 'anita',
			rating: 4,
			comment: 'ok',
		});
	});

	it('envia NPS sem comentário opcional', async () => {
		api.post.mockResolvedValueOnce({ data: { id: 'nps-2' } });

		await expect(
			service.submitGameNps('guess-game', 'iara', 5, 'user-1'),
		).resolves.toEqual({ id: 'nps-2' });

		expect(api.post).toHaveBeenCalledWith('/games/nps', {
			slug: 'guess-game',
			characterSlug: 'iara',
			rating: 5,
			comment: undefined,
		});
	});

	it('retorna null quando userId não existe em getGameNps', async () => {
		await expect(service.getGameNps('guess-game', '')).resolves.toBeNull();
		expect(api.get).not.toHaveBeenCalled();
	});

	it('busca NPS do jogo quando userId existe', async () => {
		await expect(service.getGameNps('guess-game', 'user-1')).resolves.toEqual([
			{ score: 10 },
		]);
		expect(api.get).toHaveBeenCalledWith('/games/nps/guess-game');
	});
});
