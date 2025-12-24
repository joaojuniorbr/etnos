import { renderHook, waitFor, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { mockRepo } from '../../test';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as authMethods from 'firebase/auth';
import { message } from 'antd';

vi.mock('firebase/auth', async () => {
	const actual = await vi.importActual('firebase/auth');
	return {
		...actual,
		onAuthStateChanged: vi.fn(() => vi.fn()),
		signInWithEmailAndPassword: vi.fn(),
		signOut: vi.fn(),
		sendPasswordResetEmail: vi.fn(),
		createUserWithEmailAndPassword: vi.fn(),
		signInWithPopup: vi.fn(),
	};
});

vi.mock('antd', () => ({
	message: {
		error: vi.fn(),
		success: vi.fn(),
	},
}));

describe('useAuth', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const setupAuth = (user: any = null) => {
		(authMethods.onAuthStateChanged as any).mockImplementation(
			(auth: any, cb: any) => {
				cb(user);
				return () => {};
			}
		);
	};

	it('deve carregar o perfil do usuário ao montar (Fluxo Sucesso)', async () => {
		setupAuth({ uid: '123', email: 'test@test.com' });
		mockRepo.findOne.mockResolvedValueOnce({ parentName: 'João' });

		const { result } = renderHook(() => useAuth());

		await waitFor(() => expect(result.current.isLoading).toBe(false));
		expect(result.current.user?.parentName).toBe('João');
		expect(result.current.isLoggedIn).toBe(true);
	});

	it('deve carregar apenas dados do firebase se não houver perfil no firestore', async () => {
		setupAuth({ uid: '123' });
		mockRepo.findOne.mockResolvedValueOnce(null);

		const { result } = renderHook(() => useAuth());

		await waitFor(() => expect(result.current.isLoading).toBe(false));
		expect(result.current.user?.uid).toBe('123');
	});

	it('deve deslogar o usuário (onSignOut)', async () => {
		setupAuth({ uid: '123' });
		const { result } = renderHook(() => useAuth());

		await act(async () => {
			await result.current.onSignOut();
		});

		expect(authMethods.signOut).toHaveBeenCalled();
		expect(result.current.user).toBeNull();
	});

	it('deve logar com email e senha', async () => {
		setupAuth(null);
		const { result } = renderHook(() => useAuth());
		(authMethods.signInWithEmailAndPassword as any).mockResolvedValueOnce({
			user: { uid: '123' },
		});

		await act(async () => {
			await result.current.onSignInWithEmailAndPassword(
				'test@test.com',
				'123456'
			);
		});

		expect(authMethods.signInWithEmailAndPassword).toHaveBeenCalled();
	});

	it('deve tratar erro no login com email e senha', async () => {
		setupAuth(null);
		const { result } = renderHook(() => useAuth());
		(authMethods.signInWithEmailAndPassword as any).mockRejectedValueOnce(
			new Error('Auth Error')
		);

		await act(async () => {
			const user = await result.current.onSignInWithEmailAndPassword(
				'err@test.com',
				'123'
			);
			expect(user).toBeNull();
		});
		expect(result.current.isLoading).toBe(false);
	});

	it('deve recuperar senha (onRecoveryPass)', async () => {
		const { result } = renderHook(() => useAuth());
		await act(async () => {
			await result.current.onRecoveryPass('test@test.com');
		});
		expect(authMethods.sendPasswordResetEmail).toHaveBeenCalled();
		expect(message.success).toHaveBeenCalledWith(
			'E-mail de recuperação enviado!'
		);
	});

	it('deve atualizar o perfil do usuário (updateUserProfile)', async () => {
		setupAuth({ uid: '123' });
		const { result } = renderHook(() => useAuth());

		await waitFor(() => expect(result.current.user).not.toBeNull());

		await act(async () => {
			await result.current.updateUserProfile({ childName: 'Enzo' });
		});

		expect(mockRepo.update).toHaveBeenCalled();
		expect(result.current.user?.childName).toBe('Enzo');
	});

	it('deve falhar ao atualizar perfil se usuário não estiver logado', async () => {
		setupAuth(null);
		const { result } = renderHook(() => useAuth());

		await act(async () => {
			await result.current.updateUserProfile({ childName: 'Erro' });
		});

		expect(message.error).toHaveBeenCalledWith('Nenhum usuário autenticado.');
	});

	it('deve registrar novo usuário (onRegister)', async () => {
		const { result } = renderHook(() => useAuth());
		(authMethods.createUserWithEmailAndPassword as any).mockResolvedValueOnce({
			user: { uid: 'new-user' },
		});

		await act(async () => {
			const newUser = await result.current.onRegister({
				parentEmail: 'new@test.com',
				password: 'password',
				parentName: 'Pai',
			});
			expect(newUser!.uid).toBe('new-user');
		});

		expect(mockRepo.update).toHaveBeenCalled();
	});

	it('deve logar com Google e retornar o usuário', async () => {
		const mockGoogleUser = { uid: 'google-id', email: 'google@test.com' };

		vi.mocked(authMethods.signInWithPopup).mockResolvedValueOnce({
			user: mockGoogleUser,
		} as any);

		const { result } = renderHook(() => useAuth());

		let userResponse;
		await act(async () => {
			userResponse = await result.current.loginWithGoogle();
		});

		expect(authMethods.signInWithPopup).toHaveBeenCalledWith(
			expect.anything(),
			expect.anything()
		);
		expect(userResponse).not.toBeNull();
		expect(userResponse!.uid).toBe('google-id');
	});

	it('deve tratar erro no login com Google', async () => {
		const { result } = renderHook(() => useAuth());
		(authMethods.signInWithPopup as any).mockRejectedValueOnce(
			new Error('Google Error')
		);

		await act(async () => {
			const user = await result.current.loginWithGoogle();
			expect(user).toBeNull();
		});
		expect(message.error).toHaveBeenCalled();
	});

	describe('useAuth - Fluxos de Erro', () => {
		it('deve cobrir erro no onSignOut', async () => {
			vi.mocked(authMethods.signOut).mockRejectedValueOnce(
				new Error('Signout Fail')
			);
			const { result } = renderHook(() => useAuth());

			await act(async () => {
				await result.current.onSignOut();
			});

			expect(message.error).toHaveBeenCalled();
		});

		it('deve cobrir erro no onRecoveryPass', async () => {
			vi.mocked(authMethods.sendPasswordResetEmail).mockRejectedValueOnce(
				new Error('Reset Fail')
			);
			const { result } = renderHook(() => useAuth());

			await act(async () => {
				await result.current.onRecoveryPass('test@test.com');
			});

			expect(message.error).toHaveBeenCalled();
		});

		it('deve cobrir erro no updateUserProfile', async () => {
			(authMethods.onAuthStateChanged as any).mockImplementationOnce(
				(auth: any, cb: any) => {
					cb({ uid: '123' });
					return () => {};
				}
			);

			mockRepo.update.mockRejectedValueOnce(new Error('Update Fail'));
			const { result } = renderHook(() => useAuth());

			await waitFor(() => expect(result.current.user).not.toBeNull());

			await act(async () => {
				await result.current.updateUserProfile({ parentName: 'Novo' });
			});

			expect(message.error).toHaveBeenCalled();
		});

		it('deve cobrir erro no onRegister', async () => {
			vi.mocked(
				authMethods.createUserWithEmailAndPassword
			).mockRejectedValueOnce(new Error('Register Fail'));
			const { result } = renderHook(() => useAuth());

			await act(async () => {
				const res = await result.current.onRegister({
					parentEmail: 'test@t.com',
					password: '123',
				});
				expect(res).toBeNull();
			});

			expect(message.error).toHaveBeenCalled();
		});

		it('deve cobrir erro no getProfile', async () => {
			mockRepo.findOne.mockRejectedValueOnce(new Error('Firestore Fail'));

			(authMethods.onAuthStateChanged as any).mockImplementationOnce(
				(auth: any, cb: any) => {
					cb({ uid: '123' });
					return () => {};
				}
			);

			const { result } = renderHook(() => useAuth());

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});
		});
	});

	describe('useAuth - Casos Específicos de Coverage', () => {
		it('deve converter undefined para null no cleanDataForFirestore', async () => {
			setupAuth({ uid: '123' });
			const { result } = renderHook(() => useAuth());
			await waitFor(() => expect(result.current.user).not.toBeNull());

			await act(async () => {
				await result.current.updateUserProfile({
					childName: undefined,
					parentName: 'João Silva',
				});
			});

			expect(mockRepo.update).toHaveBeenCalledWith(
				'123',
				expect.objectContaining({
					childName: null,
					parentName: 'João Silva',
				})
			);
		});

		it('deve manter o estado como null no setUser se o usuário for deslogado durante o processo', async () => {
			setupAuth({ uid: '123' });
			const { result } = renderHook(() => useAuth());
			await waitFor(() => expect(result.current.user).not.toBeNull());

			let resolveUpdate: (value: any) => void;
			mockRepo.update.mockReturnValueOnce(
				new Promise((resolve) => {
					resolveUpdate = resolve;
				})
			);

			let promise: Promise<any>;
			await act(async () => {
				promise = result.current.updateUserProfile({ childName: 'Teste' });
			});

			await act(async () => {
				result.current.onSignOut();
			});

			await act(async () => {
				resolveUpdate!({});
				await promise;
			});

			expect(result.current.user).toBeNull();
		});
	});
});
