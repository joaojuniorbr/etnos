import { act, renderHook, waitFor } from '@testing-library/react';
import { useCharacter } from './useCharacter';
import type { CharacterInterface } from '@etnos/types';
import { charactersService } from '../../services';
import { vi } from 'vitest';
import { createWrapper } from '../../test';

vi.mock('../../services', async () => ({
	charactersService: {
		getCharacters: vi.fn(),
		getCharacterBySlug: vi.fn(),
	},
}));

const createDeferred = <T>() => {
	let resolve!: (value: T) => void;
	let reject!: (reason?: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});

	return { promise, resolve, reject };
};

describe('useCharacter', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		const store = new Map<string, string>();
		const localStorageMock = {
			getItem: vi.fn((key: string) => store.get(key) ?? null),
			setItem: vi.fn((key: string, value: string) => {
				store.set(key, value);
			}),
			removeItem: vi.fn((key: string) => {
				store.delete(key);
			}),
			clear: vi.fn(() => {
				store.clear();
			}),
		};

		vi.stubGlobal('localStorage', localStorageMock);

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

		act(() => {
			result.current.selectCharacter('link');
		});

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

	it('sincroniza a seleção entre múltiplas instâncias do hook na mesma aba', async () => {
		const initialCharacter = {
			name: 'Anita',
			slug: 'anita',
		};
		const updatedCharacter = {
			name: 'Iara',
			slug: 'iara',
		};

		localStorage.setItem('selectedCharacter', 'anita');

		vi.mocked(charactersService.getCharacterBySlug).mockImplementation(
			async (slug: string) => {
				if (slug === 'anita') {
					return initialCharacter as CharacterInterface;
				}

				if (slug === 'iara') {
					return updatedCharacter as CharacterInterface;
				}

				return null as unknown as CharacterInterface;
			}
		);

		const firstHook = renderHook(() => useCharacter(), {
			wrapper: createWrapper(),
		});
		const secondHook = renderHook(() => useCharacter(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(firstHook.result.current.selectedCharacter).toEqual(initialCharacter);
			expect(secondHook.result.current.selectedCharacter).toEqual(initialCharacter);
		});

		act(() => {
			firstHook.result.current.selectCharacter('iara');
		});

		await waitFor(() => {
			expect(firstHook.result.current.selectedCharacter).toEqual(updatedCharacter);
			expect(secondHook.result.current.selectedCharacter).toEqual(updatedCharacter);
		});
	});

	it('sincroniza a limpeza da seleção entre múltiplas instâncias do hook', async () => {
		const mockCharacter = {
			name: 'Link',
			slug: 'link',
		};

		localStorage.setItem('selectedCharacter', 'link');

		vi.mocked(charactersService.getCharacterBySlug).mockImplementation(
			async (slug: string) => {
				if (slug === 'link') {
					return mockCharacter as CharacterInterface;
				}

				return null as unknown as CharacterInterface;
			}
		);

		const firstHook = renderHook(() => useCharacter(), {
			wrapper: createWrapper(),
		});
		const secondHook = renderHook(() => useCharacter(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(firstHook.result.current.selectedCharacter).toEqual(mockCharacter);
			expect(secondHook.result.current.selectedCharacter).toEqual(mockCharacter);
		});

		act(() => {
			firstHook.result.current.selectCharacter('');
		});

		await waitFor(() => {
			expect(firstHook.result.current.selectedCharacter).toBeUndefined();
			expect(secondHook.result.current.selectedCharacter).toBeUndefined();
		});
	});

	it('limpa o personagem selecionado quando recebe slug vazio', async () => {
		const mockCharacter = {
			name: 'Link',
			slug: 'link',
		};

		vi.mocked(charactersService.getCharacterBySlug).mockResolvedValue(
			mockCharacter as CharacterInterface
		);

		const { result } = renderHook(() => useCharacter(), {
			wrapper: createWrapper(),
		});

		act(() => {
			result.current.selectCharacter('link');
		});

		await waitFor(() => {
			expect(result.current.selectedCharacter).toEqual(mockCharacter);
		});

		act(() => {
			result.current.selectCharacter('');
		});

		expect(result.current.selectedCharacter).toBeUndefined();
	});

	it('sincroniza com storage apenas quando a chave do personagem for alterada', async () => {
		const mockCharacter = {
			name: 'Zeca',
			slug: 'zeca',
		};

		vi.mocked(charactersService.getCharacterBySlug).mockResolvedValue(
			mockCharacter as CharacterInterface
		);

		const { result } = renderHook(() => useCharacter(), {
			wrapper: createWrapper(),
		});

		act(() => {
			window.dispatchEvent(
				new StorageEvent('storage', {
					key: 'other-key',
					newValue: 'zeca',
				})
			);
		});

		expect(charactersService.getCharacterBySlug).not.toHaveBeenCalledWith('zeca');
		expect(result.current.selectedCharacter).toBeUndefined();

		act(() => {
			window.dispatchEvent(
				new StorageEvent('storage', {
					key: 'selectedCharacter',
					newValue: 'zeca',
				})
			);
		});

		await waitFor(() => {
			expect(result.current.selectedCharacter).toEqual(mockCharacter);
		});
	});

	it('não busca a lista quando fetchList for false', async () => {
		renderHook(() => useCharacter({ fetchList: false }), {
			wrapper: createWrapper(),
		});

		expect(charactersService.getCharacters).not.toHaveBeenCalled();
	});

	it('ignora a resposta de uma busca antiga quando uma mais nova termina depois', async () => {
		const slowRequest = createDeferred<CharacterInterface | null>();
		const fastRequest = createDeferred<CharacterInterface | null>();

		vi.mocked(charactersService.getCharacterBySlug).mockImplementation(
			(slug: string) => {
				if (slug === 'anita') {
					return slowRequest.promise as Promise<CharacterInterface>;
				}

				return fastRequest.promise as Promise<CharacterInterface>;
			}
		);

		const { result } = renderHook(() => useCharacter(), {
			wrapper: createWrapper(),
		});

		act(() => {
			result.current.selectCharacter('anita');
			result.current.selectCharacter('iara');
		});

		fastRequest.resolve({ slug: 'iara', name: 'Iara' } as CharacterInterface);

		await waitFor(() => {
			expect(result.current.selectedCharacter).toEqual({
				slug: 'iara',
				name: 'Iara',
			});
		});

		slowRequest.resolve({ slug: 'anita', name: 'Anita' } as CharacterInterface);

		await waitFor(() => {
			expect(result.current.selectedCharacter).toEqual({
				slug: 'iara',
				name: 'Iara',
			});
		});
	});

	it('ignora erro de uma busca antiga quando já existe uma seleção mais nova', async () => {
		const slowRequest = createDeferred<CharacterInterface | null>();
		const fastRequest = createDeferred<CharacterInterface | null>();
		void slowRequest.promise.catch(() => undefined);

		vi.mocked(charactersService.getCharacterBySlug).mockImplementation(
			(slug: string) => {
				if (slug === 'anita') {
					return slowRequest.promise as Promise<CharacterInterface>;
				}

				return fastRequest.promise as Promise<CharacterInterface>;
			}
		);

		const { result } = renderHook(() => useCharacter(), {
			wrapper: createWrapper(),
		});

		act(() => {
			result.current.selectCharacter('anita');
			result.current.selectCharacter('iara');
		});

		fastRequest.resolve({ slug: 'iara', name: 'Iara' } as CharacterInterface);

		await waitFor(() => {
			expect(result.current.selectedCharacter).toEqual({
				slug: 'iara',
				name: 'Iara',
			});
		});

		slowRequest.reject(new Error('stale request failed'));

		await waitFor(() => {
			expect(result.current.selectedCharacter).toEqual({
				slug: 'iara',
				name: 'Iara',
			});
		});
	});

	it('limpa a seleção quando a requisição atual falha', async () => {
		vi.mocked(charactersService.getCharacterBySlug)
			.mockResolvedValueOnce({ slug: 'anita', name: 'Anita' } as CharacterInterface)
			.mockRejectedValueOnce(new Error('current request failed'));

		const { result } = renderHook(() => useCharacter(), {
			wrapper: createWrapper(),
		});

		act(() => {
			result.current.selectCharacter('anita');
		});

		await waitFor(() => {
			expect(result.current.selectedCharacter).toEqual({
				slug: 'anita',
				name: 'Anita',
			});
		});

		act(() => {
			result.current.selectCharacter('iara');
		});

		await waitFor(() => {
			expect(result.current.selectedCharacter).toBeUndefined();
		});
	});
});
