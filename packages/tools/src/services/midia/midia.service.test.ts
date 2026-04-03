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
			'user-1',
		);

		expect(apiMock.post).toHaveBeenCalledWith(
			'/midia/upload',
			expect.any(FormData),
			expect.objectContaining({
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			}),
		);
		expect(result).toEqual({ url: 'http://image' });
	});

	it('deve falhar upload quando userId não for informado', async () => {
		await expect(
			midiaService.uploadImage(new File(['x'], 'test.png'), 'folder', ''),
		).rejects.toThrow('Usuário não encontrado');
	});

	it('deve realizar upload de múltiplas imagens', async () => {
		apiMock.post
			.mockResolvedValueOnce({ data: { url: 'http://image-1' } })
			.mockResolvedValueOnce({ data: { url: 'http://image-2' } });

		const files = [new File(['x'], 'a.png'), new File(['y'], 'b.png')];
		const result = await midiaService.uploadMultipleImages(
			files,
			'folder',
			'user-1',
		);

		expect(apiMock.post).toHaveBeenCalledTimes(2);
		expect(result).toEqual([
			{ url: 'http://image-1' },
			{ url: 'http://image-2' },
		]);
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

	it('deve retornar vazio quando não houver userId em getMidia', async () => {
		const result = await midiaService.getMidia('', 10);

		expect(result).toEqual({
			data: [],
			nextCursor: undefined,
		});
		expect(apiMock.get).not.toHaveBeenCalled();
	});

	it('deve usar página 1 como padrão quando cursor não for enviado', async () => {
		apiMock.get.mockResolvedValueOnce({
			data: { data: [], nextCursor: undefined },
		});

		await midiaService.getMidia('user-1', 20);

		expect(apiMock.get).toHaveBeenCalledWith('/midia', {
			params: {
				limit: 20,
				page: 1,
				folder: undefined,
			},
		});
	});

	it('deve listar mídias usando endpoint admin quando showAll estiver ativo', async () => {
		apiMock.get.mockResolvedValueOnce({
			data: { data: [], nextCursor: undefined },
		});

		await midiaService.getMidia('user-1', 20, 2, 'library', true);

		expect(apiMock.get).toHaveBeenCalledWith('/midia/admin', {
			params: {
				limit: 20,
				page: 2,
				folder: 'library',
			},
		});
	});

	it('deve salvar mídia', async () => {
		apiMock.post.mockResolvedValueOnce({ data: { id: '1' } });

		const result = await midiaService.saveMidia({ url: 'u', userId: 'user-1' });

		expect(apiMock.post).toHaveBeenCalledWith('/midia', {
			url: 'u',
			userId: 'user-1',
		});
		expect(result).toEqual({ id: '1' });
	});

	it('deve remover por id quando disponível', async () => {
		apiMock.delete.mockResolvedValueOnce({ data: true });

		await midiaService.deleteMidia({ id: '1', url: 'u', userId: 'user-1' });

		expect(apiMock.delete).toHaveBeenCalledWith('/midia/1');
	});

	it('deve remover por id no endpoint admin quando showAll estiver ativo', async () => {
		apiMock.delete.mockResolvedValueOnce({ data: true });

		await midiaService.deleteMidia(
			{ id: '1', url: 'u', userId: 'user-1' },
			true,
		);

		expect(apiMock.delete).toHaveBeenCalledWith('/midia/admin/1');
	});

	it('deve remover por url quando não houver id', async () => {
		apiMock.delete.mockResolvedValueOnce({ data: true });

		await midiaService.deleteMidia({ url: 'u', userId: 'user-1' });

		expect(apiMock.delete).toHaveBeenCalledWith('/midia/by-url', {
			params: { url: 'u' },
		});
	});

	it('deve remover por url via método dedicado', async () => {
		apiMock.delete.mockResolvedValueOnce({ data: true });

		const result = await midiaService.deleteMidiaFromUrl('http://img');

		expect(apiMock.delete).toHaveBeenCalledWith('/midia/by-url', {
			params: { url: 'http://img' },
		});
		expect(result).toBe(true);
	});

	it('deve remover por url via endpoint admin quando showAll estiver ativo', async () => {
		apiMock.delete.mockResolvedValueOnce({ data: true });

		const result = await midiaService.deleteMidiaFromUrl('http://img', true);

		expect(apiMock.delete).toHaveBeenCalledWith('/midia/admin/by-url', {
			params: { url: 'http://img' },
		});
		expect(result).toBe(true);
	});

	it('deve retornar lista vazia de pastas quando não houver userId', async () => {
		const result = await midiaService.getFolders('');

		expect(result).toEqual([]);
		expect(apiMock.get).not.toHaveBeenCalled();
	});

	it('deve buscar pastas quando userId existir', async () => {
		apiMock.get.mockResolvedValueOnce({
			data: [{ folder: 'games', count: 1 }],
		});

		const result = await midiaService.getFolders('user-1');

		expect(apiMock.get).toHaveBeenCalledWith('/midia/folders');
		expect(result).toEqual([{ folder: 'games', count: 1 }]);
	});

	it('deve buscar pastas no endpoint admin quando showAll estiver ativo', async () => {
		apiMock.get.mockResolvedValueOnce({
			data: [{ folder: 'library', count: 3 }],
		});

		const result = await midiaService.getFolders('user-1', true);

		expect(apiMock.get).toHaveBeenCalledWith('/midia/admin/folders');
		expect(result).toEqual([{ folder: 'library', count: 3 }]);
	});
});
