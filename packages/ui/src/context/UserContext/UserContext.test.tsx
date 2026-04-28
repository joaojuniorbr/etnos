import { render, renderHook, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserProvider, useUser } from './UserContext'; // ajuste o caminho
import { useAuth } from '@etnos/tools';
import type { UserProfileInterface } from '@etnos/types';

// Mock do hook useAuth
vi.mock('@etnos/tools', () => ({
	useAuth: vi.fn(),
}));

describe('UserContext', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve lançar erro quando useUser for usado fora do UserProvider', () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		expect(() => renderHook(() => useUser())).toThrow(
			'useUser deve ser usado dentro de um UserProvider',
		);

		consoleSpy.mockRestore();
	});

	it('deve fornecer os dados do usuário corretamente através do Provider', () => {
		const mockUser = { uid: '123', parentName: 'João Silva' };

		vi.mocked(useAuth).mockReturnValue({
			user: mockUser as UserProfileInterface,
			isLoading: false,
			isProfileLoading: false,
			isLoggedIn: true,
			isAdmin: false,
			updateUserProfile: vi.fn(),
			onRegister: vi.fn(),
			onSignOut: vi.fn(),
			onSignInWithEmailAndPassword: vi.fn(),
			onRecoveryPass: vi.fn(),
			onChangePassword: vi.fn(),
			loginWithGoogle: vi.fn(),
		});

		const TestComponent = () => {
			const { user, isLoading } = useUser();
			return (
				<div>
					<span data-testid="user-id">{user?.uid}</span>
					<span data-testid="loading">{isLoading.toString()}</span>
				</div>
			);
		};

		render(
			<UserProvider>
				<TestComponent />
			</UserProvider>,
		);

		expect(screen.getByTestId('user-id').textContent).toBe('123');
		expect(screen.getByTestId('loading').textContent).toBe('false');
	});
});
