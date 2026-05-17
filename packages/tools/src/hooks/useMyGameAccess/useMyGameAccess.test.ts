import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { createWrapper } from '../../test';
import { schoolService } from '@etnos/services';
import { useMyGameAccess } from './useMyGameAccess';

vi.mock('@etnos/services', () => ({
	schoolService: {
		getMyGameAccess: vi.fn(),
	},
}));

const mockGameAccess = {
	schoolId: 'school-1',
	enabledGameSlugs: ['memory-game', 'guess-game'],
	enabledCharacterSlugs: ['anita', 'iara'],
	hasCustomGames: false,
	hasCustomCharacters: false,
	canEdit: false,
	viewerRoles: ['student'],
};

describe('useMyGameAccess', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve buscar o acesso a jogos da escola do usuario autenticado', async () => {
		vi.mocked(schoolService.getMyGameAccess).mockResolvedValueOnce(
			mockGameAccess,
		);

		const { result } = renderHook(() => useMyGameAccess(), {
			wrapper: createWrapper(),
		});

		expect(result.current.isLoading).toBe(true);

		await waitFor(() => {
			expect(result.current.data).toBeDefined();
		});

		expect(schoolService.getMyGameAccess).toHaveBeenCalledTimes(1);
		expect(result.current.data).toEqual(mockGameAccess);
	});

	it('nao executa a query quando enabled for false', async () => {
		const { result } = renderHook(() => useMyGameAccess({ enabled: false }), {
			wrapper: createWrapper(),
		});

		expect(result.current.fetchStatus).toBe('idle');
		expect(schoolService.getMyGameAccess).not.toHaveBeenCalled();
	});
});
