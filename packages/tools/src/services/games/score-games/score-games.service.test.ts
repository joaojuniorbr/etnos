import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scoreGamesService } from './score-games.service';
import { mockRepo } from '../../../test';

describe('scoreGamesService', () => {
	const mockScore = {
		slug: 'memory-game',
		characterSlug: 'mario',
		score: 100,
		userId: 'user-123',
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('saveScore', () => {
		it('deve atualizar o score se já existir um registro para o usuário e jogo', async () => {
			const existingId = 'doc-abc';
			mockRepo.findOne.mockResolvedValueOnce({ id: existingId, ...mockScore });
			mockRepo.update.mockResolvedValueOnce({ id: existingId });

			await scoreGamesService.saveScore(
				'memory-game',
				'mario',
				200,
				'user-123'
			);

			expect(mockRepo.update).toHaveBeenCalledWith(existingId, { score: 200 });
			expect(mockRepo.create).not.toHaveBeenCalled();
		});

		it('deve criar um novo score se não existir registro prévio', async () => {
			mockRepo.findOne.mockResolvedValueOnce(null);
			mockRepo.create.mockResolvedValueOnce({ id: 'new-doc' });

			await scoreGamesService.saveScore(
				'memory-game',
				'mario',
				100,
				'user-123'
			);

			expect(mockRepo.create).toHaveBeenCalledWith(
				expect.objectContaining(mockScore)
			);
			expect(mockRepo.update).not.toHaveBeenCalled();
		});
	});

	describe('getScore', () => {
		it('deve retornar todos os scores de um usuário específico', async () => {
			const mockList = [mockScore, { ...mockScore, score: 50 }];
			mockRepo.findMany.mockResolvedValueOnce(mockList);

			const result = await scoreGamesService.getScore('user-123');

			expect(result).toEqual(mockList);
			expect(mockRepo.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.arrayContaining([
						expect.objectContaining({ field: 'userId', value: 'user-123' }),
					]),
				})
			);
		});
	});

	describe('getFromGameScore', () => {
		it('deve retornar null se userId não for fornecido', async () => {
			const result = await scoreGamesService.getFromGameScore(
				'slug',
				'char',
				''
			);
			expect(result).toBeNull();
			expect(mockRepo.findOne).not.toHaveBeenCalled();
		});

		it('deve buscar o score específico se o userId for fornecido', async () => {
			mockRepo.findOne.mockResolvedValueOnce(mockScore);

			const result = await scoreGamesService.getFromGameScore(
				'memory-game',
				'mario',
				'user-123'
			);

			expect(result).toEqual(mockScore);
			expect(mockRepo.findOne).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.arrayContaining([
						expect.objectContaining({ field: 'slug', value: 'memory-game' }),
						expect.objectContaining({ field: 'userId', value: 'user-123' }),
					]),
				})
			);
		});
	});
});
