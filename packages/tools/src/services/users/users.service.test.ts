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
