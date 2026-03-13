import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock } = vi.hoisted(() => ({
	apiMock: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}));

vi.mock('../../helpers', () => ({
	api: apiMock,
}));

import { schoolService } from './school.service';

describe('schoolService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve buscar escolas', async () => {
		apiMock.get.mockResolvedValueOnce({ data: [{ id: '1' }] });

		const result = await schoolService.getAll();

		expect(apiMock.get).toHaveBeenCalledWith('/schools');
		expect(result).toEqual([{ id: '1' }]);
	});

	it('deve criar escola', async () => {
		const school = { id: '1', name: 'IFPR' } as any;
		apiMock.post.mockResolvedValueOnce({ data: school });

		await schoolService.create(school);

		expect(apiMock.post).toHaveBeenCalledWith('/schools', school);
	});

	it('deve atualizar escola', async () => {
		const payload = { name: 'Novo nome' };
		apiMock.patch.mockResolvedValueOnce({ data: payload });

		await schoolService.update('1', payload);

		expect(apiMock.patch).toHaveBeenCalledWith('/schools/1', payload);
	});

	it('deve excluir escola', async () => {
		apiMock.delete.mockResolvedValueOnce({ data: true });

		await schoolService.delete('1');

		expect(apiMock.delete).toHaveBeenCalledWith('/schools/1');
	});

	it('deve buscar escola por id', async () => {
		apiMock.get.mockResolvedValueOnce({ data: { id: '1', name: 'IFPR' } });

		const result = await schoolService.getOne('1');

		expect(apiMock.get).toHaveBeenCalledWith('/schools/1');
		expect(result).toEqual({ id: '1', name: 'IFPR' });
	});
});
