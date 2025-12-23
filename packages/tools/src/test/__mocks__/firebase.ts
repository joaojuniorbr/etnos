import { vi } from 'vitest';

export const firebaseMock = {
	collection: vi.fn(() => ({ id: 'mocked-collection' })),
	doc: vi.fn(() => ({ id: 'mocked-doc' })),
	query: vi.fn(),
	where: vi.fn((field, op, value) => ({ field, op, value })),
	orderBy: vi.fn((a, b) => ({ field: a, direction: b })),
	limit: vi.fn(),
	startAfter: vi.fn(),
	getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
	setDoc: vi.fn(() => Promise.resolve()),
	updateDoc: vi.fn(() => Promise.resolve()),
	deleteDoc: vi.fn(() => Promise.resolve()),
	serverTimestamp: vi.fn(() => 'mocked-timestamp'),
	getFirestore: vi.fn(),
};

export const mockRepo = {
	findMany: vi.fn(),
	findOne: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
	findWithPaginate: vi.fn(),
};
