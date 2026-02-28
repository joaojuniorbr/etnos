import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { firebaseMock, mockRepo } from './__mocks__';

vi.mock('antd', () => {
	return {
		message: {
			success: vi.fn(),
			error: vi.fn(),
		},
	};
});

vi.mock('firebase/app', () => {
	return {
		initializeApp: vi.fn(() => ({ app: 'mocked-app' })),
	};
});

vi.mock('@etnos/tools', () => ({
	authFirebase: vi.fn(),
	googleProvider: vi.fn(),
	errorMessage: vi.fn(),
	storageFirebase: vi.fn(),
	firestoreAdapter: {
		...firebaseMock,
		query: vi.fn(),
		where: vi.fn((field, op, value) => ({ field, op, value })),
		orderBy: vi.fn((a, b) => ({ a, b })),
	},
	FirestoreRepository: class {
		findMany = mockRepo.findMany;
		findOne = mockRepo.findOne;
		create = mockRepo.create;
		update = mockRepo.update;
		delete = mockRepo.delete;
		findWithPaginate = mockRepo.findWithPaginate;
	},
	getRandomIndex: vi.fn(),
}));

vi.mock('../helpers', () => ({
	firestoreAdapter: {
		...firebaseMock,
		query: vi.fn(),
		where: vi.fn((field, op, value) => ({ field, op, value })),
		orderBy: vi.fn((a, b) => ({ a, b })),
	},
	errorMessage: vi.fn(),
	storageFirebase: {},
}));

vi.mock('../firestore', () => ({
	FirestoreRepository: class {
		findMany = mockRepo.findMany;
		findOne = mockRepo.findOne;
		create = mockRepo.create;
		update = mockRepo.update;
		delete = mockRepo.delete;
		findWithPaginate = mockRepo.findWithPaginate;
	},
}));

vi.mock('firebase/firestore', () => {
	return {
		...firebaseMock,
		getFirestore: vi.fn(() => ({ firestore: 'mocked-firestore' })),
		getDoc: vi.fn(() =>
			Promise.resolve({
				exists: () => true,
				data: () => ({ parentName: 'Mocked Parent' }),
			})
		),
	};
});

class MockGoogleAuthProvider {
	addScope;
	setCustomParameters;
	provider;
	constructor() {
		this.addScope = vi.fn();
		this.setCustomParameters = vi.fn();
		this.provider = vi.fn();
	}
}

vi.mock('firebase/auth', () => {
	return {
		getAuth: vi.fn(() => ({ auth: 'mocked-auth' })),
		signOut: vi.fn(() => Promise.resolve()),
		signInWithEmailAndPassword: vi.fn(() =>
			Promise.resolve({ user: { uid: '123', email: 'test@test.com' } })
		),
		sendPasswordResetEmail: vi.fn(() => Promise.resolve()),
		onAuthStateChanged: vi.fn((_auth, callback) => {
			callback({ uid: '123', email: 'test@test.com' });
			return () => {};
		}),
		createUserWithEmailAndPassword: vi.fn(() =>
			Promise.resolve({ user: { uid: '456', email: 'new@test.com' } })
		),
		GoogleAuthProvider: MockGoogleAuthProvider,
		signInWithPopup: vi.fn(() =>
			Promise.resolve({ user: { uid: '123', email: 'test@test.com' } })
		),
	};
});

vi.mock('firebase/storage', () => {
	return {
		getStorage: vi.fn(() => ({})),
		ref: vi.fn(),
		uploadBytes: vi.fn(() => Promise.resolve({})),
		getDownloadURL: vi.fn(() =>
			Promise.resolve('http://mockurl.com/image.png')
		),
		deleteObject: vi.fn(() => Promise.resolve({})),
	};
});
