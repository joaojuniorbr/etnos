import React from 'react';

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAdminPerformanceTopUsers } from './useAdminPerformanceTopUsers';
import { schoolService } from '../../services';

vi.mock('../../services', () => ({
	schoolService: {
		getDashboardTopUsers: vi.fn(),
		getUsersRankingBySchool: vi.fn(),
	},
}));

const createWrapper = () => {
	const queryClient = new QueryClient();
	return ({ children }: { children: React.ReactNode }) =>
		React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useAdminPerformanceTopUsers hook', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve buscar top global quando escola for all', async () => {
		(
			schoolService.getDashboardTopUsers as ReturnType<typeof vi.fn>
		).mockResolvedValueOnce([{ position: 1, uid: 'u1', totalScore: 50 }]);

		const { result } = renderHook(
			() => useAdminPerformanceTopUsers('memory-game', 'all'),
			{ wrapper: createWrapper() },
		);

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(schoolService.getDashboardTopUsers).toHaveBeenCalledWith({
			gameSlug: 'memory-game',
			limit: 10,
		});
	});

	it('deve buscar ranking da escola e limitar a 10', async () => {
		(
			schoolService.getUsersRankingBySchool as ReturnType<typeof vi.fn>
		).mockResolvedValueOnce(
			Array.from({ length: 15 }, (_, index) => ({
				position: index + 1,
				uid: `u${index}`,
				totalScore: 100 - index,
			})),
		);

		const { result } = renderHook(
			() => useAdminPerformanceTopUsers('memory-game', 'school-1'),
			{ wrapper: createWrapper() },
		);

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(schoolService.getUsersRankingBySchool).toHaveBeenCalledWith(
			'school-1',
			'memory-game',
		);
		expect(result.current.data).toHaveLength(10);
	});
});
