import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	configGamesService,
	ConfigGamesInterface,
} from './config-games.service';
import { mockRepo } from '../../../test';

describe('configGamesService', () => {
	const mockData: ConfigGamesInterface = {
		gameSlug: 'mario-bros',
		characterSlug: 'luigi',
		imageCoverUrl: 'http://image.com/luigi.png',
	};

	const expectedId = 'mario-bros_luigi';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('save deve gerar o ID correto e chamar o update do repositório', async () => {
		mockRepo.update.mockResolvedValueOnce({ id: expectedId });

		const result = await configGamesService.save(mockData);

		expect(result).toEqual({
			id: expectedId,
			...mockData,
		});
		expect(mockRepo.update).toHaveBeenCalledWith(expectedId, mockData);
	});

	it('get deve buscar um documento pelo ID composto usando __name__', async () => {
		const mockReturn = { id: expectedId, ...mockData };
		mockRepo.findOne.mockResolvedValueOnce(mockReturn);

		const result = await configGamesService.get('mario-bros', 'luigi');

		expect(result).toEqual(mockReturn);
	});

	it('get deve retornar null quando o repositório não encontrar o documento', async () => {
		mockRepo.findOne.mockResolvedValueOnce(null);

		const result = await configGamesService.get('inexistente', 'slug');

		expect(result).toBeNull();
	});

	it('getByGame deve filtrar os documentos pelo gameSlug', async () => {
		const mockList = [{ id: expectedId, ...mockData }];
		mockRepo.findMany.mockResolvedValueOnce(mockList);

		const result = await configGamesService.getByGame('mario-bros');

		expect(result).toEqual(mockList);
		expect(mockRepo.findMany).toHaveBeenCalledWith({
			where: [
				{
					field: 'gameSlug',
					op: '==',
					value: 'mario-bros',
				},
			],
		});
	});

	it('remove deve deletar o documento usando o ID correto e retornar true', async () => {
		mockRepo.delete.mockResolvedValueOnce(undefined);

		const result = await configGamesService.remove('mario-bros', 'luigi');

		expect(result).toBe(true);
		expect(mockRepo.delete).toHaveBeenCalledWith(expectedId);
	});
});
