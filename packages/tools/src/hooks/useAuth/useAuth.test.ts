import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from './useAuth';
import { message } from 'antd';
import {
	signOut,
	signInWithEmailAndPassword,
	sendPasswordResetEmail,
	createUserWithEmailAndPassword,
	onAuthStateChanged,
	signInWithPopup,
} from 'firebase/auth';
import { getDoc, setDoc } from 'firebase/firestore';

describe('useAuth hook', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve inicializar com usuário logado via onAuthStateChanged', async () => {
		const { result } = renderHook(() => useAuth());

		await waitFor(() => {
			expect(result.current.user?.email).toBe('test@test.com');
			expect(result.current.isLoggedIn).toBe(true);
			expect(result.current.isLoading).toBe(false);
		});
	});

	it('deve fazer login com email e senha', async () => {
		const { result } = renderHook(() => useAuth());

		await act(async () => {
			const user = await result.current.onSignInWithEmailAndPassword(
				'test@test.com',
				'123456'
			);
			expect(user?.email).toBe('test@test.com');
		});

		expect(signInWithEmailAndPassword).toHaveBeenCalled();
		expect(result.current.user?.email).toBe('test@test.com');
	});

	it('deve fazer logout', async () => {
		const { result } = renderHook(() => useAuth());

		await act(async () => {
			await result.current.onSignOut();
		});

		expect(signOut).toHaveBeenCalled();
		expect(result.current.user).toBeNull();
	});

	it('deve enviar email de recuperação de senha', async () => {
		const { result } = renderHook(() => useAuth());

		await act(async () => {
			await result.current.onRecoveryPass('test@test.com');
		});

		expect(sendPasswordResetEmail).toHaveBeenCalledWith(
			{ auth: 'mocked-auth' },
			'test@test.com'
		);
	});

	it('deve atualizar perfil do usuário', async () => {
		const { result } = renderHook(() => useAuth());

		await act(async () => {
			await result.current.onSignInWithEmailAndPassword(
				'test@test.com',
				'123456'
			);
		});

		await act(async () => {
			await result.current.updateUserProfile({ parentName: 'Novo Nome' });
		});

		expect(setDoc).toHaveBeenCalled();
		expect(message.success).toHaveBeenCalledWith(
			'Perfil atualizado com sucesso!'
		);
		expect(result.current.user?.parentName).toBe('Novo Nome');
	});

	it('deve registrar novo usuário', async () => {
		const { result } = renderHook(() => useAuth());

		(getDoc as any).mockResolvedValueOnce({
			exists: () => false,
			data: () => null,
		});

		await act(async () => {
			const user = await result.current.onRegister({
				parentEmail: 'new@test.com',
				password: '123456',
				parentName: 'Pai',
				childName: 'Filho',
			});
			expect(user?.email).toBe('new@test.com');
		});

		expect(createUserWithEmailAndPassword).toHaveBeenCalled();
		expect(setDoc).toHaveBeenCalled();
		expect(result.current.user?.email).toBe('new@test.com');
	});

	it('onSignOut deve tratar erro', async () => {
		(signOut as any).mockRejectedValueOnce(null);
		const { result } = renderHook(() => useAuth());

		await act(async () => {
			await result.current.onSignOut();
		});

		expect(result.current.isLoading).toBe(false);
	});

	it('onSignInWithEmailAndPassword deve tratar erro', async () => {
		(signInWithEmailAndPassword as any).mockRejectedValueOnce(
			new Error('login error')
		);
		const { result } = renderHook(() => useAuth());

		await act(async () => {
			await result.current.onSignInWithEmailAndPassword('x', 'y');
		});

		expect(result.current.isLoading).toBe(false);
	});

	it('onRecoveryPass deve tratar erro', async () => {
		(sendPasswordResetEmail as any).mockRejectedValueOnce(
			new Error('reset error')
		);
		const { result } = renderHook(() => useAuth());

		await act(async () => {
			await result.current.onRecoveryPass('x@test.com');
		});

		expect(result.current.isLoading).toBe(false);
	});

	it('updateUserProfile sem usuário deve chamar message.error', async () => {
		const { result } = renderHook(() => useAuth());

		await act(async () => {
			await result.current.updateUserProfile({ parentName: 'Novo Nome' });
		});

		expect(message.error).toHaveBeenCalledWith(
			'Nenhum usuário autenticado para atualizar o perfil.'
		);
	});

	it('updateUserProfile erro no setDoc deve chamar message.error', async () => {
		const { result } = renderHook(() => useAuth());

		await act(async () => {
			await result.current.onSignInWithEmailAndPassword(
				'test@test.com',
				'123456'
			);
		});

		(setDoc as any).mockRejectedValueOnce(null);

		await act(async () => {
			await result.current.updateUserProfile({ parentName: 'Erro' });
		});

		expect(message.error).toHaveBeenCalledWith(
			'Ocorreu um erro ao salvar seu perfil. Tente novamente.'
		);
	});

	it('getProfile sem userProfile não deve alterar estado', async () => {
		const { result } = renderHook(() => useAuth());

		(getDoc as any).mockResolvedValueOnce({
			exists: () => false,
			data: () => null,
		});

		await act(async () => {
			await (result.current as any).getProfile(null);
			expect(result.current.user).toBeNull();
		});
	});

	it('getProfile com userDoc.exists = false deve setar apenas userProfile', async () => {
		(getDoc as any).mockResolvedValueOnce({
			exists: () => false,
			data: () => null,
		});

		const { result } = renderHook(() => useAuth());

		const fakeUser = { uid: '123', email: 'fake@test.com' } as any;

		await act(async () => {
			await (result.current as any).getProfile(fakeUser);
		});

		expect(result.current.user?.email).toBe('fake@test.com');
	});

	it('onRegister sem email/senha deve retornar null', async () => {
		const { result } = renderHook(() => useAuth());

		await act(async () => {
			const user = await result.current.onRegister({});
			expect(user).toBeNull();
		});
	});

	it('onRegister usuário já existe deve retornar null', async () => {
		(getDoc as any).mockResolvedValueOnce({
			exists: () => true,
			data: () => ({ email: 'existing@test.com' }),
		});

		const { result } = renderHook(() => useAuth());

		await act(async () => {
			const user = await result.current.onRegister({
				parentEmail: 'existing@test.com',
				password: '123',
			});
			expect(user).toBeNull();
		});
	});

	it('onRegister erro no createUserWithEmailAndPassword deve retornar null', async () => {
		const { result } = renderHook(() => useAuth());

		(getDoc as any).mockResolvedValueOnce({
			exists: () => false,
			data: () => null,
		});

		(createUserWithEmailAndPassword as any).mockRejectedValueOnce(
			new Error('register error')
		);

		await act(async () => {
			const user = await result.current.onRegister({
				parentEmail: 'failregister@test.com',
				password: '123',
			});

			expect(user).toBeNull();
		});
	});

	it('onAuthStateChanged com user = null deve setar user null e isLoading false', async () => {
		const { result } = renderHook(() => useAuth());

		await act(async () => {
			await (result.current as any).onSignOut();
		});

		expect(result.current.user).toBeNull();
		expect(result.current.isLoading).toBe(false);
	});

	it('deve substituir valores undefined por null', async () => {
		const { result } = renderHook(() => useAuth());

		await act(async () => {
			const input = { parentName: 'João', childName: undefined };
			const output = (result.current as any).cleanDataForFirestore(input);

			expect(output).toEqual({
				parentName: 'João',
				childName: null,
			});
		});
	});

	it('deve setar user=null e isLoading=false quando onAuthStateChanged retorna null', async () => {
		(onAuthStateChanged as any).mockImplementation(
			(_auth: any, callback: any) => {
				callback(null);
				return () => {};
			}
		);

		const { result } = renderHook(() => useAuth());

		await waitFor(() => {
			expect(result.current.user).toBeNull();
			expect(result.current.isLoading).toBe(false);
		});
	});

	it('deve fazer login com Google com sucesso, setar o usuário e retornar o usuário', async () => {
		const { result } = renderHook(() => useAuth());
		const googleUser = { uid: 'google-uid', email: 'google@test.com' };

		(signInWithPopup as any).mockResolvedValueOnce({
			user: googleUser,
		});

		await act(async () => {
			const user = await result.current.loginWithGoogle();
			expect(user).toEqual(googleUser);
		});

		expect(signInWithPopup).toHaveBeenCalled();

		expect(result.current.user?.email).toBe('google@test.com');
		expect(result.current.isLoggedIn).toBe(true);
	});

	it('deve capturar erro no login com Google, logar e retornar undefined', async () => {
		const { result } = renderHook(() => useAuth());
		const error = new Error('Google login failed');

		(signInWithPopup as any).mockRejectedValueOnce(error);

		await act(async () => {
			const user = await result.current.loginWithGoogle();
			expect(user).toBeUndefined();
		});

		expect(result.current.user).toBeNull();
	});
});
