import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock } = vi.hoisted(() => ({
	apiMock: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
	},
}));

vi.mock('../../helpers', () => ({
	api: apiMock,
}));

import { charactersService } from './characters.service';

describe('charactersService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve listar personagens', async () => {
		apiMock.get.mockResolvedValueOnce({ data: [{ id: '1' }] });

		const result = await charactersService.getCharacters();

		expect(apiMock.get).toHaveBeenCalledWith('/characters');
		expect(result).toEqual([{ id: '1' }]);
	});

	it('deve buscar personagem por slug', async () => {
		apiMock.get.mockResolvedValueOnce({ data: { id: '1', slug: 'mario' } });

		const result = await charactersService.getCharacterBySlug('mario');

		expect(apiMock.get).toHaveBeenCalledWith('/characters/mario');
		expect(result).toEqual({ id: '1', slug: 'mario' });
	});

	it('deve criar personagem', async () => {
		const payload = { id: '1', slug: 'mario' } as any;
		apiMock.post.mockResolvedValueOnce({ data: payload });

		const result = await charactersService.save(payload);

		expect(apiMock.post).toHaveBeenCalledWith('/characters', payload);
		expect(result).toEqual(payload);
	});

	it('deve atualizar personagem', async () => {
		const payload = { id: '1', slug: 'mario' } as any;
		apiMock.patch.mockResolvedValueOnce({ data: payload });

		await charactersService.update(payload);

		expect(apiMock.patch).toHaveBeenCalledWith('/characters/1', payload);
	});
});
