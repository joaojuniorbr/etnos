import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { schoolService } from '@etnos/services';
import { useManagedSchools } from './useManagedSchools';

vi.mock('@etnos/services', () => ({
	schoolService: { getManagedSchools: vi.fn() },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useManagedSchools', () => {
	beforeEach(() => vi.clearAllMocks());

	it('busca escolas gerenciadas', async () => {
		(schoolService.getManagedSchools as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
			[{ id: '1', name: 'IFPR' }],
		);

		const { result } = renderHook(() => useManagedSchools(), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(schoolService.getManagedSchools).toHaveBeenCalled();
		expect(result.current.data).toEqual([{ id: '1', name: 'IFPR' }]);
	});

	it('nao busca quando enabled for false', () => {
		renderHook(() => useManagedSchools({ enabled: false }), { wrapper });
		expect(schoolService.getManagedSchools).not.toHaveBeenCalled();
	});
});
