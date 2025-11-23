import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCharacter } from './';
import { getAllCharacters, getCharacterBySlug } from '../../characters';

vi.mock('../../characters', () => ({
	getAllCharacters: vi.fn(() => [
		{ slug: 'iara', name: 'Iara' },
		{ slug: 'saci', name: 'Saci' },
	]),
	getCharacterBySlug: vi.fn((slug: string) => ({
		slug,
		name: `Mocked ${slug}`,
	})),
}));

const CHARACTER_STORAGE_KEY = 'selectedCharacter';

describe('useCharacter hook', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
	});

	it('deve retornar todos os personagens', () => {
		const { result } = renderHook(() => useCharacter());
		expect(getAllCharacters).toHaveBeenCalled();
		expect(result.current.characters).toEqual([
			{ slug: 'iara', name: 'Iara' },
			{ slug: 'saci', name: 'Saci' },
		]);
	});

	it('deve selecionar um personagem e salvar no localStorage', async () => {
		const { result } = renderHook(() => useCharacter());

		await act(async () => {
			result.current.selectCharacter('iara');
		});

		expect(localStorage.getItem(CHARACTER_STORAGE_KEY)).toBe('iara');
		expect(getCharacterBySlug).toHaveBeenCalledWith('iara');
		expect(result.current.selectedCharacter).toEqual({
			slug: 'iara',
			name: 'Mocked iara',
		});
	});

	it('deve inicializar selectedCharacter a partir do localStorage', async () => {
		localStorage.setItem(CHARACTER_STORAGE_KEY, 'saci');

		const { result } = renderHook(() => useCharacter());

		await waitFor(() => {
			expect(getCharacterBySlug).toHaveBeenCalledWith('saci');
			expect(result.current.selectedCharacter).toEqual({
				slug: 'saci',
				name: 'Mocked saci',
			});
		});
	});

	it('não deve setar selectedCharacter se localStorage estiver vazio', () => {
		const { result } = renderHook(() => useCharacter());
		expect(result.current.selectedCharacter).toBeUndefined();
	});
});
