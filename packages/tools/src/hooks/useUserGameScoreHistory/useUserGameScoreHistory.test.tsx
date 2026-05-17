import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { schoolService } from '@etnos/services';
import { useUserGameScoreHistory } from './useUserGameScoreHistory';

vi.mock('@etnos/services', () => ({
	schoolService: { getUserGameScoreHistory: vi.fn() },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useUserGameScoreHistory', () => {
	beforeEach(() => vi.clearAllMocks());

	it('busca historico de pontuacao', async () => {
		(
			schoolService.getUserGameScoreHistory as ReturnType<typeof vi.fn>
		).mockResolvedValueOnce([{ score: 10 }]);

		const { result } = renderHook(
			() => useUserGameScoreHistory('school-1', 'user-1'),
			{ wrapper },
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(schoolService.getUserGameScoreHistory).toHaveBeenCalledWith(
			'school-1',
			'user-1',
		);
	});

	it('nao busca sem userId', () => {
		renderHook(() => useUserGameScoreHistory('school-1'), { wrapper });
		expect(schoolService.getUserGameScoreHistory).not.toHaveBeenCalled();
	});

	it('nao busca quando enabled for false', () => {
		renderHook(
			() =>
				useUserGameScoreHistory('school-1', 'user-1', { enabled: false }),
			{ wrapper },
		);
		expect(schoolService.getUserGameScoreHistory).not.toHaveBeenCalled();
	});

	it('nao busca sem schoolId', () => {
		renderHook(() => useUserGameScoreHistory('', 'user-1'), { wrapper });
		expect(schoolService.getUserGameScoreHistory).not.toHaveBeenCalled();
	});
});
