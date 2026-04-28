import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock } = vi.hoisted(() => ({
	apiMock: {
		get: vi.fn(),
		patch: vi.fn(),
	},
}));

vi.mock('../../helpers', () => ({
	api: apiMock,
}));

import { usersService } from './users.service';

describe('usersService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('lista usuarios com filtros', async () => {
		apiMock.get.mockResolvedValueOnce({ data: [{ id: 'user-1' }] });

		const result = await usersService.getAll({
			schoolId: 'school-1',
			search: 'ana',
		});

		expect(apiMock.get).toHaveBeenCalledWith('/users', {
			params: {
				schoolId: 'school-1',
				search: 'ana',
			},
		});
		expect(result).toEqual([{ id: 'user-1' }]);
	});

	it('lista usuarios sem filtros', async () => {
		apiMock.get.mockResolvedValueOnce({ data: [{ id: 'user-1' }] });

		const result = await usersService.getAll();

		expect(apiMock.get).toHaveBeenCalledWith('/users', {
			params: {},
		});
		expect(result).toEqual([{ id: 'user-1' }]);
	});

	it('lista usuarios filtrando apenas por escola', async () => {
		apiMock.get.mockResolvedValueOnce({ data: [{ id: 'user-2' }] });

		const result = await usersService.getAll({
			schoolId: 'school-1',
		});

		expect(apiMock.get).toHaveBeenCalledWith('/users', {
			params: {
				schoolId: 'school-1',
			},
		});
		expect(result).toEqual([{ id: 'user-2' }]);
	});

	it('lista usuarios filtrando apenas por busca', async () => {
		apiMock.get.mockResolvedValueOnce({ data: [{ id: 'user-3' }] });

		const result = await usersService.getAll({
			search: 'maria',
		});

		expect(apiMock.get).toHaveBeenCalledWith('/users', {
			params: {
				search: 'maria',
			},
		});
		expect(result).toEqual([{ id: 'user-3' }]);
	});

	it('lista usuarios filtrando apenas por hasPushToken', async () => {
		apiMock.get.mockResolvedValueOnce({ data: [{ id: 'user-4' }] });

		const result = await usersService.getAll({
			hasPushToken: true,
		});

		expect(apiMock.get).toHaveBeenCalledWith('/users', {
			params: {
				hasPushToken: 'true',
			},
		});
		expect(result).toEqual([{ id: 'user-4' }]);
	});

	it('atualiza usuario', async () => {
		apiMock.patch.mockResolvedValueOnce({ data: { id: 'user-1' } });

		const result = await usersService.update('user-1', {
			roles: ['teacher'],
			isActive: true,
		});

		expect(apiMock.patch).toHaveBeenCalledWith('/users/user-1', {
			roles: ['teacher'],
			isActive: true,
		});
		expect(result).toEqual({ id: 'user-1' });
	});
});
