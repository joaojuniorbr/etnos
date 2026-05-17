import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ADMIN_DASHBOARD_ALL_SCHOOLS } from '@etnos/types';
import { schoolService } from '@etnos/services';
import { useAdminDashboardNps } from './useAdminDashboardNps';

vi.mock('@etnos/services', () => ({
	schoolService: { getDashboardNps: vi.fn() },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useAdminDashboardNps', () => {
	beforeEach(() => vi.clearAllMocks());

	it('busca NPS global', async () => {
		(schoolService.getDashboardNps as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
			{ totalResponses: 1, slices: [], viewMode: 'by_school' },
		);

		const { result } = renderHook(
			() => useAdminDashboardNps('memory-game', ADMIN_DASHBOARD_ALL_SCHOOLS),
			{ wrapper },
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(schoolService.getDashboardNps).toHaveBeenCalledWith({
			gameSlug: 'memory-game',
			schoolId: undefined,
		});
	});

	it('busca NPS por escola', async () => {
		(schoolService.getDashboardNps as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
			{ totalResponses: 2, slices: [], viewMode: 'by_school' },
		);

		const { result } = renderHook(
			() => useAdminDashboardNps('memory-game', 'school-1'),
			{ wrapper },
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(schoolService.getDashboardNps).toHaveBeenCalledWith({
			gameSlug: 'memory-game',
			schoolId: 'school-1',
		});
	});
});
