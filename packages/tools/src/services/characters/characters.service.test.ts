import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRepo } from '../../test';
import { charactersService } from './characters.service';

const mockCharacter = {
	id: 'id',
	name: 'Character Test',
	region: 'Region Test',
	description: 'Description Test',
	slug: 'slug-test',
};

describe('characterService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve fazer criar um novo personagem', async () => {
		mockRepo.findOne.mockResolvedValueOnce(null);
		mockRepo.create.mockResolvedValueOnce({ id: 'generated-id' });

		const result = await charactersService.save(mockCharacter);

		expect(mockRepo.findOne).toHaveBeenCalledOnce();
		expect(mockRepo.create).toHaveBeenCalledWith(mockCharacter);
		expect(result).toEqual({ id: 'generated-id' });
	});

	it('não deve criar o personagem caso tenha um', async () => {
		mockRepo.findOne.mockResolvedValueOnce(mockCharacter);

		const result = await charactersService.save(mockCharacter);

		expect(mockRepo.findOne).toHaveBeenCalledOnce();
		expect(mockRepo.create).not.toHaveBeenCalled();
		expect(result).toBeNull();
	});

	it('deve atualizar um personagem', async () => {
		mockRepo.update.mockResolvedValueOnce(mockCharacter);

		const result = await charactersService.update({
			...mockCharacter,
			name: 'Character Test Updated',
		});

		expect(mockRepo.update).toHaveBeenCalledOnce();
		expect(result).toEqual(mockCharacter);
	});

	it('não atualizar caso exista o personagem e seja diferente do ID passado', async () => {
		mockRepo.findOne.mockResolvedValueOnce({ ...mockCharacter, id: 'test-id' });

		const result = await charactersService.update(mockCharacter);

		expect(mockRepo.findOne).toHaveBeenCalledOnce();
		expect(mockRepo.update).not.toHaveBeenCalled();
		expect(result).toBeNull();
	});

	it('deve trazer a lista de personagens', async () => {
		mockRepo.findMany.mockResolvedValueOnce([mockCharacter]);

		const result = await charactersService.getCharacters();

		expect(mockRepo.findMany).toHaveBeenCalledOnce();
		expect(result).toEqual([mockCharacter]);
	});

	it('deve encontrar um personagem pelo slug', async () => {
		mockRepo.findOne.mockResolvedValueOnce(mockCharacter);

		const result = await charactersService.getCharacterBySlug(
			mockCharacter.slug
		);

		expect(mockRepo.findOne).toHaveBeenCalledOnce();
		expect(result).toEqual(mockCharacter);
	});
});
