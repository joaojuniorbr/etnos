import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { memoryGameContentService } from '@etnos/services';
import { useMemoryGameContentMutations } from './useMemoryGameContentMutations';

vi.mock('@etnos/services', () => ({
	memoryGameContentService: {
		saveContent: vi.fn(),
		deleteContent: vi.fn(),
	},
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useMemoryGameContentMutations', () => {
	beforeEach(() => vi.clearAllMocks());

	it('salva e remove conteudo', async () => {
		(
			memoryGameContentService.saveContent as ReturnType<typeof vi.fn>
		).mockResolvedValueOnce({ id: '1' });
		(
			memoryGameContentService.deleteContent as ReturnType<typeof vi.fn>
		).mockResolvedValueOnce(true);

		const { result } = renderHook(
			() => useMemoryGameContentMutations('anita'),
			{ wrapper },
		);

		await act(async () => {
			await result.current.saveContent.mutateAsync({ id: '1' });
		});

		await act(async () => {
			await result.current.deleteContent.mutateAsync('1');
		});

		expect(memoryGameContentService.saveContent).toHaveBeenCalled();
		expect(memoryGameContentService.deleteContent).toHaveBeenCalledWith('1');
	});
});
