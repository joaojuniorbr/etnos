import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NotFound } from './NotFound';
import { UserProvider } from '../../context';
import { useAuth } from '@etnos/tools';

vi.mock('@etnos/tools', () => ({
	useAuth: vi.fn(),
}));

vi.mock('next/image', () => ({
	default: ({
		alt,
		src,
		...props
	}: React.ImgHTMLAttributes<HTMLImageElement>) => (
		<img alt={alt} src={src} {...props} />
	),
}));

describe('NotFound', () => {
	it('renderiza a imagem da página 404', () => {
		vi.mocked(useAuth).mockReturnValue({
			user: null,
			isLoading: false,
			isProfileLoading: false,
			isLoggedIn: false,
			isAdmin: false,
			updateUserProfile: vi.fn(),
			onRegister: vi.fn(),
			onSignOut: vi.fn(),
			onSignInWithEmailAndPassword: vi.fn(),
			onRecoveryPass: vi.fn(),
			onChangePassword: vi.fn(),
			loginWithGoogle: vi.fn(),
		});

		const { container } = render(
			<UserProvider>
				<NotFound />
			</UserProvider>,
		);

		expect(screen.getByAltText('Página não encontrada')).toHaveAttribute(
			'src',
			'/images/404.png',
		);
		expect(container.firstChild).toHaveClass(
			'ui:flex',
			'ui:flex-1',
			'ui:items-center',
			'ui:justify-center',
		);
		expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute(
			'href',
			'/login',
		);
	});

	it('renderiza link para perfil quando o usuário está autenticado', () => {
		vi.mocked(useAuth).mockReturnValue({
			user: { uid: 'user-1' },
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

		render(
			<UserProvider>
				<NotFound />
			</UserProvider>,
		);

		expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute(
			'href',
			'/estudante',
		);
	});
});
