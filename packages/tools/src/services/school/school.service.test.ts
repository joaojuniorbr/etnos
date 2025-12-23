import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SchoolInterface, schoolService } from './school.service';
import { mockRepo } from '../../test';

describe('schoolService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('retorna escolas ordenadas por nome', async () => {
		const schools: SchoolInterface[] = [
			{ id: '1', name: 'IFPR' },
			{ id: '2', name: 'UTFPR' },
		];

		mockRepo.findMany.mockResolvedValueOnce(schools);

		const result = await schoolService.getAll();

		expect(result).toEqual(schools);
		expect(mockRepo.findMany).toHaveBeenCalledOnce();
	});

	it('cria escola quando não existe duplicada', async () => {
		const school: SchoolInterface = {
			id: '1',
			name: 'IFPR',
			city: 'Curitiba',
		};

		mockRepo.findOne.mockResolvedValueOnce(null);
		mockRepo.create.mockResolvedValueOnce({ id: 'generated-id' });

		const result = await schoolService.create(school);

		expect(mockRepo.findOne).toHaveBeenCalledOnce();
		expect(mockRepo.create).toHaveBeenCalledWith(school);
		expect(result).toEqual({ id: 'generated-id' });
	});

	it('retorna null se escola já existir', async () => {
		mockRepo.findOne.mockResolvedValueOnce({ id: '1' });

		const result = await schoolService.create({
			id: '2',
			name: 'IFPR',
			city: 'Curitiba',
		});

		expect(result).toBeNull();
		expect(mockRepo.create).not.toHaveBeenCalled();
	});

	it('atualiza escola quando não há conflito', async () => {
		mockRepo.findOne.mockResolvedValueOnce(null);
		mockRepo.update.mockResolvedValueOnce({ id: '1' });

		const result = await schoolService.update('1', {
			name: 'IFPR Atualizado',
		});

		expect(mockRepo.update).toHaveBeenCalledWith('1', {
			name: 'IFPR Atualizado',
		});
		expect(result).toEqual({ id: '1' });
	});

	it('retorna null se existir outra escola com mesmo nome e cidade', async () => {
		mockRepo.findOne.mockResolvedValueOnce({ id: '2' });

		const result = await schoolService.update('1', {
			name: 'IFPR',
			city: 'Curitiba',
		});

		expect(result).toBeNull();
		expect(mockRepo.update).not.toHaveBeenCalled();
	});

	it('deleta escola pelo id', async () => {
		mockRepo.delete.mockResolvedValueOnce(undefined);

		await schoolService.delete('1');

		expect(mockRepo.delete).toHaveBeenCalledWith('1');
	});

	it('retorna escola quando existir', async () => {
		const school: SchoolInterface = {
			id: '1',
			name: 'IFPR',
		};

		mockRepo.findOne.mockResolvedValueOnce(school);

		const result = await schoolService.getOne('1');

		expect(result).toEqual(school);
	});

	it('retorna null quando não existir', async () => {
		mockRepo.findOne.mockResolvedValueOnce(null);

		const result = await schoolService.getOne('999');

		expect(result).toBeNull();
	});
});
