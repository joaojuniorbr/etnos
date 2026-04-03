export const getAuth = () => ({
	currentUser: {
		uid: 'mock-uid',
		email: 'mock@example.com',
		displayName: 'Usuário Mock',
	},
});

export const signOut = async () => true;

export const signInWithEmailAndPassword = async (
	_auth: any,
	email: string,
	password: string,
) => ({
	user: { uid: 'mock-uid', email, password },
});

export const sendPasswordResetEmail = async (_auth: any, email: string) => ({
	success: true,
	email,
});

export const onAuthStateChanged = (
	_auth: any,
	callback: (user: any) => void,
) => {
	callback({
		uid: 'mock-uid',
		email: 'mock@example.com',
		displayName: 'Usuário Mock',
		childName: 'Usuário Mock',
	});
	return () => {};
};

export const createUserWithEmailAndPassword = async (
	_auth: any,
	email: string,
	password: string,
) => ({
	user: { uid: 'new-mock-uid', email, password },
});

export const signInWithPopup = async (_auth: any, _provider: any) => ({
	user: {
		uid: 'mock-uid',
		email: 'mock@example.com',
		displayName: 'Usuário Mock',
	},
});

export class GoogleAuthProvider {}
