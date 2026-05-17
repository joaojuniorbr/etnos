import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { notificationsService } from '@etnos/services';
import { useNotificationHistory } from './useNotificationHistory';

vi.mock('@etnos/services', () => ({
	notificationsService: { getHistory: vi.fn() },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useNotificationHistory', () => {
	beforeEach(() => vi.clearAllMocks());

	it('busca historico', async () => {
		(notificationsService.getHistory as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
			[{ id: 'log-1' }],
		);

		const { result } = renderHook(() => useNotificationHistory(), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(notificationsService.getHistory).toHaveBeenCalled();
	});
});
