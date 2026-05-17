import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usersService } from '@etnos/services';
import { useUpdateAdminUserMutation } from './useUpdateAdminUserMutation';

vi.mock('@etnos/services', () => ({
	usersService: { update: vi.fn() },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useUpdateAdminUserMutation', () => {
	beforeEach(() => vi.clearAllMocks());

	it('atualiza usuario admin', async () => {
		(usersService.update as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
			id: '1',
		});

		const { result } = renderHook(() => useUpdateAdminUserMutation(), { wrapper });

		await act(async () => {
			await result.current.mutateAsync({
				id: '1',
				payload: { isActive: false },
			});
		});

		expect(usersService.update).toHaveBeenCalledWith('1', { isActive: false });
	});
});
