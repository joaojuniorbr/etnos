import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { schoolService } from '@etnos/services';
import { useSchoolGameAccess } from './useSchoolGameAccess';

vi.mock('@etnos/services', () => ({
	schoolService: { getGameAccessBySchool: vi.fn() },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useSchoolGameAccess', () => {
	beforeEach(() => vi.clearAllMocks());

	it('busca acesso aos jogos', async () => {
		(
			schoolService.getGameAccessBySchool as ReturnType<typeof vi.fn>
		).mockResolvedValueOnce({ games: [] });

		const { result } = renderHook(() => useSchoolGameAccess('school-1'), {
			wrapper,
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(schoolService.getGameAccessBySchool).toHaveBeenCalledWith('school-1');
	});
});
