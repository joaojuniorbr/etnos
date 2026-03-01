import { describe, it, expect, vi, beforeEach } from 'vitest';
import { midiaService, MidiaInterface } from './midia.service';
import { mockRepo } from '../../test';
import * as storage from 'firebase/storage';

vi.mock('firebase/storage', () => ({
	getStorage: vi.fn(() => ({})),
	ref: vi.fn(),
	uploadBytes: vi.fn().mockResolvedValue({}),
	getDownloadURL: vi.fn().mockResolvedValue('http://mockurl.com/image.png'),
	deleteObject: vi.fn().mockResolvedValue({}),
}));

const mockUserId = 'user-123';
const mockUrl =
	'https://firebasestorage.googleapis.com/v0/b/bucket/o/folder%2Fimage.png?alt=media';

const mockMidia: MidiaInterface = {
	id: 'midia-1',
	url: mockUrl,
	userId: mockUserId,
	folder: 'uploads',
};

describe('midiaService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve extrair corretamente o path de uma URL do Firebase Storage', () => {
		const path = midiaService.getPathFromUrl(mockUrl);
		expect(path).toBe('folder/image.png');
	});

	it('uploadImage deve fazer upload para o storage e salvar metadados no firestore', async () => {
		const file = new File([''], 'test.png');
		mockRepo.create.mockResolvedValueOnce({ id: 'new-id' });

		const result = await midiaService.uploadImage(file, 'uploads', mockUserId);

		expect(storage.uploadBytes).toHaveBeenCalled();
		expect(storage.getDownloadURL).toHaveBeenCalled();
		expect(mockRepo.create).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: mockUserId,
				folder: 'uploads',
				url: 'http://mockurl.com/image.png',
			})
		);
		expect(result.url).toBe('http://mockurl.com/image.png');
	});

	it('uploadMultipleImages deve chamar uploadImage para cada arquivo', async () => {
		const files = [new File([''], '1.png'), new File([''], '2.png')];
		const spy = vi
			.spyOn(midiaService, 'uploadImage')
			.mockResolvedValue({ url: 'url' });

		const result = await midiaService.uploadMultipleImages(
			files,
			'folder',
			'user'
		);

		expect(spy).toHaveBeenCalledTimes(2);
		expect(result).toHaveLength(2);
	});

	it('deve retornar hasNextPage true e o cursor quando o repo retorna mais que o limite solicitado', async () => {
		const limitReq = 2;
		const mockData = [
			{ id: '1', url: 'u1' },
			{ id: '2', url: 'u2' },
			{ id: '3', url: 'u3' },
		];
		const mockLastDoc = { id: 'snap-3' };

		mockRepo.findWithPaginate.mockResolvedValueOnce({
			data: mockData,
			lastDoc: mockLastDoc,
		});

		const result = await midiaService.getMidia(mockUserId, limitReq);

		expect(result.data).toHaveLength(2);
		expect(result.nextCursor).toEqual(mockLastDoc); // Cursor é o lastDoc
		expect(mockRepo.findWithPaginate).toHaveBeenCalledWith(
			expect.objectContaining({
				limit: 3, // limitNumber + 1
			})
		);
	});

	it('deve retornar hasNextPage false e cursor undefined quando o repo retorna exatamente o limite ou menos', async () => {
		const limitReq = 5;
		const mockData = [{ id: '1', url: 'u1' }];

		mockRepo.findWithPaginate.mockResolvedValueOnce({
			data: mockData,
			lastDoc: { id: 'snap-1' },
		});

		const result = await midiaService.getMidia(mockUserId, limitReq);

		expect(result.data).toHaveLength(1);
		expect(result.nextCursor).toBeUndefined();
	});

	it('deve aplicar filtro de pasta se fornecido', async () => {
		mockRepo.findWithPaginate.mockResolvedValueOnce({
			data: [],
			lastDoc: null,
		});

		await midiaService.getMidia(mockUserId, 10, undefined, 'minha-pasta');

		expect(mockRepo.findWithPaginate).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.arrayContaining([
					{ field: 'folder', op: '==', value: 'minha-pasta' },
				]),
			})
		);
	});

	it('deleteMidia deve apagar do storage e do banco de dados', async () => {
		mockRepo.delete.mockResolvedValueOnce(undefined);

		const result = await midiaService.deleteMidia(mockMidia);

		expect(storage.deleteObject).toHaveBeenCalled();
		expect(mockRepo.delete).toHaveBeenCalledWith(mockMidia.id);
		expect(result).toBe(true);
	});

	it('deleteMidia deve retornar false e logar erro em caso de falha', async () => {
		vi.mocked(storage.deleteObject).mockRejectedValueOnce(new Error('fail'));

		const result = await midiaService.deleteMidia(mockMidia);

		expect(result).toBe(false);
	});

	it('deleteMidiaFromUrl deve encontrar todos os registros da URL e deletá-los', async () => {
		mockRepo.findMany.mockResolvedValueOnce([{ id: '1' }, { id: '2' }]);

		const result = await midiaService.deleteMidiaFromUrl(mockUrl);

		expect(storage.deleteObject).toHaveBeenCalled();
		expect(mockRepo.delete).toHaveBeenCalledTimes(2);
		expect(result).toBe(true);
	});

	it('deleteMidiaFromUrl deve retornar false em caso de erro', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		mockRepo.findMany.mockRejectedValueOnce(new Error('fail'));

		const result = await midiaService.deleteMidiaFromUrl(mockUrl);
		expect(result).toBe(false);
	});

	it('deve agrupar, contar e ordenar pastas corretamente', async () => {
		mockRepo.findMany.mockResolvedValueOnce([
			{ folder: 'Fotos' },
			{ folder: 'Avatar' },
			{ folder: 'Fotos' },
			{ folder: undefined }, // Deve ser ignorado
		]);

		const result = await midiaService.getFolders(mockUserId);

		expect(result).toEqual([
			{ folder: 'Avatar', count: 1 },
			{ folder: 'Fotos', count: 2 },
		]);
	});
});
