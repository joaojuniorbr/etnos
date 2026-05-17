import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { notificationsService } from '@etnos/services';
import { useNotificationMutations } from './useNotificationMutations';

vi.mock('@etnos/services', () => ({
	notificationsService: {
		send: vi.fn(),
		createTemplate: vi.fn(),
		updateTemplate: vi.fn(),
		deleteTemplate: vi.fn(),
	},
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useNotificationMutations', () => {
	beforeEach(() => vi.clearAllMocks());

	it('envia notificacao', async () => {
		(notificationsService.send as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
			true,
		);

		const { result } = renderHook(() => useNotificationMutations(), { wrapper });
		const payload = { title: 'Oi', body: 'Teste', targetType: 'all' as const };

		await act(async () => {
			await result.current.sendNotification.mutateAsync(payload as never);
		});

		expect(notificationsService.send).toHaveBeenCalledWith(payload);
	});

	it('gerencia templates', async () => {
		(
			notificationsService.createTemplate as ReturnType<typeof vi.fn>
		).mockResolvedValueOnce({ id: 't1' });
		(
			notificationsService.updateTemplate as ReturnType<typeof vi.fn>
		).mockResolvedValueOnce({ id: 't1' });
		(
			notificationsService.deleteTemplate as ReturnType<typeof vi.fn>
		).mockResolvedValueOnce(true);

		const { result } = renderHook(() => useNotificationMutations(), { wrapper });

		await act(async () => {
			await result.current.createTemplate.mutateAsync({
				name: 'Tpl',
				title: 'T',
				body: 'B',
			} as never);
		});

		await act(async () => {
			await result.current.updateTemplate.mutateAsync({
				id: 't1',
				payload: { name: 'Tpl 2' },
			} as never);
		});

		await act(async () => {
			await result.current.deleteTemplate.mutateAsync('t1');
		});

		expect(notificationsService.createTemplate).toHaveBeenCalled();
		expect(notificationsService.updateTemplate).toHaveBeenCalledWith('t1', {
			name: 'Tpl 2',
		});
		expect(notificationsService.deleteTemplate).toHaveBeenCalledWith('t1');
	});
});
