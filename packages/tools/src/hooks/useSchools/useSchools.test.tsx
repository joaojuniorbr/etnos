import React from 'react';

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSchools } from './useSchools';
import { schoolService } from '../../services';

vi.mock('../../services', () => ({
	schoolService: {
		getAll: vi.fn(),
	},
}));

const createWrapper = () => {
	const queryClient = new QueryClient();
	return ({ children }: any) =>
		React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useSchools hook', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve chamar schoolService.getAll e retornar dados', async () => {
		(schoolService.getAll as any).mockResolvedValueOnce([
			{ id: '1', name: 'Escola A' },
			{ id: '2', name: 'Escola B' },
		]);

		const { result } = renderHook(() => useSchools(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);

			expect(schoolService.getAll).toHaveBeenCalled();
			expect(result.current.data).toEqual([
				{ id: '1', name: 'Escola A' },
				{ id: '2', name: 'Escola B' },
			]);
		});
	});
});
