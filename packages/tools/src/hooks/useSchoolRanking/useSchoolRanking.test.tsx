import React from 'react';

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSchoolRanking } from './useSchoolRanking';
import { schoolService } from '../../services';

vi.mock('../../services', () => ({
	schoolService: {
		getRanking: vi.fn(),
	},
}));

const createWrapper = () => {
	const queryClient = new QueryClient();
	return ({ children }: { children: React.ReactNode }) =>
		React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useSchoolRanking hook', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve chamar schoolService.getRanking com gameSlug', async () => {
		(schoolService.getRanking as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
			[{ position: 1, schoolId: '1', schoolName: 'IFPR', totalScore: 100 }],
		);

		const { result } = renderHook(() => useSchoolRanking('memory-game'), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(schoolService.getRanking).toHaveBeenCalledWith('memory-game');
		expect(result.current.data).toHaveLength(1);
	});

	it('nao deve buscar quando enabled for false', async () => {
		renderHook(() => useSchoolRanking('memory-game', { enabled: false }), {
			wrapper: createWrapper(),
		});

		expect(schoolService.getRanking).not.toHaveBeenCalled();
	});
});
