import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FirestoreRepository } from './firestore.repository';
import { firestoreAdapter as fs } from '../helpers';

vi.mock('../helpers', () => ({
	firestoreAdapter: {
		collection: vi.fn(),
		doc: vi.fn(),
		getDocs: vi.fn(),
		query: vi.fn(),
		where: vi.fn(),
		orderBy: vi.fn(),
		setDoc: vi.fn(),
		updateDoc: vi.fn(),
		deleteDoc: vi.fn(),
		serverTimestamp: vi.fn(() => 'mock-timestamp'),
		limit: vi.fn(),
		startAfter: vi.fn(),
	},
}));

describe('FirestoreRepository', () => {
	const collectionName = 'test-collection';
	const repository = new FirestoreRepository<{ id: string; name: string }>(
		collectionName
	);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve buscar documentos sem filtros', async () => {
		const mockDocs = [
			{ id: '1', data: () => ({ name: 'Doc 1' }) },
			{ id: '2', data: () => ({ name: 'Doc 2' }) },
		];

		vi.mocked(fs.collection).mockReturnValue({ id: 'ref' } as any);
		vi.mocked(fs.getDocs).mockResolvedValue({ docs: mockDocs } as any);
		vi.mocked(fs.query).mockReturnValue({ type: 'query' } as any);

		const result = await repository.findMany();

		expect(fs.collection).toHaveBeenCalledWith(collectionName);
		expect(fs.query).toHaveBeenCalled();
		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({ id: '1', name: 'Doc 1' });
	});

	it('deve buscar multiplos documentos com filtros', async () => {
		const mockDocs = [
			{ id: '1', data: () => ({ name: 'Doc 1' }) },
			{ id: '2', data: () => ({ name: 'Doc 2' }) },
		];

		vi.mocked(fs.orderBy).mockReturnValue({ id: 'ref' } as any);
		vi.mocked(fs.collection).mockReturnValue({ id: 'ref' } as any);
		vi.mocked(fs.getDocs).mockResolvedValue({ docs: mockDocs } as any);
		vi.mocked(fs.query).mockReturnValue({ type: 'query' } as any);

		const result = await repository.findMany({
			limit: 10,
			where: [fs.where('name', '==', 'test')],
			startAfter: 'test' as any,
			orderBy: fs.orderBy('name'),
		});

		expect(fs.collection).toHaveBeenCalledWith(collectionName);
		expect(fs.limit).toHaveBeenCalledWith(10);
		expect(fs.query).toHaveBeenCalled();
		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({ id: '1', name: 'Doc 1' });
	});

	it('deve retornar apenas um documento no findOne', async () => {
		const mockDocs = [{ id: '1', data: () => ({ name: 'Doc 1' }) }];
		vi.mocked(fs.getDocs).mockResolvedValue({ docs: mockDocs } as any);

		const result = await repository.findOne({ where: [] });

		expect(fs.limit).toHaveBeenCalledWith(1);
		expect(result).toEqual({ id: '1', name: 'Doc 1' });
	});

	it('deve retornar null no findOne se estiver vazio', async () => {
		vi.mocked(fs.getDocs).mockResolvedValue({ docs: [] } as any);
		const result = await repository.findOne({ where: [] });
		expect(result).toBeNull();
	});

	it('deve criar um documento com timestamps', async () => {
		const mockRef = { id: 'new-id' };
		vi.mocked(fs.doc).mockReturnValue(mockRef as any);
		const data = { name: 'New Doc' };

		const result = await repository.create(data as any);

		expect(fs.setDoc).toHaveBeenCalledWith(mockRef, {
			...data,
			createdAt: 'mock-timestamp',
			timestamp: 'mock-timestamp',
		});
		expect(result).toBe(mockRef);
	});

	it('deve atualizar um documento pelo id', async () => {
		const mockRef = { id: 'id-123' };
		vi.mocked(fs.doc).mockReturnValue(mockRef as any);
		const updateData = { name: 'Updated' };

		await repository.update('id-123', updateData);

		expect(fs.doc).toHaveBeenCalledWith(expect.anything(), 'id-123');
		expect(fs.updateDoc).toHaveBeenCalledWith(mockRef, {
			...updateData,
			timestamp: 'mock-timestamp',
		});
	});

	it('deve deletar um documento', async () => {
		const mockRef = { id: 'id-123' };
		vi.mocked(fs.doc).mockReturnValue(mockRef as any);

		await repository.delete('id-123');

		expect(fs.deleteDoc).toHaveBeenCalledWith(mockRef);
	});

	it('deve buscar documentos com paginação (findWithPaginate)', async () => {
		const mockDocs = [
			{ id: '1', data: () => ({ name: 'Doc 1' }) },
			{ id: '2', data: () => ({ name: 'Doc 2' }) },
		];

		vi.mocked(fs.collection).mockReturnValue({ id: 'ref' } as any);
		vi.mocked(fs.getDocs).mockResolvedValue({ docs: mockDocs } as any);
		vi.mocked(fs.query).mockReturnValue({ type: 'query' } as any);

		const result = await repository.findWithPaginate({ limit: 2 });

		expect(fs.query).toHaveBeenCalled();
		expect(result.data).toHaveLength(2);
		expect(result.data[0]).toEqual({ id: '1', name: 'Doc 1' });

		expect(result.lastDoc).toEqual(mockDocs[1]);
	});

	it('deve retornar lastDoc como undefined se a lista estiver vazia no findWithPaginate', async () => {
		vi.mocked(fs.getDocs).mockResolvedValue({ docs: [] } as any);

		const result = await repository.findWithPaginate();

		expect(result.data).toHaveLength(0);
		expect(result.lastDoc).toBeUndefined();
	});

	it('deve aplicar todos os filtros opcionais no findWithPaginate', async () => {
		vi.mocked(fs.getDocs).mockResolvedValue({ docs: [] } as any);
		const mockCursor = { id: 'cursor' } as any;

		await repository.findWithPaginate({
			limit: 5,
			where: [fs.where('active', '==', true)],
			orderBy: fs.orderBy('createdAt'),
			startAfter: mockCursor,
		});

		expect(fs.limit).toHaveBeenCalledWith(5);
		expect(fs.where).toHaveBeenCalledWith('active', '==', true);
		expect(fs.orderBy).toHaveBeenCalledWith('createdAt');
		expect(fs.startAfter).toHaveBeenCalledWith(mockCursor);
		expect(fs.query).toHaveBeenCalled();
	});
});
