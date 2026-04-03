import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useMemoryGameContent } from './useMemoryGameContent';
import { memoryGameContentService } from '../../services';
import { createWrapper } from '../../test';

vi.mock('../../services', () => ({
	memoryGameContentService: {
		getMemoryGameImages: vi.fn(),
	},
}));

const mockImages = [
	{ id: '1', image: 'img-1.png', name: 'image-1' },
	{ id: '2', image: 'img-2.png', name: 'image-2' },
];

describe('useMemoryGameContent', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve buscar as imagens do jogo da memória pelo slug do personagem', async () => {
		const slug = 'link';

		vi.mocked(
			memoryGameContentService.getMemoryGameImages,
		).mockResolvedValueOnce(mockImages);

		const { result } = renderHook(() => useMemoryGameContent(slug), {
			wrapper: createWrapper(),
		});

		expect(result.current.isLoading).toBe(true);

		await waitFor(() => {
			expect(result.current.data).toBeDefined();
		});

		expect(memoryGameContentService.getMemoryGameImages).toHaveBeenCalledTimes(
			1,
		);

		expect(memoryGameContentService.getMemoryGameImages).toHaveBeenCalledWith(
			slug,
		);

		expect(result.current.data).toEqual(mockImages);
	});
});
