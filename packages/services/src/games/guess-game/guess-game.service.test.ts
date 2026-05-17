import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock } = vi.hoisted(() => ({
	apiMock: {
		get: vi.fn(),
		post: vi.fn(),
		delete: vi.fn(),
	},
}));

vi.mock('../../api', () => ({
	api: apiMock,
}));

import { guessGameContentService } from './guess-game.service';

describe('guessGameContentService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve salvar conteúdo do guess game', async () => {
		apiMock.post.mockResolvedValueOnce({ data: { ok: true } });

		const payload = {
			title: 'Chimarrao',
			word: 'Bomba',
			tips: ['Dica 1'],
			imageUrl: null,
			description: 'Descricao',
			characterSlug: 'anita',
		};

		await guessGameContentService.saveContent(payload);

		expect(apiMock.post).toHaveBeenCalledWith('/games/guess', payload);
	});

	it('deve buscar conteúdo do guess game por personagem', async () => {
		apiMock.get.mockResolvedValueOnce({ data: [{ id: '1' }] });

		const result = await guessGameContentService.getContent('anita');

		expect(apiMock.get).toHaveBeenCalledWith('/games/guess/anita');
		expect(result).toEqual([{ id: '1' }]);
	});

	it('deve buscar conteúdo jogável do guess game', async () => {
		apiMock.get.mockResolvedValueOnce({ data: { id: '1' } });

		const result = await guessGameContentService.getPlayableContent('anita');

		expect(apiMock.get).toHaveBeenCalledWith('/games/guess/play/anita');
		expect(result).toEqual({ id: '1' });
	});

	it('deve validar tentativa do guess game', async () => {
		apiMock.post.mockResolvedValueOnce({ data: { isCorrect: true } });

		const payload = {
			contentId: 'guess-1',
			guess: 'B',
			type: 'letter' as const,
		};

		const result = await guessGameContentService.validateAttempt(payload);

		expect(apiMock.post).toHaveBeenCalledWith('/games/guess/validate', payload);
		expect(result).toEqual({ isCorrect: true });
	});

	it('deve remover conteúdo do guess game', async () => {
		apiMock.delete.mockResolvedValueOnce({ data: true });

		await guessGameContentService.deleteContent('1');

		expect(apiMock.delete).toHaveBeenCalledWith('/games/guess/1');
	});
});
