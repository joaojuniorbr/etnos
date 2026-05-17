import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { schoolService } from '@etnos/services';
import { useSchoolUsersRanking } from './useSchoolUsersRanking';

vi.mock('@etnos/services', () => ({
	schoolService: { getUsersRankingBySchool: vi.fn() },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useSchoolUsersRanking', () => {
	beforeEach(() => vi.clearAllMocks());

	it('busca ranking de usuarios', async () => {
		(
			schoolService.getUsersRankingBySchool as ReturnType<typeof vi.fn>
		).mockResolvedValueOnce([{ position: 1 }]);

		const { result } = renderHook(
			() =>
				useSchoolUsersRanking('school-1', 'memory-game', 'anita'),
			{ wrapper },
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(schoolService.getUsersRankingBySchool).toHaveBeenCalledWith(
			'school-1',
			'memory-game',
			'anita',
		);
	});

	it('usa filtros padrao quando nao informados', async () => {
		(
			schoolService.getUsersRankingBySchool as ReturnType<typeof vi.fn>
		).mockResolvedValueOnce([]);

		const { result } = renderHook(() => useSchoolUsersRanking('school-1'), {
			wrapper,
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(schoolService.getUsersRankingBySchool).toHaveBeenCalledWith(
			'school-1',
			undefined,
			undefined,
		);
	});
});
