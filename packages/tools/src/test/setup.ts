import '@testing-library/jest-dom';
import { vi } from 'vitest';

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
	};
});

vi.mock('firebase/firestore', () => {
	return {
		getFirestore: vi.fn(() => ({ firestore: 'mocked-firestore' })),
		setDoc: vi.fn(() => Promise.resolve()),
		doc: vi.fn(() => ({ id: 'mocked-doc' })),
		getDoc: vi.fn(() =>
			Promise.resolve({
				exists: () => true,
				data: () => ({ parentName: 'Mocked Parent' }),
			})
		),
		deleteDoc: vi.fn(() => Promise.resolve()),
		getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
		updateDoc: vi.fn(() => Promise.resolve()),
		serverTimestamp: vi.fn(() => 'mocked-timestamp'),
		collection: vi.fn(() => ({ id: 'mocked-collection' })),
	};
});
