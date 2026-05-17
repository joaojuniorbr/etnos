import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { notificationsService } from '@etnos/services';
import { useNotificationRecipientsCount } from './useNotificationRecipientsCount';

vi.mock('@etnos/services', () => ({
	notificationsService: { countRecipients: vi.fn() },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useNotificationRecipientsCount', () => {
	beforeEach(() => vi.clearAllMocks());

	it('conta destinatarios', async () => {
		(
			notificationsService.countRecipients as ReturnType<typeof vi.fn>
		).mockResolvedValueOnce({ count: 3 });

		const payload = { targetType: 'SCHOOL' as const, schoolId: 'school-1' };
		const { result } = renderHook(
			() => useNotificationRecipientsCount(payload),
			{ wrapper },
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(notificationsService.countRecipients).toHaveBeenCalledWith(payload);
	});

	it('nao busca sem payload', () => {
		renderHook(() => useNotificationRecipientsCount(null), { wrapper });
		expect(notificationsService.countRecipients).not.toHaveBeenCalled();
	});
});
