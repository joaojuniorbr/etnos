import { createElement, type ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import {
	useGuessGameContent,
	useGuessGamePlayableContent,
} from './useGuessGameContent';
import { guessGameContentService } from '../../services';

vi.mock('../../services', () => ({
	guessGameContentService: {
		getContent: vi.fn(),
		getPlayableContent: vi.fn(),
	},
}));

describe('useGuessGameContent', () => {
	it('deve buscar conteúdo do guess game', async () => {
		vi.mocked(guessGameContentService.getContent).mockResolvedValueOnce([
			{
				id: '1',
				title: 'Chimarrao',
				word: 'Bomba',
				tips: ['Dica 1'],
				imageUrl: null,
				description: 'Descricao',
				characterSlug: 'anita',
			},
		]);

		const queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					retry: false,
				},
			},
		});

		const wrapper = ({ children }: { children: ReactNode }) =>
			createElement(QueryClientProvider, { client: queryClient }, children);

		const { result } = renderHook(() => useGuessGameContent('anita'), {
			wrapper,
		});

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(guessGameContentService.getContent).toHaveBeenCalledWith('anita');
		expect(result.current.data).toEqual([
			{
				id: '1',
				title: 'Chimarrao',
				word: 'Bomba',
				tips: ['Dica 1'],
				imageUrl: null,
				description: 'Descricao',
				characterSlug: 'anita',
			},
		]);
	});

	it('deve buscar conteúdo jogável do guess game', async () => {
		vi.mocked(guessGameContentService.getPlayableContent).mockResolvedValueOnce({
			id: '1',
			title: 'Chimarrao',
			tips: ['Dica 1'],
			imageUrl: null,
			characterSlug: 'anita',
			wordLength: 5,
		});

		const queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					retry: false,
				},
			},
		});

		const wrapper = ({ children }: { children: ReactNode }) =>
			createElement(QueryClientProvider, { client: queryClient }, children);

		const { result } = renderHook(
			() => useGuessGamePlayableContent('anita', 0),
			{
				wrapper,
			},
		);

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(guessGameContentService.getPlayableContent).toHaveBeenCalledWith(
			'anita',
		);
		expect(result.current.data).toEqual({
			id: '1',
			title: 'Chimarrao',
			tips: ['Dica 1'],
			imageUrl: null,
			characterSlug: 'anita',
			wordLength: 5,
		});
	});
});
