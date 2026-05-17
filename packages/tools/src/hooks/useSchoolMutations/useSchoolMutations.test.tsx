import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { schoolService } from '@etnos/services';
import { useSchoolMutations } from './useSchoolMutations';

vi.mock('@etnos/services', () => ({
	schoolService: {
		create: vi.fn(),
		delete: vi.fn(),
		update: vi.fn(),
		addAccessUserToSchool: vi.fn(),
		removeAccessUserFromSchool: vi.fn(),
		updateGameAccessBySchool: vi.fn(),
	},
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useSchoolMutations', () => {
	beforeEach(() => vi.clearAllMocks());

	it('cria escola e invalida cache', async () => {
		(schoolService.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
			id: '1',
		});

		const { result } = renderHook(() => useSchoolMutations(), { wrapper });

		await act(async () => {
			await result.current.createSchool.mutateAsync({ id: '1', name: 'IFPR' } as never);
		});

		expect(schoolService.create).toHaveBeenCalled();
	});

	it('remove escola', async () => {
		(schoolService.delete as ReturnType<typeof vi.fn>).mockResolvedValueOnce(true);

		const { result } = renderHook(() => useSchoolMutations(), { wrapper });

		await act(async () => {
			await result.current.deleteSchool.mutateAsync('1');
		});

		expect(schoolService.delete).toHaveBeenCalledWith('1');
	});

	it('atualiza campo da escola', async () => {
		(schoolService.update as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});

		const { result } = renderHook(() => useSchoolMutations(), { wrapper });

		await act(async () => {
			await result.current.updateSchoolField.mutateAsync({
				id: '1',
				field: 'name',
				value: 'Novo',
			});
		});

		expect(schoolService.update).toHaveBeenCalledWith('1', { name: 'Novo' });
	});

	it('adiciona e remove usuario com acesso', async () => {
		(
			schoolService.addAccessUserToSchool as ReturnType<typeof vi.fn>
		).mockResolvedValueOnce(true);
		(
			schoolService.removeAccessUserFromSchool as ReturnType<typeof vi.fn>
		).mockResolvedValueOnce(true);

		const { result } = renderHook(() => useSchoolMutations(), { wrapper });

		await act(async () => {
			await result.current.addSchoolAccessUser.mutateAsync({
				schoolId: 'school-1',
				email: 'a@test.com',
			});
		});

		await act(async () => {
			await result.current.removeSchoolAccessUser.mutateAsync({
				schoolId: 'school-1',
				userId: 'user-1',
			});
		});

		expect(schoolService.addAccessUserToSchool).toHaveBeenCalledWith(
			'school-1',
			'a@test.com',
		);
		expect(schoolService.removeAccessUserFromSchool).toHaveBeenCalledWith(
			'school-1',
			'user-1',
		);
	});

	it('atualiza acesso aos jogos', async () => {
		(
			schoolService.updateGameAccessBySchool as ReturnType<typeof vi.fn>
		).mockResolvedValueOnce({ games: [] });

		const { result } = renderHook(() => useSchoolMutations(), { wrapper });
		const payload = { memoryGame: true };

		await act(async () => {
			await result.current.updateSchoolGameAccess.mutateAsync({
				schoolId: 'school-1',
				payload: payload as never,
			});
		});

		await waitFor(() => {
			expect(schoolService.updateGameAccessBySchool).toHaveBeenCalledWith(
				'school-1',
				payload,
			);
		});
	});
});
