import { renderHook, waitFor } from '@testing-library/react';
import { useCharacter } from './useCharacter';
import { CharacterInterface, charactersService } from '../../services';
import { vi } from 'vitest';
import { createWrapper } from '../../test';

vi.mock('../../services', async () => ({
	charactersService: {
		getCharacters: vi.fn(),
		getCharacterBySlug: vi.fn(),
	},
}));

describe('useCharacter', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();

		vi.mocked(charactersService.getCharacters).mockResolvedValue([]);
	});

	it('inicia com selectedCharacter undefined e carrega characters', async () => {
		vi.mocked(charactersService.getCharacters).mockResolvedValueOnce([
			{ id: 1, name: 'Zeca' },
			{ id: 2, name: 'Iara' },
		] as unknown as CharacterInterface[]);

		const { result } = renderHook(() => useCharacter(), {
			wrapper: createWrapper(),
		});

		expect(result.current.selectedCharacter).toBeUndefined();
		expect(result.current.isLoading).toBe(true);

		await waitFor(() => {
			expect(result.current.data).toBeDefined();
		});

		expect(charactersService.getCharacters).toHaveBeenCalledTimes(1);
		expect(result.current.data).toHaveLength(2);
	});

	it('seleciona personagem, salva no localStorage e atualiza estado', async () => {
		const mockCharacter = {
			name: 'Link',
			slug: 'link',
		};

		vi.mocked(charactersService.getCharacterBySlug).mockResolvedValue(
			mockCharacter as unknown as CharacterInterface
		);

		const { result } = renderHook(() => useCharacter(), {
			wrapper: createWrapper(),
		});

		result.current.selectCharacter('link');

		await waitFor(() => {
			expect(result.current.selectedCharacter).toEqual(mockCharacter);
		});

		expect(localStorage.getItem('selectedCharacter')).toBe('link');
		expect(charactersService.getCharacterBySlug).toHaveBeenCalledWith('link');
	});

	it('carrega personagem salvo no localStorage ao montar', async () => {
		const mockCharacter = {
			name: 'Zelda',
			slug: 'zelda',
		};

		localStorage.setItem('selectedCharacter', 'zelda');

		vi.mocked(charactersService.getCharacterBySlug).mockResolvedValue(
			mockCharacter as any
		);

		const { result } = renderHook(() => useCharacter(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(result.current.selectedCharacter).toEqual(mockCharacter);
		});

		expect(charactersService.getCharacterBySlug).toHaveBeenCalledWith('zelda');
	});

	it('não atualiza selectedCharacter ao montar se personagem salvo não existir', async () => {
		localStorage.setItem('selectedCharacter', 'unknown');

		vi.mocked(charactersService.getCharacterBySlug).mockResolvedValueOnce(
			null as unknown as CharacterInterface
		);

		const { result } = renderHook(() => useCharacter(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(charactersService.getCharacterBySlug).toHaveBeenCalledWith(
				'unknown'
			);
		});

		expect(result.current.selectedCharacter).toBeUndefined();
	});
});
