import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { HeaderMobile } from './HeaderMobile';
import { createWrapper } from '../../test/setup';

const {
	mockUser,
	mockSelectedCharacter,
	mockCharacters,
	mockUseAuth,
	mockUseGames,
	mockUseUser,
	mockHandleSelectedCharacter,
	mockUseMyGameAccess,
	mockUseCharacter,
} = vi.hoisted(() => {
	const selectedCharacter = {
		slug: 'anita',
		name: 'Anita',
		description: 'Gaúcha',
	};

	return {
		mockUser: { uid: '123', email: 'user@teste.com' },
		mockSelectedCharacter: selectedCharacter,
		mockCharacters: [
			selectedCharacter,
			{
				slug: 'iara',
				name: 'Iara',
				description: 'Amazonia',
			},
			{
				slug: 'zeca',
				name: 'Zeca',
				description: 'Brasil',
			},
		],
		mockUseAuth: { onSignOut: vi.fn() },
		mockUseGames: { submitGameNps: vi.fn() },
		mockUseUser: { user: { uid: '123', email: 'user@teste.com' } },
		mockHandleSelectedCharacter: vi.fn(),
		mockUseMyGameAccess: vi.fn(() => ({
			data: {
				enabledCharacterSlugs: ['anita', 'zeca'],
			},
		})),
		mockUseCharacter: {
			selectedCharacter,
			data: [
				selectedCharacter,
				{
					slug: 'iara',
					name: 'Iara',
					description: 'Amazonia',
				},
				{
					slug: 'zeca',
					name: 'Zeca',
					description: 'Brasil',
				},
			],
			selectCharacter: vi.fn(),
		},
	};
});

mockUseUser.user = mockUser;
mockUseCharacter.selectedCharacter = mockSelectedCharacter;
mockUseCharacter.data = mockCharacters;
mockUseCharacter.selectCharacter = mockHandleSelectedCharacter;

vi.mock('@etnos/tools', () => ({
	useAuth: () => mockUseAuth,
	useGames: () => mockUseGames,
	useCharacter: () => mockUseCharacter,
	useMyGameAccess: () => mockUseMyGameAccess(),
}));

vi.mock('../../context', () => ({
	useUser: () => mockUseUser,
}));

describe('HeaderMobile', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('abre menu, abre modal e seleciona personagem', async () => {
		render(<HeaderMobile />, { wrapper: createWrapper() });

		const menuButton = screen.getByRole('button', { name: /menu/i });

		await act(async () => {
			fireEvent.click(menuButton);
		});

		const changeCharacterButton = screen.getByRole('button', {
			name: /alterar personagem/i,
		});

		await act(async () => {
			fireEvent.click(changeCharacterButton);
		});

		const selectCharacterButton = await screen.findByRole('button', {
			name: /Selecionar Personagem: Zeca/i,
		});

		await act(async () => {
			fireEvent.click(selectCharacterButton);
		});

		expect(mockHandleSelectedCharacter).toHaveBeenCalledWith('zeca');
	});

	it('abre menu e faz logout', async () => {
		render(<HeaderMobile />, { wrapper: createWrapper() });

		const menuButton = screen.getByRole('button', { name: /menu/i });

		await act(async () => {
			fireEvent.click(menuButton);
		});

		const logoutButton = screen.getByRole('button', { name: /sair/i });

		await act(async () => {
			fireEvent.click(logoutButton);
		});

		expect(mockUseAuth.onSignOut).toHaveBeenCalled();
		expect(window.open).toHaveBeenCalledWith('/login', '_self');
	});

	it('limpa o personagem selecionado quando ele nao esta habilitado para a escola', async () => {
		mockUseMyGameAccess.mockReturnValueOnce({
			data: {
				enabledCharacterSlugs: ['zeca'],
			},
		});

		render(<HeaderMobile />, { wrapper: createWrapper() });

		await waitFor(() => {
			expect(mockHandleSelectedCharacter).toHaveBeenCalledWith('');
		});
	});
});
