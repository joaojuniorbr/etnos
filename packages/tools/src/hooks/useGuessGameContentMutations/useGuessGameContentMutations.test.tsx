import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { guessGameContentService } from '@etnos/services';
import { useGuessGameContentMutations } from './useGuessGameContentMutations';

vi.mock('@etnos/services', () => ({
	guessGameContentService: {
		saveContent: vi.fn(),
		deleteContent: vi.fn(),
	},
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useGuessGameContentMutations', () => {
	beforeEach(() => vi.clearAllMocks());

	it('salva e remove conteudo', async () => {
		(
			guessGameContentService.saveContent as ReturnType<typeof vi.fn>
		).mockResolvedValueOnce({ id: '1' });
		(
			guessGameContentService.deleteContent as ReturnType<typeof vi.fn>
		).mockResolvedValueOnce(true);

		const { result } = renderHook(
			() => useGuessGameContentMutations('anita'),
			{ wrapper },
		);

		await act(async () => {
			await result.current.saveContent.mutateAsync({ id: '1' } as never);
		});

		await act(async () => {
			await result.current.deleteContent.mutateAsync('1');
		});

		expect(guessGameContentService.saveContent).toHaveBeenCalled();
		expect(guessGameContentService.deleteContent).toHaveBeenCalledWith('1');
	});
});
