import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock } = vi.hoisted(() => ({
	apiMock: {
		get: vi.fn(),
		post: vi.fn(),
		delete: vi.fn(),
	},
}));

vi.mock('../../helpers', () => ({
	api: apiMock,
}));

import { midiaService } from './midia.service';

describe('midiaService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve extrair path de URL do storage', () => {
		const url =
			'https://firebasestorage.googleapis.com/v0/b/bucket/o/folder%2Fimage.png?alt=media';

		expect(midiaService.getPathFromUrl(url)).toBe('folder/image.png');
	});

	it('deve enviar upload por multipart', async () => {
		apiMock.post.mockResolvedValueOnce({ data: { url: 'http://image' } });

		const result = await midiaService.uploadImage(
			new File(['x'], 'test.png'),
			'folder',
			'user-1'
		);

		expect(apiMock.post).toHaveBeenCalledWith(
			'/midia/upload',
			expect.any(FormData),
			expect.objectContaining({
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})
		);
		expect(result).toEqual({ url: 'http://image' });
	});

	it('deve listar mídias com paginação', async () => {
		apiMock.get.mockResolvedValueOnce({ data: { data: [], nextCursor: 2 } });

		const result = await midiaService.getMidia('user-1', 10, 1, 'folder');

		expect(apiMock.get).toHaveBeenCalledWith('/midia', {
			params: {
				limit: 10,
				page: 1,
				folder: 'folder',
			},
		});
		expect(result).toEqual({ data: [], nextCursor: 2 });
	});

	it('deve remover por id quando disponível', async () => {
		apiMock.delete.mockResolvedValueOnce({ data: true });

		await midiaService.deleteMidia({ id: '1', url: 'u', userId: 'user-1' });

		expect(apiMock.delete).toHaveBeenCalledWith('/midia/1');
	});

	it('deve remover por url quando não houver id', async () => {
		apiMock.delete.mockResolvedValueOnce({ data: true });

		await midiaService.deleteMidia({ url: 'u', userId: 'user-1' });

		expect(apiMock.delete).toHaveBeenCalledWith('/midia/by-url', {
			params: { url: 'u' },
		});
	});
});
