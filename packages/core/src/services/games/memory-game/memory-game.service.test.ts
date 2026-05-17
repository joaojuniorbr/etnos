import { describe, expect, it, vi } from 'vitest';
import type { AxiosInstance } from 'axios';
import { createMemoryGameService } from './memory-game.service.js';

const createApiMock = () =>
	({
		get: vi.fn(),
	}) as unknown as AxiosInstance & {
		get: ReturnType<typeof vi.fn>;
	};

describe('createMemoryGameService', () => {
	it('busca imagens do jogo da memória por personagem', async () => {
		const api = createApiMock();
		api.get.mockResolvedValue({ data: [{ id: '1' }] });
		const service = createMemoryGameService(api);

		await service.getMemoryGameImages('anita');

		expect(api.get).toHaveBeenCalledWith('/games/memory/images/anita');
	});
});
