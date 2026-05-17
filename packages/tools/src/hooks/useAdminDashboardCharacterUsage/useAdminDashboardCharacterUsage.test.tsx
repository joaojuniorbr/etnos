import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ADMIN_DASHBOARD_ALL_SCHOOLS } from '@etnos/types';
import { schoolService } from '@etnos/services';
import { useAdminDashboardCharacterUsage } from './useAdminDashboardCharacterUsage';

vi.mock('@etnos/services', () => ({
	schoolService: { getDashboardCharacterUsage: vi.fn() },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useAdminDashboardCharacterUsage', () => {
	beforeEach(() => vi.clearAllMocks());

	it('busca uso global sem schoolId', async () => {
		(
			schoolService.getDashboardCharacterUsage as ReturnType<typeof vi.fn>
		).mockResolvedValueOnce({ slices: [], totalPlays: 0 });

		const { result } = renderHook(
			() =>
				useAdminDashboardCharacterUsage(
					'memory-game',
					ADMIN_DASHBOARD_ALL_SCHOOLS,
				),
			{ wrapper },
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(schoolService.getDashboardCharacterUsage).toHaveBeenCalledWith({
			gameSlug: 'memory-game',
			schoolId: undefined,
		});
	});

	it('busca uso por escola', async () => {
		(
			schoolService.getDashboardCharacterUsage as ReturnType<typeof vi.fn>
		).mockResolvedValueOnce({ slices: [], totalPlays: 1 });

		const { result } = renderHook(
			() => useAdminDashboardCharacterUsage('memory-game', 'school-1'),
			{ wrapper },
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(schoolService.getDashboardCharacterUsage).toHaveBeenCalledWith({
			gameSlug: 'memory-game',
			schoolId: 'school-1',
		});
	});

	it('nao busca sem gameSlug', () => {
		renderHook(
			() => useAdminDashboardCharacterUsage('', ADMIN_DASHBOARD_ALL_SCHOOLS),
			{ wrapper },
		);
		expect(schoolService.getDashboardCharacterUsage).not.toHaveBeenCalled();
	});
});
