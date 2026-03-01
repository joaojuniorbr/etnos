import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createWrapper } from '../../test/common';
import { useAuth } from './useAuth';
import * as authMethods from 'firebase/auth';
import { message } from 'antd';

const { mockApiGet, mockApiPost, mockErrorMessage } = vi.hoisted(() => ({
	mockApiGet: vi.fn(),
	mockApiPost: vi.fn(),
	mockErrorMessage: vi.fn((error: unknown, fallback?: string) => {
		if (fallback) return fallback;
		if (error instanceof Error) return error.message;
		return 'Erro inesperado';
	}),
}));

const storageState: Record<string, string> = {};

vi.stubGlobal('localStorage', {
	getItem: vi.fn((key: string) => storageState[key] ?? null),
	setItem: vi.fn((key: string, value: string) => {
		storageState[key] = value;
	}),
	removeItem: vi.fn((key: string) => {
		delete storageState[key];
	}),
	clear: vi.fn(() => {
		Object.keys(storageState).forEach((key) => delete storageState[key]);
	}),
});

vi.mock('@etnos/tools', () => ({
	authFirebase: { id: 'auth-mock' },
	googleProvider: { id: 'google-provider-mock' },
	api: {
		get: mockApiGet,
		post: mockApiPost,
	},
	errorMessage: mockErrorMessage,
}));

vi.mock('firebase/auth', async () => {
	const actual = await vi.importActual('firebase/auth');
	return {
		...actual,
		signOut: vi.fn(),
		sendPasswordResetEmail: vi.fn(),
		createUserWithEmailAndPassword: vi.fn(),
		signInWithPopup: vi.fn(),
	};
});

vi.mock('antd', () => ({
	message: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

const renderUseAuth = () =>
	renderHook(() => useAuth(), { wrapper: createWrapper() });
const randomPassword = () =>
	`pw-${Math.random().toString(36).slice(2, 12)}-Aa1!`;

describe('useAuth', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
		mockApiGet.mockResolvedValue({ data: null });
	});

	it('carrega perfil via API ao montar', async () => {
		mockApiGet.mockResolvedValueOnce({
			data: { uid: '123', email: 'test@test.com', parentName: 'Joao' },
		});

		const { result } = renderUseAuth();

		await waitFor(() => expect(result.current.isProfileLoading).toBe(false));

		expect(mockApiGet).toHaveBeenCalledWith('/auth/profile');
		expect(result.current.user?.parentName).toBe('Joao');
		expect(result.current.isLoggedIn).toBe(true);
	});

	it('retorna user null quando falha ao carregar perfil', async () => {
		const error = new Error('profile failed');
		mockApiGet.mockRejectedValueOnce(error);

		const { result } = renderUseAuth();

		await waitFor(() => expect(result.current.isProfileLoading).toBe(false));

		expect(result.current.user).toBeNull();
		expect(mockErrorMessage).toHaveBeenCalledWith(error);
	});

	it('faz login com email/senha e salva token', async () => {
		const password = randomPassword();
		const apiUser = { uid: '123', email: 'test@test.com' };
		mockApiPost.mockResolvedValueOnce({
			data: { idToken: 'token-123', user: apiUser },
		});

		const { result } = renderUseAuth();

		let user: unknown;
		await act(async () => {
			user = await result.current.onSignInWithEmailAndPassword(
				'test@test.com',
				password
			);
		});

		expect(mockApiPost).toHaveBeenCalledWith('/auth/login', {
			email: 'test@test.com',
			password,
		});
		expect(localStorage.getItem('etnos_auth_token')).toBe('token-123');
		expect(user).toEqual(apiUser);
		expect(result.current.isLoading).toBe(false);
	});

	it('trata erro no login com email/senha', async () => {
		const error = new Error('invalid');
		const password = randomPassword();
		mockApiPost.mockRejectedValueOnce(error);

		const { result } = renderUseAuth();

		let user: unknown;
		await act(async () => {
			user = await result.current.onSignInWithEmailAndPassword(
				'err@test.com',
				password
			);
		});

		expect(user).toBeNull();
		expect(result.current.isLoading).toBe(false);
	});

	it('faz login com Google e salva token', async () => {
		const googleUser = {
			uid: 'google-id',
			email: 'google@test.com',
			getIdTokenResult: vi.fn().mockResolvedValue({ token: 'google-token' }),
		};
		vi.mocked(authMethods.signInWithPopup).mockResolvedValueOnce({
			user: googleUser,
		} as any);

		const { result } = renderUseAuth();

		let response: unknown;
		await act(async () => {
			response = await result.current.loginWithGoogle();
		});

		expect(authMethods.signInWithPopup).toHaveBeenCalledWith(
			{ id: 'auth-mock' },
			{ id: 'google-provider-mock' }
		);
		expect(localStorage.getItem('etnos_auth_token')).toBe('google-token');
		expect(response).toEqual(googleUser);
	});

	it('trata erro no login com Google', async () => {
		const error = new Error('google fail');
		vi.mocked(authMethods.signInWithPopup).mockRejectedValueOnce(error);
		mockErrorMessage.mockReturnValueOnce('Google Error');

		const { result } = renderUseAuth();

		let user: unknown;
		await act(async () => {
			user = await result.current.loginWithGoogle();
		});

		expect(user).toBeNull();
		expect(message.error).toHaveBeenCalledWith('Google Error');
	});

	it('desloga com sucesso', async () => {
		localStorage.setItem('etnos_auth_token', 'abc');
		vi.mocked(authMethods.signOut).mockResolvedValueOnce(undefined);

		const { result } = renderUseAuth();

		await act(async () => {
			await result.current.onSignOut();
		});

		expect(authMethods.signOut).toHaveBeenCalledWith({ id: 'auth-mock' });
		expect(localStorage.getItem('etnos_auth_token')).toBeNull();
		expect(message.success).toHaveBeenCalledWith('Desconectado com sucesso!');
		expect(result.current.isLoading).toBe(false);
	});

	it('trata erro no onSignOut', async () => {
		const error = new Error('signout fail');
		vi.mocked(authMethods.signOut).mockRejectedValueOnce(error);
		mockErrorMessage.mockReturnValueOnce('Signout Error');

		const { result } = renderUseAuth();

		await act(async () => {
			await result.current.onSignOut();
		});

		expect(message.error).toHaveBeenCalledWith('Signout Error');
		expect(result.current.isLoading).toBe(false);
	});

	it('envia email de recuperação com sucesso', async () => {
		vi.mocked(authMethods.sendPasswordResetEmail).mockResolvedValueOnce(
			undefined
		);
		const { result } = renderUseAuth();

		await act(async () => {
			await result.current.onRecoveryPass('test@test.com');
		});

		expect(authMethods.sendPasswordResetEmail).toHaveBeenCalledWith(
			{ id: 'auth-mock' },
			'test@test.com'
		);
		expect(message.success).toHaveBeenCalledWith(
			'E-mail de recuperação enviado!'
		);
		expect(result.current.isLoading).toBe(false);
	});

	it('trata erro no onRecoveryPass', async () => {
		const error = new Error('reset fail');
		vi.mocked(authMethods.sendPasswordResetEmail).mockRejectedValueOnce(error);
		mockErrorMessage.mockReturnValueOnce('Reset Error');
		const { result } = renderUseAuth();

		await act(async () => {
			await result.current.onRecoveryPass('test@test.com');
		});

		expect(message.error).toHaveBeenCalledWith('Reset Error');
		expect(result.current.isLoading).toBe(false);
	});

	it('atualiza perfil e converte undefined para null', async () => {
		mockApiPost.mockResolvedValueOnce({ data: { ok: true } });
		mockApiGet.mockResolvedValueOnce({
			data: { uid: '123', childName: 'Old' },
		});
		const { result } = renderUseAuth();

		await waitFor(() => expect(result.current.isProfileLoading).toBe(false));

		await act(async () => {
			await result.current.updateUserProfile({
				childName: undefined,
				parentName: 'Joao Silva',
			});
		});

		expect(mockApiPost).toHaveBeenCalledWith('/auth/profile', {
			childName: null,
			parentName: 'Joao Silva',
		});
		expect(message.success).toHaveBeenCalledWith('Perfil atualizado!');
		expect(mockApiGet).toHaveBeenCalledTimes(2);
	});

	it('trata erro no updateUserProfile', async () => {
		const error = new Error('profile update fail');
		mockApiPost.mockRejectedValueOnce(error);
		mockErrorMessage.mockReturnValueOnce('Erro ao salvar perfil.');
		const { result } = renderUseAuth();

		await act(async () => {
			await result.current.updateUserProfile({ parentName: 'Novo nome' });
		});

		expect(mockApiPost).toHaveBeenCalledWith('/auth/profile', {
			parentName: 'Novo nome',
		});
		expect(mockErrorMessage).toHaveBeenCalledWith(
			error,
			'Erro ao salvar perfil.'
		);
		expect(message.error).toHaveBeenCalledWith('Erro ao salvar perfil.');
	});

	it('registra novo usuário com sucesso', async () => {
		const password = randomPassword();
		const createdUser = { uid: 'new-user' };
		vi.mocked(authMethods.createUserWithEmailAndPassword).mockResolvedValueOnce(
			{
				user: createdUser,
			} as any
		);

		const { result } = renderUseAuth();

		let user: unknown;
		await act(async () => {
			user = await result.current.onRegister({
				parentEmail: 'new@test.com',
				password,
				parentName: 'Pai',
				parentPhone: '99999',
				childName: 'Filho',
				childBirthDate: '2020-01-01',
				school: 'Escola',
			});
		});

		expect(authMethods.createUserWithEmailAndPassword).toHaveBeenCalledWith(
			{ id: 'auth-mock' },
			'new@test.com',
			password
		);
		expect(user).toEqual(createdUser);
		expect(result.current.isLoading).toBe(false);
	});

	it('trata erro no onRegister', async () => {
		const password = randomPassword();
		const error = new Error('register fail');
		vi.mocked(authMethods.createUserWithEmailAndPassword).mockRejectedValueOnce(
			error
		);
		mockErrorMessage.mockReturnValueOnce('Register Error');

		const { result } = renderUseAuth();

		let user: unknown;
		await act(async () => {
			user = await result.current.onRegister({
				parentEmail: 'new@test.com',
				password,
			});
		});

		expect(user).toBeNull();
		expect(message.error).toHaveBeenCalledWith('Register Error');
		expect(result.current.isLoading).toBe(false);
	});
});
