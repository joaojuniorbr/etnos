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

import { memoryGameContentService } from './memory-game.service';

describe('memoryGameContentService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve salvar conteúdo', async () => {
		const payload = { url: 'url', slug: 'slug' };
		apiMock.post.mockResolvedValueOnce({ data: payload });

		await memoryGameContentService.saveContent(payload);

		expect(apiMock.post).toHaveBeenCalledWith('/games/memory', payload);
	});

	it('deve buscar imagens formatadas', async () => {
		apiMock.get.mockResolvedValueOnce({ data: [] });

		await memoryGameContentService.getMemoryGameImages('joao');

		expect(apiMock.get).toHaveBeenCalledWith('/games/memory/images/joao');
	});

	it('deve remover conteúdo', async () => {
		apiMock.delete.mockResolvedValueOnce({ data: true });

		await memoryGameContentService.deleteContent('1');

		expect(apiMock.delete).toHaveBeenCalledWith('/games/memory/1');
	});
});
