import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useMidia } from './useMidia';
import { createWrapper } from '../../test';
import { midiaService } from '@etnos/services';

const mockId = 'user-123';

vi.mock('@etnos/services', async () => ({
	midiaService: {
		getMidia: vi.fn(),
		getFolders: vi.fn(),
		deleteMidia: vi.fn(),
		deleteMidiaFromUrl: vi.fn(),
	},
}));

describe('useMidia', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('carrega midias e folders quando userId existe', async () => {
		vi.mocked(midiaService.getMidia).mockResolvedValueOnce({
			data: [{ id: '1', url: 'img.png' }],
			nextCursor: undefined,
		} as any);

		vi.mocked(midiaService.getFolders).mockResolvedValueOnce([
			'Folder A',
			'Folder B',
		] as any);

		const { result } = renderHook(() => useMidia(mockId), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(result.current.data).toBeDefined();
		});

		expect(midiaService.getMidia).toHaveBeenCalledWith(
			mockId,
			10,
			1,
			undefined,
			false,
		);

		expect(result.current.folders).toEqual(['Folder A', 'Folder B']);
	});

	it('busca próxima página quando fetchNextPage é chamado', async () => {
		const cursor = 2;

		vi.mocked(midiaService.getMidia)
			.mockResolvedValueOnce({
				data: [{ id: '1' }],
				nextCursor: cursor,
			} as any)
			.mockResolvedValueOnce({
				data: [{ id: '2' }],
				nextCursor: undefined,
			} as any);

		vi.mocked(midiaService.getFolders).mockResolvedValue([]);

		const { result } = renderHook(() => useMidia(mockId), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(result.current.hasNextPage).toBe(true);
		});

		await result.current.fetchNextPage();

		expect(midiaService.getMidia).toHaveBeenLastCalledWith(
			mockId,
			10,
			cursor,
			undefined,
			false,
		);
	});

	it('chama deleteMidia corretamente', () => {
		const item = { id: '1', url: 'img.png' } as any;

		const { result } = renderHook(() => useMidia(mockId), {
			wrapper: createWrapper(),
		});

		result.current.deleteMidia(item);

		expect(midiaService.deleteMidia).toHaveBeenCalledWith(item, false);
	});

	it('chama deleteMidiaFromUrl corretamente', () => {
		const { result } = renderHook(() => useMidia(mockId), {
			wrapper: createWrapper(),
		});

		result.current.deleteMidiaFromUrl('img.png');

		expect(midiaService.deleteMidiaFromUrl).toHaveBeenCalledWith(
			'img.png',
			false,
		);
	});

	it('usa endpoints administrativos quando showAll estiver ativo', async () => {
		vi.mocked(midiaService.getMidia).mockResolvedValueOnce({
			data: [{ id: '1', url: 'img.png' }],
			nextCursor: undefined,
		} as any);

		vi.mocked(midiaService.getFolders).mockResolvedValueOnce([
			{ folder: 'library', count: 2 },
		] as any);

		const { result } = renderHook(() => useMidia(mockId, 12, 'library', true), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(result.current.data).toBeDefined();
		});

		expect(midiaService.getMidia).toHaveBeenCalledWith(
			mockId,
			12,
			1,
			'library',
			true,
		);
		expect(midiaService.getFolders).toHaveBeenCalledWith(mockId, true);
	});

	it('encaminha remoções para o modo administrativo quando showAll estiver ativo', () => {
		const item = { id: '1', url: 'img.png' } as any;

		const { result } = renderHook(() => useMidia(mockId, 10, undefined, true), {
			wrapper: createWrapper(),
		});

		result.current.deleteMidia(item);
		result.current.deleteMidiaFromUrl('img.png');

		expect(midiaService.deleteMidia).toHaveBeenCalledWith(item, true);
		expect(midiaService.deleteMidiaFromUrl).toHaveBeenCalledWith(
			'img.png',
			true,
		);
	});
});
