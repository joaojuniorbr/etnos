import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usersService } from '@etnos/services';
import { useUpdateUserRolesMutation } from './useUpdateUserRolesMutation';

vi.mock('@etnos/services', () => ({
	usersService: { update: vi.fn() },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useUpdateUserRolesMutation', () => {
	beforeEach(() => vi.clearAllMocks());

	it('atualiza papeis do usuario', async () => {
		(usersService.update as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
			id: '1',
		});

		const { result } = renderHook(() => useUpdateUserRolesMutation(), {
			wrapper,
		});

		await act(async () => {
			await result.current.mutateAsync({
				userId: '1',
				roles: ['admin'],
			});
		});

		expect(usersService.update).toHaveBeenCalledWith('1', { roles: ['admin'] });
	});
});
