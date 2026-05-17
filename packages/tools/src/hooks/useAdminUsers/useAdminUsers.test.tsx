import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usersService } from '@etnos/services';
import { useAdminUsers } from './useAdminUsers';

vi.mock('@etnos/services', () => ({
	usersService: { getAll: vi.fn() },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useAdminUsers', () => {
	beforeEach(() => vi.clearAllMocks());

	it('busca usuarios admin com filtros', async () => {
		(usersService.getAll as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
			{ id: '1', name: 'Ana' },
		]);

		const { result } = renderHook(
			() =>
				useAdminUsers({
					schoolId: 'school-1',
					search: 'ana',
					hasPushToken: true,
				}),
			{ wrapper },
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(usersService.getAll).toHaveBeenCalledWith({
			schoolId: 'school-1',
			search: 'ana',
			hasPushToken: true,
		});
	});

	it('usa filtros padrao na query key', async () => {
		(usersService.getAll as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

		const { result } = renderHook(() => useAdminUsers({}), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(usersService.getAll).toHaveBeenCalledWith({});
	});

	it('nao busca quando enabled for false', () => {
		renderHook(() => useAdminUsers({}, { enabled: false }), { wrapper });
		expect(usersService.getAll).not.toHaveBeenCalled();
	});
});
