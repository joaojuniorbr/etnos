import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { schoolService } from '@etnos/services';
import { useSchoolAccessUsers } from './useSchoolAccessUsers';

vi.mock('@etnos/services', () => ({
	schoolService: { getAccessUsersBySchool: vi.fn() },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useSchoolAccessUsers', () => {
	beforeEach(() => vi.clearAllMocks());

	it('busca usuarios com acesso', async () => {
		(
			schoolService.getAccessUsersBySchool as ReturnType<typeof vi.fn>
		).mockResolvedValueOnce([{ id: 'u1' }]);

		const { result } = renderHook(() => useSchoolAccessUsers('school-1'), {
			wrapper,
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(schoolService.getAccessUsersBySchool).toHaveBeenCalledWith('school-1');
	});
});
