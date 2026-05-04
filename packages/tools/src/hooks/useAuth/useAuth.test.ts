import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createWrapper } from '../../test/common';
import { getStoredAuthToken, useAuth } from './useAuth';
import { message } from 'antd';
import {
	AUTH_EXPIRES_AT_STORAGE_KEY,
	AUTH_REFRESH_TOKEN_STORAGE_KEY,
} from '../../helpers/authSession';

const { mockApiGet, mockApiPost, mockErrorMessage } = vi.hoisted(() => ({
	mockApiGet: vi.fn(),
	mockApiPost: vi.fn(),
	mockErrorMessage: vi.fn((error: unknown, fallback?: string) => {
		if (fallback) return fallback;
		if (error instanceof Error) return error.message;
		return 'Erro inesperado';
	}),
}));
const {
	mockSignInWithPopup,
	mockGoogleUserGetIdToken,
	mockGoogleUserGetIdTokenResult,
} = vi.hoisted(() => ({
	mockSignInWithPopup: vi.fn(),
	mockGoogleUserGetIdToken: vi.fn(),
	mockGoogleUserGetIdTokenResult: vi.fn(),
}));
const { updateAuthActivityMock } = vi.hoisted(() => ({
	updateAuthActivityMock: vi.fn(),
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

vi.mock('../../helpers/api', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../../helpers/api')>();

	return {
		...actual,
		api: {
			get: mockApiGet,
			post: mockApiPost,
		},
	};
});

vi.mock('../../helpers/authSession', async (importOriginal) => {
	const actual =
		await importOriginal<typeof import('../../helpers/authSession')>();

	return {
		...actual,
		updateAuthActivity: updateAuthActivityMock,
	};
});

vi.mock('../../helpers/errorMessage', () => ({
	errorMessage: mockErrorMessage,
}));

vi.mock('firebase/app', () => ({
	initializeApp: vi.fn(() => ({ name: 'test-app' })),
}));

vi.mock('firebase/auth', () => ({
	getAuth: vi.fn(() => ({ name: 'test-auth' })),
	GoogleAuthProvider: vi.fn(),
	signInWithPopup: mockSignInWithPopup,
}));

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
const authenticateForProfile = () =>
	localStorage.setItem('etnos_auth_token', 'profile-token');

describe('useAuth', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
		mockApiGet.mockResolvedValue({ data: null });
		mockGoogleUserGetIdToken.mockResolvedValue('firebase-google-id-token');
		mockGoogleUserGetIdTokenResult.mockResolvedValue({
			expirationTime: new Date(Date.now() + 3600 * 1000).toISOString(),
		});
	});

	it('carrega perfil via API ao montar', async () => {
		authenticateForProfile();
		mockApiGet.mockResolvedValueOnce({
			data: { uid: '123', email: 'test@test.com', parentName: 'Joao' },
		});

		const { result } = renderUseAuth();

		await waitFor(() => expect(result.current.isProfileLoading).toBe(false));

		expect(mockApiGet).toHaveBeenCalledWith('/auth/profile');
		expect(result.current.user?.parentName).toBe('Joao');
		expect(result.current.isLoggedIn).toBe(true);
	});

	it('retorna null quando window não está disponível', () => {
		const originalWindow = globalThis.window;

		Object.defineProperty(globalThis, 'window', {
			configurable: true,
			value: undefined,
		});

		expect(getStoredAuthToken()).toBeNull();

		Object.defineProperty(globalThis, 'window', {
			configurable: true,
			value: originalWindow,
		});
	});

	it('retorna user null quando falha ao carregar perfil', async () => {
		authenticateForProfile();
		const error = new Error('profile failed');
		mockApiGet.mockRejectedValueOnce(error);

		const { result } = renderUseAuth();

		await waitFor(() => expect(result.current.isProfileLoading).toBe(false));

		expect(result.current.user).toBeNull();
		expect(mockErrorMessage).toHaveBeenCalledWith(error);
	});

	it('atualiza atividade apenas quando a aba estiver visível', async () => {
		authenticateForProfile();
		mockApiGet.mockResolvedValueOnce({
			data: { uid: '123', email: 'test@test.com', parentName: 'Joao' },
		});

		const originalVisibilityState = Object.getOwnPropertyDescriptor(
			document,
			'visibilityState',
		);

		Object.defineProperty(document, 'visibilityState', {
			configurable: true,
			value: 'hidden',
		});

		const { result, unmount } = renderUseAuth();

		await waitFor(() => expect(result.current.isProfileLoading).toBe(false));

		document.dispatchEvent(new Event('visibilitychange'));
		expect(updateAuthActivityMock).not.toHaveBeenCalled();

		Object.defineProperty(document, 'visibilityState', {
			configurable: true,
			value: 'visible',
		});

		window.dispatchEvent(new Event('scroll'));
		expect(updateAuthActivityMock).toHaveBeenCalledTimes(1);

		unmount();

		if (originalVisibilityState) {
			Object.defineProperty(
				document,
				'visibilityState',
				originalVisibilityState,
			);
		}
	});

	it('faz login com email/senha e salva token', async () => {
		const password = randomPassword();
		const apiUser = { uid: '123', email: 'test@test.com' };
		mockApiPost.mockResolvedValueOnce({
			data: {
				idToken: 'token-123',
				refreshToken: 'refresh-123',
				expiresIn: '3600',
				user: apiUser,
			},
		});

		const { result } = renderUseAuth();

		let user: unknown;
		await act(async () => {
			user = await result.current.onSignInWithEmailAndPassword(
				'test@test.com',
				password,
			);
		});

		expect(mockApiPost).toHaveBeenCalledWith('/auth/login', {
			email: 'test@test.com',
			password,
		});
		expect(localStorage.getItem('etnos_auth_token')).toBe('token-123');
		expect(localStorage.getItem(AUTH_REFRESH_TOKEN_STORAGE_KEY)).toBe(
			'refresh-123',
		);
		expect(localStorage.getItem(AUTH_EXPIRES_AT_STORAGE_KEY)).not.toBeNull();
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
				password,
			);
		});

		expect(user).toBeNull();
		expect(result.current.isLoading).toBe(false);
	});

	it('faz login com Google usando Firebase ID token e salva token da API', async () => {
		mockSignInWithPopup.mockResolvedValueOnce({
			user: {
				getIdToken: mockGoogleUserGetIdToken,
				getIdTokenResult: mockGoogleUserGetIdTokenResult,
				refreshToken: 'google-refresh-token',
			},
		});
		mockApiPost.mockResolvedValueOnce({
			data: {
				idToken: 'api-google-id-token',
				user: { uid: 'google-user-id', email: 'google@test.com' },
			},
		});

		const { result } = renderUseAuth();

		let user: unknown;
		await act(async () => {
			user = await result.current.loginWithGoogle();
		});

		expect(mockSignInWithPopup).toHaveBeenCalledTimes(1);
		expect(mockGoogleUserGetIdToken).toHaveBeenCalledWith(true);
		expect(mockGoogleUserGetIdTokenResult).toHaveBeenCalledTimes(1);
		expect(mockApiPost).toHaveBeenCalledWith('/auth/google', {
			idToken: 'firebase-google-id-token',
		});
		expect(localStorage.getItem('etnos_auth_token')).toBe(
			'api-google-id-token',
		);
		expect(localStorage.getItem(AUTH_REFRESH_TOKEN_STORAGE_KEY)).toBe(
			'google-refresh-token',
		);
		expect(user).toEqual({
			uid: 'google-user-id',
			email: 'google@test.com',
		});
		expect(result.current.isLoading).toBe(false);
	});

	it('retorna null no login com Google e informa indisponibilidade', async () => {
		mockSignInWithPopup.mockRejectedValueOnce(new Error('popup fail'));

		const { result } = renderUseAuth();

		let user: unknown;
		await act(async () => {
			user = await result.current.loginWithGoogle();
		});

		expect(user).toBeNull();
		expect(message.error).toHaveBeenCalledWith(
			'Login com Google indisponível no momento.',
		);
	});

	it('faz login com Google mesmo sem expirationTime e não salva expiresAt', async () => {
		mockGoogleUserGetIdTokenResult.mockResolvedValueOnce({
			expirationTime: null,
		});
		mockSignInWithPopup.mockResolvedValueOnce({
			user: {
				getIdToken: mockGoogleUserGetIdToken,
				getIdTokenResult: mockGoogleUserGetIdTokenResult,
				refreshToken: 'google-refresh-token',
			},
		});
		mockApiPost.mockResolvedValueOnce({
			data: {
				idToken: 'api-google-id-token',
				user: { uid: 'google-user-id', email: 'google@test.com' },
			},
		});

		const { result } = renderUseAuth();

		await act(async () => {
			await result.current.loginWithGoogle();
		});

		expect(localStorage.getItem('etnos_auth_token')).toBe(
			'api-google-id-token',
		);
		expect(localStorage.getItem(AUTH_REFRESH_TOKEN_STORAGE_KEY)).toBe(
			'google-refresh-token',
		);
		expect(localStorage.getItem(AUTH_EXPIRES_AT_STORAGE_KEY)).toBeNull();
	});

	it('desloga com sucesso removendo token local', async () => {
		localStorage.setItem('etnos_auth_token', 'abc');
		localStorage.setItem(AUTH_REFRESH_TOKEN_STORAGE_KEY, 'refresh');
		localStorage.setItem(AUTH_EXPIRES_AT_STORAGE_KEY, '123');

		const { result } = renderUseAuth();

		await act(async () => {
			await result.current.onSignOut();
		});

		expect(localStorage.getItem('etnos_auth_token')).toBeNull();
		expect(localStorage.getItem(AUTH_REFRESH_TOKEN_STORAGE_KEY)).toBeNull();
		expect(localStorage.getItem(AUTH_EXPIRES_AT_STORAGE_KEY)).toBeNull();
		expect(result.current.user).toBeNull();
		expect(result.current.isLoggedIn).toBe(false);
		expect(message.success).toHaveBeenCalledWith('Desconectado com sucesso!');
		expect(result.current.isLoading).toBe(false);
	});

	it('trata erro ao deslogar', async () => {
		const error = new Error('remove fail');
		vi.mocked(localStorage.removeItem).mockImplementationOnce(() => {
			throw error;
		});
		mockErrorMessage.mockReturnValueOnce('Erro ao deslogar');

		const { result } = renderUseAuth();

		await act(async () => {
			await result.current.onSignOut();
		});

		expect(mockErrorMessage).toHaveBeenCalledWith(error);
		expect(message.error).toHaveBeenCalledWith('Erro ao deslogar');
		expect(result.current.isLoading).toBe(false);
	});

	it('envia email de recuperação com sucesso', async () => {
		mockApiPost.mockResolvedValueOnce({ data: true });
		const { result } = renderUseAuth();

		await act(async () => {
			await result.current.onRecoveryPass('test@test.com');
		});

		expect(mockApiPost).toHaveBeenCalledWith('/auth/recovery', {
			email: 'test@test.com',
		});
		expect(message.success).toHaveBeenCalledWith(
			'E-mail de recuperação enviado!',
		);
		expect(result.current.isLoading).toBe(false);
	});

	it('trata erro no onRecoveryPass', async () => {
		const error = new Error('reset fail');
		mockApiPost.mockRejectedValueOnce(error);
		mockErrorMessage.mockReturnValueOnce('Reset Error');
		const { result } = renderUseAuth();

		await act(async () => {
			await result.current.onRecoveryPass('test@test.com');
		});

		expect(message.error).toHaveBeenCalledWith('Reset Error');
		expect(result.current.isLoading).toBe(false);
	});

	it('altera senha com sucesso', async () => {
		mockApiPost.mockResolvedValueOnce({ data: { success: true } });
		const { result } = renderUseAuth();

		let wasChanged: boolean | undefined;
		await act(async () => {
			wasChanged = await result.current.onChangePassword(
				'senha-atual',
				'nova-senha',
			);
		});

		expect(mockApiPost).toHaveBeenCalledWith('/auth/change-password', {
			currentPassword: 'senha-atual',
			newPassword: 'nova-senha',
		});
		expect(message.success).toHaveBeenCalledWith('Senha alterada com sucesso!');
		expect(wasChanged).toBe(true);
		expect(result.current.isLoading).toBe(false);
	});

	it('trata erro no onChangePassword', async () => {
		const error = new Error('change password fail');
		mockApiPost.mockRejectedValueOnce(error);
		mockErrorMessage.mockReturnValueOnce('Erro ao alterar a senha.');
		const { result } = renderUseAuth();

		let wasChanged: boolean | undefined;
		await act(async () => {
			wasChanged = await result.current.onChangePassword(
				'senha-atual',
				'nova-senha',
			);
		});

		expect(mockErrorMessage).toHaveBeenCalledWith(
			error,
			'Erro ao alterar a senha.',
		);
		expect(message.error).toHaveBeenCalledWith('Erro ao alterar a senha.');
		expect(wasChanged).toBe(false);
		expect(result.current.isLoading).toBe(false);
	});

	it('atualiza perfil e converte undefined para null', async () => {
		authenticateForProfile();
		mockApiPost.mockResolvedValueOnce({ data: { ok: true } });
		mockApiGet.mockResolvedValueOnce({
			data: { uid: '123', childName: 'Old' },
		});
		const { result } = renderUseAuth();

		await waitFor(() => expect(result.current.isProfileLoading).toBe(false));

		let updated: Awaited<
			ReturnType<typeof result.current.updateUserProfile>
		>;
		await act(async () => {
			updated = await result.current.updateUserProfile({
				childName: undefined,
				parentName: 'Joao Silva',
			});
		});

		expect(updated).toEqual({ ok: true });
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

		let updated: Awaited<
			ReturnType<typeof result.current.updateUserProfile>
		>;
		await act(async () => {
			updated = await result.current.updateUserProfile({ parentName: 'Novo nome' });
		});

		expect(updated).toBeNull();
		expect(mockApiPost).toHaveBeenCalledWith('/auth/profile', {
			parentName: 'Novo nome',
		});
		expect(mockErrorMessage).toHaveBeenCalledWith(
			error,
			'Erro ao salvar perfil.',
		);
		expect(message.error).toHaveBeenCalledWith('Erro ao salvar perfil.');
	});

	it('registra novo usuário com sucesso', async () => {
		const password = randomPassword();
		const createdUser = { uid: 'new-user' };
		mockApiPost.mockResolvedValueOnce({
			data: {
				idToken: 'register-token',
				user: createdUser,
			},
		});

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

		expect(mockApiPost).toHaveBeenCalledWith('/auth/register', {
			email: 'new@test.com',
			password,
			school: 'Escola',
			parentName: 'Pai',
			parentPhone: '99999',
			childName: 'Filho',
			childBirthDate: '2020-01-01',
		});
		expect(localStorage.getItem('etnos_auth_token')).toBe('register-token');
		expect(user).toEqual(createdUser);
		expect(result.current.isLoading).toBe(false);
	});

	it('trata erro no onRegister', async () => {
		const password = randomPassword();
		const error = new Error('register fail');
		mockApiPost.mockRejectedValueOnce(error);
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
