import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MobileMenu } from './MobileMenu';
import { UserProfileInterface } from '@etnos/tools';

const mockUser = {
	email: 'mock@example.com',
	childName: 'Usuário Mock',
} as UserProfileInterface;

describe('MobileMenu', () => {
	it('renderiza menu de login/cadastro quando não há usuário', () => {
		render(
			<MobileMenu
				open={true}
				toggleDrawer={() => {}}
				user={null}
				onLogout={() => {}}
			/>
		);

		expect(screen.getByAltText('Etnos')).toBeInTheDocument();

		expect(screen.getByRole('link', { name: /Entrar/i })).toBeInTheDocument();
		expect(
			screen.getByRole('link', { name: /Cadastrar/i })
		).toBeInTheDocument();
	});

	it('renderiza menu do usuário quando há usuário', async () => {
		render(
			<MobileMenu
				open={true}
				toggleDrawer={() => {}}
				user={mockUser}
				onLogout={() => {}}
			/>
		);

		await waitFor(() => {
			expect(screen.getByText(/Usuário Mock/i)).toBeInTheDocument();

			expect(screen.getByText(/Home/i)).toBeInTheDocument();
			expect(screen.getByText(/Área do Estudante/i)).toBeInTheDocument();
			expect(screen.getByText(/Perfil/i)).toBeInTheDocument();
		});
	});

	it('renderiza menu do usuário quando há usuário sem nome do filho', async () => {
		render(
			<MobileMenu
				open={true}
				toggleDrawer={() => {}}
				user={{ ...mockUser, childName: undefined }}
				onLogout={() => {}}
			/>
		);

		await waitFor(() => {
			expect(screen.getByText(/mock@example.com/i)).toBeInTheDocument();

			expect(screen.getByText(/Home/i)).toBeInTheDocument();
			expect(screen.getByText(/Área do Estudante/i)).toBeInTheDocument();
			expect(screen.getByText(/Perfil/i)).toBeInTheDocument();
		});
	});

	it('chama toggleDrawer ao clicar no botão de menu', () => {
		const toggleDrawer = vi.fn();
		render(
			<MobileMenu
				open={false}
				toggleDrawer={toggleDrawer}
				user={null}
				onLogout={() => {}}
			/>
		);

		fireEvent.click(screen.getByRole('button', { name: '' }));
		expect(toggleDrawer).toHaveBeenCalled();
	});

	it('chama onLogout ao clicar no botão SAIR', async () => {
		const onLogout = vi.fn();
		render(
			<MobileMenu
				open={true}
				toggleDrawer={() => {}}
				user={mockUser}
				onLogout={onLogout}
			/>
		);

		await userEvent.click(screen.getByRole('button', { name: /SAIR/i }));

		expect(onLogout).toHaveBeenCalled();
	});
});
