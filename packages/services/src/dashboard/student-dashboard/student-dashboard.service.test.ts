import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock } = vi.hoisted(() => ({
	apiMock: {
		get: vi.fn(),
	},
}));

vi.mock('../../api', () => ({
	api: apiMock,
}));

import { studentDashboardService } from './student-dashboard.service';

describe('studentDashboardService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('busca dashboard do estudante sem filtro de personagem', async () => {
		const dashboard = { user: { name: 'Ana Silva' } };
		apiMock.get.mockResolvedValueOnce({ data: dashboard });

		const result = await studentDashboardService.getDashboard();

		expect(apiMock.get).toHaveBeenCalledWith('/dashboard/student', {
			params: undefined,
		});
		expect(result).toEqual(dashboard);
	});

	it('busca dashboard do estudante filtrando por personagem', async () => {
		const dashboard = { user: { name: 'Ana Silva' } };
		apiMock.get.mockResolvedValueOnce({ data: dashboard });

		const result = await studentDashboardService.getDashboard('iara');

		expect(apiMock.get).toHaveBeenCalledWith('/dashboard/student', {
			params: { characterSlug: 'iara' },
		});
		expect(result).toEqual(dashboard);
	});
});
