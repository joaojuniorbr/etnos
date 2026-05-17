import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { memoryGameContentService } from '@etnos/services';
import { useMemoryGameEditorContent } from './useMemoryGameEditorContent';

vi.mock('@etnos/services', () => ({
	memoryGameContentService: { getContent: vi.fn() },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useMemoryGameEditorContent', () => {
	beforeEach(() => vi.clearAllMocks());

	it('busca conteudo do editor', async () => {
		(
			memoryGameContentService.getContent as ReturnType<typeof vi.fn>
		).mockResolvedValueOnce([{ id: '1' }]);

		const { result } = renderHook(
			() => useMemoryGameEditorContent('anita'),
			{ wrapper },
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(memoryGameContentService.getContent).toHaveBeenCalledWith('anita');
	});
});
