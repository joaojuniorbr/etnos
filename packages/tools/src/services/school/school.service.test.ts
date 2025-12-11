import { describe, it, expect, vi, beforeEach } from 'vitest';
import { schoolService, SchoolInterface } from '..';
import { getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

describe('schoolService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve retornar todas as escolas', async () => {
		const docs = [
			{ id: '1', data: () => ({ name: 'Escola A', city: 'Curitiba' }) },
			{ id: '2', data: () => ({ name: 'Escola B', state: 'PR' }) },
		];
		(getDocs as any).mockResolvedValue({ docs });

		const result = await schoolService.getAll();

		expect(result).toEqual([
			{ id: '1', name: 'Escola A', city: 'Curitiba' },
			{ id: '2', name: 'Escola B', state: 'PR' },
		]);
	});

	it('deve criar uma nova escola', async () => {
		const mockDocRef = { id: 'new-doc' };
		(doc as any).mockReturnValue(mockDocRef);
		(setDoc as any).mockResolvedValue('mocked-setDoc');

		const school: SchoolInterface = { id: '1', name: 'Nova Escola' };
		const result = await schoolService.create(school);

		expect(setDoc).toHaveBeenCalledWith(mockDocRef, school);
		expect(result).toBe('mocked-setDoc');
	});

	it('deve atualizar uma escola existente', async () => {
		const mockDocRef = { id: '1' };
		(doc as any).mockReturnValue(mockDocRef);
		(getDoc as any).mockResolvedValue({
			data: () => ({ id: '1', name: 'Escola Antiga', city: 'Curitiba' }),
		});
		(setDoc as any).mockResolvedValue('mocked-update');

		const result = await schoolService.update('1', {
			name: 'Escola Atualizada',
		});

		expect(setDoc).toHaveBeenCalledWith(mockDocRef, {
			id: '1',
			name: 'Escola Atualizada',
			city: 'Curitiba',
		});
		expect(result).toBe('mocked-update');
	});

	it('deve deletar uma escola', async () => {
		const mockDocRef = { id: '1' };
		(doc as any).mockReturnValue(mockDocRef);
		(deleteDoc as any).mockResolvedValue('mocked-delete');

		const result = await schoolService.delete('1');

		expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
		expect(result).toBe('mocked-delete');
	});

	it('deve retornar uma escola específica', async () => {
		const mockDocRef = { id: '1' };
		(doc as any).mockReturnValue(mockDocRef);
		(getDoc as any).mockResolvedValue({
			data: () => ({ id: '1', name: 'Escola Única', state: 'PR' }),
		});

		const result = await schoolService.getOne('1');

		expect(getDoc).toHaveBeenCalledWith(mockDocRef);
		expect(result).toEqual({ id: '1', name: 'Escola Única', state: 'PR' });
	});
});
