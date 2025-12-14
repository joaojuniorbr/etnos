import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGameScore } from './useGameScore';
import { scoreGamesService } from '../../services';
import React from 'react';

vi.mock('../../services', () => ({
	scoreGamesService: {
		getFromGameScore: vi.fn(),
	},
}));

const createWrapper = () => {
	const queryClient = new QueryClient();
	return ({ children }: any) =>
		React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useGameScore hook', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve retornar dados quando userId é válido', async () => {
		(scoreGamesService.getFromGameScore as any).mockResolvedValueOnce({
			score: 100,
		});

		const { result } = renderHook(
			() => useGameScore('user123', 'memory-game', 'iara'),
			{ wrapper: createWrapper() }
		);

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(scoreGamesService.getFromGameScore).toHaveBeenCalledWith(
			'memory-game',
			'iara',
			'user123'
		);
		expect(result.current.data).toEqual({ score: 100 });
	});
});
