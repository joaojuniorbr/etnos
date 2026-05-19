import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from './Header';

const mockUseUser = vi.fn();
vi.mock('@ui/context', () => ({
	useUser: () => mockUseUser(),
}));

const mockOnSignOut = vi.fn();
vi.mock('@etnos/tools', () => ({
	useAuth: () => ({
		onSignOut: mockOnSignOut,
	}),
}));

const mockWindowOpen = vi.fn();
vi.stubGlobal('open', mockWindowOpen);

const mockUserWithPhoto = {
	email: 'aluno@teste.com',
	photoURL: 'http://test.com/photo.jpg',
	childName: 'Filho Teste',
};

const mockUserWithoutPhoto = {
	email: 'aluno-sem-foto@teste.com',
	childName: null,
};

describe('Header Component', () => {
	it('renderiza o link principal da marca ETNOS', () => {
		mockUseUser.mockReturnValue({ user: null }); // Deslogado
		render(<Header />);
		const link = screen.getByRole('link', { name: /etnos/i });
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute('href', '/');
		expect(screen.getByAltText('Etnos')).toHaveAttribute(
			'src',
			'/images/brand-horizontal.svg',
		);
	});

	it('sempre renderiza o HeaderMobile', () => {
		mockUseUser.mockReturnValue({ user: null });
		vi.mock('./HeaderMobile', () => ({
			HeaderMobile: () => <div data-testid="header-mobile-mock" />,
		}));
		render(<Header />);
		expect(screen.getByTestId('header-mobile-mock')).toBeInTheDocument();
	});

	describe('Cenário: Usuário LOGADO (Desktop View - MD+)', () => {
		beforeEach(() => {
			vi.clearAllMocks();
		});

		it('renderiza perfil, nome do filho e imagem da conta (photoURL)', () => {
			mockUseUser.mockReturnValue({ user: mockUserWithPhoto });
			render(<Header />);

			expect(screen.getByText('Filho Teste')).toBeInTheDocument();

			const profileLink = screen.getByRole('link', { name: 'aluno@teste.com' });
			expect(profileLink).toHaveAttribute('href', '/estudante/perfil');

			const profileImg = screen.getByAltText('aluno@teste.com');
			expect(profileImg).toHaveAttribute('src', 'http://test.com/photo.jpg');

			expect(screen.getByRole('button', { name: /sair/i })).toBeInTheDocument();
		});

		it('renderiza email e imagem default (robohash) quando photoURL e childName são nulos', () => {
			mockUseUser.mockReturnValue({ user: mockUserWithoutPhoto });
			render(<Header />);

			expect(screen.getByText('aluno-sem-foto@teste.com')).toBeInTheDocument();

			const defaultImg = screen.getByAltText('aluno-sem-foto@teste.com');
			expect(defaultImg).toHaveAttribute(
				'src',
				`https://robohash.org/${mockUserWithoutPhoto.email}`,
			);
		});

		it('chama onSignOut e navega para /login ao clicar em SAIR', async () => {
			mockUseUser.mockReturnValue({ user: mockUserWithPhoto });
			mockOnSignOut.mockResolvedValueOnce(undefined);
			render(<Header />);

			const signOutButton = screen.getByRole('button', { name: /sair/i });
			fireEvent.click(signOutButton);

			expect(mockOnSignOut).toHaveBeenCalledTimes(1);

			await waitFor(() => {
				expect(mockWindowOpen).toHaveBeenCalledWith('/login', '_self');
			});
		});
	});

	describe('Cenário: Usuário DESLOGADO (Desktop View - MD+)', () => {
		it('renderiza botões Cadastrar e Entrar (nav)', () => {
			mockUseUser.mockReturnValue({ user: null });
			render(<Header />);

			expect(screen.queryByText(/sair/i)).not.toBeInTheDocument();

			const registerButton = screen.getByRole('link', { name: /Cadastrar/i });
			expect(registerButton).toBeInTheDocument();
			expect(registerButton).toHaveAttribute('href', '/cadastro');

			const loginButton = screen.getByRole('link', { name: /Entrar/i });
			expect(loginButton).toBeInTheDocument();
			expect(loginButton).toHaveAttribute('href', '/login');
		});
	});
});
