import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock } = vi.hoisted(() => ({
	apiMock: {
		get: vi.fn(),
		post: vi.fn(),
		delete: vi.fn(),
	},
}));

vi.mock('../../../helpers', () => ({
	api: apiMock,
}));

import { configGamesService } from './config-games.service';

describe('configGamesService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve salvar configuração', async () => {
		const payload = { gameSlug: 'memory-game', characterSlug: 'joao' } as any;
		apiMock.post.mockResolvedValueOnce({ data: payload });

		await configGamesService.save(payload);

		expect(apiMock.post).toHaveBeenCalledWith('/games/config', payload);
	});

	it('deve buscar por jogo', async () => {
		apiMock.get.mockResolvedValueOnce({ data: [] });

		await configGamesService.getByGame('memory-game');

		expect(apiMock.get).toHaveBeenCalledWith('/games/config/by-game/memory-game');
	});

	it('deve buscar configuração por jogo e personagem', async () => {
		apiMock.get.mockResolvedValueOnce({ data: { gameSlug: 'memory-game' } });

		const result = await configGamesService.get('memory-game', 'joao');

		expect(apiMock.get).toHaveBeenCalledWith('/games/config/memory-game/joao');
		expect(result).toEqual({ gameSlug: 'memory-game' });
	});

	it('deve excluir configuração', async () => {
		apiMock.delete.mockResolvedValueOnce({ data: true });

		await configGamesService.remove('memory-game', 'joao');

		expect(apiMock.delete).toHaveBeenCalledWith('/games/config/memory-game/joao');
	});
});
