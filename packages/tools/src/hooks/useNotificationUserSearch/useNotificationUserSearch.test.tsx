import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usersService } from '@etnos/services';
import { useNotificationUserSearch } from './useNotificationUserSearch';

vi.mock('@etnos/services', () => ({
	usersService: { getAll: vi.fn() },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useNotificationUserSearch', () => {
	beforeEach(() => vi.clearAllMocks());

	it('busca usuarios com push quando busca tem 2+ caracteres', async () => {
		(usersService.getAll as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
			{ id: '1' },
		]);

		const { result } = renderHook(() => useNotificationUserSearch('ana'), {
			wrapper,
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(usersService.getAll).toHaveBeenCalledWith({
			search: 'ana',
			hasPushToken: true,
		});
	});

	it('nao busca com termo curto', () => {
		renderHook(() => useNotificationUserSearch('a'), { wrapper });
		expect(usersService.getAll).not.toHaveBeenCalled();
	});
});
