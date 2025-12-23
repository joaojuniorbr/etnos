import { describe, it, expect, vi, beforeEach } from 'vitest';
import { firestoreAdapter } from './firestoreAdapter';

vi.mock('firebase/firestore', async () => {
	const actual = await import('firebase/firestore');

	return {
		...actual,
		getFirestore: vi.fn(() => ({ firestore: 'mocked-firestore' })),
		collection: vi.fn(() => ({ id: 'mocked-collection' })),
		doc: vi.fn(() => ({ id: 'mocked-doc' })),
	};
});

vi.mock('../../hooks', () => ({
	dbFirebase: 'mocked-dbFirebase',
}));

import * as firestore from 'firebase/firestore';

describe('firestoreAdapter', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve chamar a função collection com o dbFirebase e o nome correto', () => {
		const collectionName = 'users';
		firestoreAdapter.collection(collectionName);

		expect(firestore.collection).toHaveBeenCalledWith(
			expect.anything(),
			collectionName
		);
	});

	it('deve chamar a função doc com id quando fornecido', () => {
		const mockColRef = { id: 'col-1' };
		const docId = 'user-123';

		firestoreAdapter.doc(mockColRef, docId);

		expect(firestore.doc).toHaveBeenCalledWith(mockColRef, docId);
	});

	it('deve chamar a função doc sem id quando não fornecido', () => {
		const mockColRef = { id: 'col-1' };

		firestoreAdapter.doc(mockColRef);

		expect(firestore.doc).toHaveBeenCalledWith(mockColRef);
	});
});
