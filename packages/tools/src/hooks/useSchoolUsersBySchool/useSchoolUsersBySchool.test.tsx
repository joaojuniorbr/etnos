import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { schoolService } from '@etnos/services';
import { useSchoolUsersBySchool } from './useSchoolUsersBySchool';

vi.mock('@etnos/services', () => ({
	schoolService: { getUsersBySchool: vi.fn() },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useSchoolUsersBySchool', () => {
	beforeEach(() => vi.clearAllMocks());

	it('busca usuarios da escola', async () => {
		(schoolService.getUsersBySchool as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
			[{ id: 'u1' }],
		);

		const { result } = renderHook(
			() => useSchoolUsersBySchool('school-1', 'ana'),
			{ wrapper },
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(schoolService.getUsersBySchool).toHaveBeenCalledWith('school-1', 'ana');
	});

	it('busca sem termo de busca', async () => {
		(schoolService.getUsersBySchool as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
			[],
		);

		const { result } = renderHook(() => useSchoolUsersBySchool('school-1'), {
			wrapper,
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(schoolService.getUsersBySchool).toHaveBeenCalledWith(
			'school-1',
			undefined,
		);
	});

	it('nao busca sem schoolId', () => {
		renderHook(() => useSchoolUsersBySchool(''), { wrapper });
		expect(schoolService.getUsersBySchool).not.toHaveBeenCalled();
	});
});
