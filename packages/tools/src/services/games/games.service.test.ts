import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gamesService, ScoreInterface } from '..';
import { getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';

describe('gamesService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve salvar um novo score quando não existe ainda', async () => {
		(getDocs as any).mockResolvedValue({ docs: [] });
		const mockDocRef = { id: 'new-doc' };
		(doc as any).mockReturnValue(mockDocRef);

		await gamesService.saveScore('game1', 'iara', 100, 'user123');

		expect(setDoc).toHaveBeenCalledWith(mockDocRef, {
			slug: 'game1',
			characterSlug: 'iara',
			score: 100,
			userId: 'user123',
			timestamp: 'mocked-timestamp',
			createdAt: 'mocked-timestamp',
		});
	});

	it('deve retornar scores de um usuário', async () => {
		const docs = [
			{ data: () => ({ userId: 'user123', slug: 'game1', score: 50 }) },
			{ data: () => ({ userId: 'user456', slug: 'game2', score: 80 }) },
		];
		(getDocs as any).mockResolvedValue({ docs });

		const result = await gamesService.getScore('user123');

		expect(result).toEqual([{ userId: 'user123', slug: 'game1', score: 50 }]);
	});

	it('deve retornar score específico de um jogo/personagem/usuário', async () => {
		const docs = [
			{
				data: () =>
					({
						slug: 'game1',
						characterSlug: 'iara',
						userId: 'user123',
						score: 100,
					}) as ScoreInterface,
			},
		];
		(getDocs as any).mockResolvedValue({ docs });

		const result = await gamesService.getFromGameScore(
			'game1',
			'iara',
			'user123'
		);

		expect(result).toEqual({
			slug: 'game1',
			characterSlug: 'iara',
			userId: 'user123',
			score: 100,
		});
	});

	it('deve retornar null específico de um jogo/personagem/usuário', async () => {
		const docs = [
			{
				data: () =>
					({
						slug: 'game1',
						characterSlug: 'iara',
						userId: 'user123',
						score: 100,
					}) as ScoreInterface,
			},
		];
		(getDocs as any).mockResolvedValue({ docs });

		const result = await gamesService.getFromGameScore('game1', 'iara', '');

		expect(result).toEqual(null);
	});

	it('deve atualizar score usando scoreDoc.ref quando existe', async () => {
		const existingDoc = {
			data: () => ({
				slug: 'game1',
				characterSlug: 'iara',
				userId: 'user123',
			}),
			ref: { id: 'existing-doc' },
		};

		(getDocs as any).mockResolvedValue({ docs: [existingDoc] });
		const mockDocRef = { id: 'new-doc' };
		(doc as any).mockReturnValue(mockDocRef);

		await gamesService.saveScore('game1', 'iara', 200, 'user123');

		expect(updateDoc).toHaveBeenCalledWith(existingDoc.ref, {
			score: 200,
			timestamp: 'mocked-timestamp',
		});
	});

	it('deve atualizar score usando docRef quando scoreDoc.ref não existe', async () => {
		const existingDoc = {
			data: () => ({
				slug: 'game1',
				characterSlug: 'iara',
				userId: 'user123',
			}),
		};

		(getDocs as any).mockResolvedValue({ docs: [existingDoc] });
		const mockDocRef = { id: 'new-doc' };
		(doc as any).mockReturnValue(mockDocRef);

		await gamesService.saveScore('game1', 'iara', 300, 'user123');

		expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
			score: 300,
			timestamp: 'mocked-timestamp',
		});
	});
});
