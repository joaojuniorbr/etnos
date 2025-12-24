import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { createWrapper } from '../../test';
import { configGamesService } from '../../services';
import { useGamesConfig } from './useGamesConfig';

vi.mock('../../services', () => ({
	configGamesService: {
		getByGame: vi.fn(),
	},
}));

const mockGames = [
	{
		id: '1',
		gameSlug: 'game-1',
		characterSlug: 'character-1',
		imageCoverUrl: 'img-1.png',
	},
	{
		id: '2',
		gameSlug: 'game-2',
		characterSlug: 'character-2',
		imageCoverUrl: 'img-2.png',
	},
];

describe('useGamesConfig', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve buscar as configurações do jogo de acordo com o slug', async () => {
		const slug = 'link';

		vi.mocked(configGamesService.getByGame).mockResolvedValueOnce(mockGames);

		const { result } = renderHook(() => useGamesConfig(slug), {
			wrapper: createWrapper(),
		});

		expect(result.current.isLoading).toBe(true);

		await waitFor(() => {
			expect(result.current.data).toBeDefined();
		});

		expect(configGamesService.getByGame).toHaveBeenCalledTimes(1);

		expect(configGamesService.getByGame).toHaveBeenCalledWith(slug);

		expect(result.current.data).toEqual(mockGames);
	});
});
