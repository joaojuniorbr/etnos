import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	memoryGameContentService,
	MemoryGameContentInterface,
} from './memory-game.service';
import { mockRepo } from '../../../test';

describe('memoryGameContentService', () => {
	const mockItem: MemoryGameContentInterface = {
		id: '1',
		url: 'http://image.com/1.png',
		slug: 'mario',
		idCharacter: 'char-1',
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('saveContent deve chamar o create do repositório', async () => {
		const mockRef = { id: 'new-id' };
		mockRepo.create.mockResolvedValueOnce(mockRef);

		const result = await memoryGameContentService.saveContent(mockItem);

		expect(result).toEqual(mockRef);
		expect(mockRepo.create).toHaveBeenCalledWith(mockItem);
	});

	it('getContent deve retornar lista filtrada por slug', async () => {
		mockRepo.findMany.mockResolvedValueOnce([mockItem]);

		const result = await memoryGameContentService.getContent('mario');

		expect(result).toEqual([mockItem]);
		expect(mockRepo.findMany).toHaveBeenCalledWith({
			where: [
				{
					field: 'slug',
					op: '==',
					value: 'mario',
				},
			],
		});
	});

	it('deleteContent deve retornar true ao deletar com sucesso', async () => {
		mockRepo.delete.mockResolvedValueOnce(undefined);

		const result = await memoryGameContentService.deleteContent('1');

		expect(result).toBe(true);
		expect(mockRepo.delete).toHaveBeenCalledWith('1');
	});

	it('deleteContent deve retornar false e logar erro em caso de falha', async () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		mockRepo.delete.mockRejectedValueOnce(new Error('Firebase Error'));

		const result = await memoryGameContentService.deleteContent('1');

		expect(result).toBe(false);
		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
	});

	it('getMemoryGameImages deve retornar formato formatado para o jogo', async () => {
		const mockDocs = [
			{ id: '1', url: 'img1.png', slug: 'mario' },
			{ id: '2', url: 'img2.png', slug: 'mario' },
		];
		mockRepo.findMany.mockResolvedValueOnce(mockDocs);

		const result = await memoryGameContentService.getMemoryGameImages('mario');

		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({
			id: '1',
			name: 'mario-1',
			image: 'img1.png',
		});
		expect(result[1]).toEqual({
			id: '2',
			name: 'mario-2',
			image: 'img2.png',
		});
	});
});
