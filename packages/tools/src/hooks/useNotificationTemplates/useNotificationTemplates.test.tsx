import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { notificationsService } from '@etnos/services';
import { useNotificationTemplates } from './useNotificationTemplates';

vi.mock('@etnos/services', () => ({
	notificationsService: { getTemplates: vi.fn() },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useNotificationTemplates', () => {
	beforeEach(() => vi.clearAllMocks());

	it('busca templates', async () => {
		(
			notificationsService.getTemplates as ReturnType<typeof vi.fn>
		).mockResolvedValueOnce([{ id: 't1' }]);

		const { result } = renderHook(() => useNotificationTemplates(), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(notificationsService.getTemplates).toHaveBeenCalled();
	});
});
