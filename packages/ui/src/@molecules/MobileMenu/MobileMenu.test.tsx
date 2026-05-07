import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	render,
	screen,
	fireEvent,
	waitFor,
	within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { message } from 'antd';

import { MobileMenu } from './MobileMenu';
import type { UserProfileInterface } from '@etnos/types';

const submitGameNpsMock = vi.fn().mockResolvedValue(undefined);

vi.mock('@etnos/tools', () => ({
	useGames: () => ({
		submitGameNps: submitGameNpsMock,
	}),
}));

const mockUser = {
	uid: 'mock-uid',
	email: 'mock@example.com',
	childName: 'Usuário Mock',
} as UserProfileInterface;

describe('MobileMenu', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(message, 'warning').mockImplementation(vi.fn());
	});

	it('renderiza menu de login/cadastro quando não há usuário', () => {
		render(
			<MobileMenu
				open={true}
				toggleDrawer={() => {}}
				user={null}
				onLogout={() => {}}
			/>,
		);

		expect(screen.getByAltText('Etnos')).toBeInTheDocument();

		expect(screen.getByRole('link', { name: /Entrar/i })).toBeInTheDocument();
		expect(
			screen.getByRole('link', { name: /Cadastrar/i }),
		).toBeInTheDocument();
	});

	it('renderiza menu do usuário quando há usuário', async () => {
		render(
			<MobileMenu
				open={true}
				toggleDrawer={() => {}}
				user={mockUser}
				onLogout={() => {}}
				selectedCharacter={{
					id: 'iara',
					slug: 'iara',
					name: 'Iara',
					description: 'Teste de Funcionamento',
					region: 'norte',
				}}
			/>,
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
			/>,
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
			/>,
		);

		const menuButton = screen.getByRole('button', { name: /menu/i });

		fireEvent.click(menuButton);

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
			/>,
		);

		await userEvent.click(screen.getByRole('button', { name: /SAIR/i }));

		expect(onLogout).toHaveBeenCalled();
	});

	it('renderezia menu do usuário admin', async () => {
		render(
			<MobileMenu
				open={true}
				toggleDrawer={() => {}}
				user={{ ...mockUser, role: ['admin'] }}
				onLogout={() => {}}
			/>,
		);

		await waitFor(() => {
			expect(screen.getByText(/Usuário Mock/i)).toBeInTheDocument();
			expect(screen.getByText(/Área do administrador/i)).toBeInTheDocument();
		});
	});

	it('renderiza acesso de escola sem links exclusivos de admin', async () => {
		render(
			<MobileMenu
				open={true}
				toggleDrawer={() => {}}
				user={{ ...mockUser, role: ['school'] }}
				onLogout={() => {}}
			/>,
		);

		await waitFor(() => {
			expect(screen.getByText(/Área do administrador/i)).toBeInTheDocument();
		});

		await userEvent.click(screen.getByText(/Área do administrador/i));

		await waitFor(() => {
			expect(screen.getByText(/Escolas/i)).toBeInTheDocument();
		});

		expect(screen.queryByText(/Personagens/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/Midia/i)).not.toBeInTheDocument();
	});

	it('não exibe avaliação quando não houver personagem selecionado', () => {
		render(
			<MobileMenu
				open={true}
				toggleDrawer={() => {}}
				user={mockUser}
				onLogout={() => {}}
			/>,
		);

		expect(
			screen.queryByRole('button', { name: /Fazer avaliação/i }),
		).not.toBeInTheDocument();
	});

	it('abre fluxo de NPS, valida nota e envia feedback', async () => {
		const user = userEvent.setup();

		render(
			<MobileMenu
				open={true}
				toggleDrawer={() => {}}
				user={mockUser}
				onLogout={() => {}}
				selectedCharacter={{
					id: 'iara',
					slug: 'iara',
					name: 'Iara',
					description: 'Teste',
					region: 'norte',
				}}
			/>,
		);

		await user.click(screen.getByRole('button', { name: /Fazer avaliação/i }));

		expect(
			await screen.findByText(/Escolha o jogo para avaliar/i),
		).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: /Jogo da Memória/i }));

		expect(
			await screen.findByText(/Como foi sua experiência/i),
		).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: /^Enviar$/i }));

		expect(message.warning).toHaveBeenCalledWith(
			'Selecione uma nota de 1 a 5.',
		);
		expect(submitGameNpsMock).not.toHaveBeenCalled();

		const stars = screen.getAllByRole('radio');
		await user.click(stars[4]!);

		await user.type(screen.getByPlaceholderText(/opcional/i), 'Legal');

		await user.click(screen.getByRole('button', { name: /^Enviar$/i }));

		await waitFor(() => {
			expect(submitGameNpsMock).toHaveBeenCalledWith(
				'memory-game',
				'iara',
				5,
				'Legal',
			);
		});
	});

	it('permite avaliar o jogo Adivinhe', async () => {
		const user = userEvent.setup();

		render(
			<MobileMenu
				open={true}
				toggleDrawer={() => {}}
				user={mockUser}
				onLogout={() => {}}
				selectedCharacter={{
					id: 'anita',
					slug: 'anita',
					name: 'Anita',
					description: 'Teste',
					region: 'sul',
				}}
			/>,
		);

		await user.click(screen.getByRole('button', { name: /Fazer avaliação/i }));
		await user.click(screen.getByRole('button', { name: /^Adivinhe$/i }));

		const stars = await screen.findAllByRole('radio');
		await user.click(stars[2]!);

		await user.click(screen.getByRole('button', { name: /^Enviar$/i }));

		await waitFor(() => {
			expect(submitGameNpsMock).toHaveBeenCalledWith(
				'guess-game',
				'anita',
				3,
				undefined,
			);
		});
	});

	it('ignora envio da avaliação quando o personagem deixa de estar selecionado', async () => {
		const user = userEvent.setup();

		const { rerender } = render(
			<MobileMenu
				open={true}
				toggleDrawer={() => {}}
				user={mockUser}
				onLogout={() => {}}
				selectedCharacter={{
					id: 'iara',
					slug: 'iara',
					name: 'Iara',
					description: 'Teste',
					region: 'norte',
				}}
			/>,
		);

		await user.click(screen.getByRole('button', { name: /Fazer avaliação/i }));
		await user.click(screen.getByRole('button', { name: /Jogo da Memória/i }));

		expect(
			await screen.findByText(/Como foi sua experiência/i),
		).toBeInTheDocument();

		rerender(
			<MobileMenu
				open={true}
				toggleDrawer={() => {}}
				user={mockUser}
				onLogout={() => {}}
				selectedCharacter={null}
			/>,
		);

		await user.click(screen.getByRole('button', { name: /^Enviar$/i }));

		expect(message.warning).not.toHaveBeenCalled();
		expect(submitGameNpsMock).not.toHaveBeenCalled();
	});

	it('fecha o modal de escolha do jogo pelo botão fechar', async () => {
		const user = userEvent.setup();

		render(
			<MobileMenu
				open={true}
				toggleDrawer={() => {}}
				user={mockUser}
				onLogout={() => {}}
				selectedCharacter={{
					id: 'anita',
					slug: 'anita',
					name: 'Anita',
					description: 'Teste',
					region: 'sul',
				}}
			/>,
		);

		await user.click(screen.getByRole('button', { name: /Fazer avaliação/i }));
		const chooserTitle = await screen.findByText(
			/Escolha o jogo para avaliar/i,
		);
		const chooserWrap = chooserTitle.closest('.ant-modal-wrap');
		expect(chooserWrap).toBeTruthy();
		const chooserModal = chooserTitle.closest('.ant-modal');
		await user.click(
			within(chooserModal as HTMLElement).getByRole('button', {
				name: /close/i,
			}),
		);

		await waitFor(() => {
			expect((chooserWrap as HTMLElement).style.display).toBe('none');
		});
	});

	it('cancela o envio da avaliação pelo botão Cancelar', async () => {
		const user = userEvent.setup();

		render(
			<MobileMenu
				open={true}
				toggleDrawer={() => {}}
				user={mockUser}
				onLogout={() => {}}
				selectedCharacter={{
					id: 'anita',
					slug: 'anita',
					name: 'Anita',
					description: 'Teste',
					region: 'sul',
				}}
			/>,
		);

		await user.click(screen.getByRole('button', { name: /Fazer avaliação/i }));
		await user.click(screen.getByRole('button', { name: /Jogo da Memória/i }));

		const npsTitle = await screen.findByText(/Como foi sua experiência/i);
		const npsWrap = npsTitle.closest('.ant-modal-wrap');
		expect(npsWrap).toBeTruthy();
		const npsModal = npsTitle.closest('.ant-modal');
		expect(npsModal).toBeTruthy();
		await user.click(
			within(npsModal as HTMLElement).getByRole('button', {
				name: /^Cancelar$/i,
			}),
		);

		await waitFor(() => {
			expect((npsWrap as HTMLElement).style.display).toBe('none');
		});

		expect(submitGameNpsMock).not.toHaveBeenCalled();
	});

	it('fecha o modal de avaliação pelo botão fechar', async () => {
		const user = userEvent.setup();

		render(
			<MobileMenu
				open={true}
				toggleDrawer={() => {}}
				user={mockUser}
				onLogout={() => {}}
				selectedCharacter={{
					id: 'anita',
					slug: 'anita',
					name: 'Anita',
					description: 'Teste',
					region: 'sul',
				}}
			/>,
		);

		await user.click(screen.getByRole('button', { name: /Fazer avaliação/i }));
		await user.click(screen.getByRole('button', { name: /Jogo da Memória/i }));

		const npsTitle = await screen.findByText(/Como foi sua experiência/i);
		const npsWrap = npsTitle.closest('.ant-modal-wrap');
		expect(npsWrap).toBeTruthy();
		const npsModal = npsTitle.closest('.ant-modal');
		await user.click(
			within(npsModal as HTMLElement).getByRole('button', { name: /close/i }),
		);

		await waitFor(() => {
			expect((npsWrap as HTMLElement).style.display).toBe('none');
		});
	});
});
