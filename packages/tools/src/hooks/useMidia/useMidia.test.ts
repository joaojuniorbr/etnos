import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useMidia } from './useMidia';
import { createWrapper } from '../../test';
import { midiaService } from '../../services';

const mockId = 'user-123';

vi.mock('../../services', async () => ({
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
			items: [{ id: '1', url: 'img.png' }],
			nextCursor: null,
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
			undefined,
			undefined
		);

		expect(result.current.folders).toEqual(['Folder A', 'Folder B']);
	});

	it('busca próxima página quando fetchNextPage é chamado', async () => {
		const cursor = { id: 'cursor' };

		vi.mocked(midiaService.getMidia)
			.mockResolvedValueOnce({
				items: [{ id: '1' }],
				nextCursor: cursor,
			} as any)
			.mockResolvedValueOnce({
				items: [{ id: '2' }],
				nextCursor: null,
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
			undefined
		);
	});

	it('chama deleteMidia corretamente', () => {
		const item = { id: '1', url: 'img.png' } as any;

		const { result } = renderHook(() => useMidia(mockId), {
			wrapper: createWrapper(),
		});

		result.current.deleteMidia(item);

		expect(midiaService.deleteMidia).toHaveBeenCalledWith(item);
	});

	it('chama deleteMidiaFromUrl corretamente', () => {
		const { result } = renderHook(() => useMidia(mockId), {
			wrapper: createWrapper(),
		});

		result.current.deleteMidiaFromUrl('img.png');

		expect(midiaService.deleteMidiaFromUrl).toHaveBeenCalledWith('img.png');
	});
});
