import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HeaderMobile } from './HeaderMobile';

const mockUser = { uid: '123', email: 'user@teste.com' };
const mockSelectedCharacter = {
	slug: 'anita',
	name: 'Anita',
	description: 'Gaúcha',
};
const mockCharacters = [
	mockSelectedCharacter,
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
];

const mockUseAuth = { onSignOut: vi.fn() };
const mockUseUser = { user: mockUser };
const mockHandleSelectedCharacter = vi.fn();

const mockUseCharacter = {
	selectedCharacter: mockSelectedCharacter,
	characters: mockCharacters,
	selectCharacter: mockHandleSelectedCharacter,
};

vi.mock('@etnos/tools', () => ({
	useAuth: () => mockUseAuth,
	useCharacter: () => mockUseCharacter,
}));

vi.mock('../../context', () => ({
	useUser: () => mockUseUser,
}));

describe('HeaderMobile', () => {
	it('passa as props corretas e o estado inicial para MobileMenu', async () => {
		render(<HeaderMobile />);

		const menuButton = screen.getByRole('button', { name: /menu/i });

		expect(menuButton).toBeInTheDocument();

		fireEvent.click(menuButton);

		const changeCharacterButton = screen.getByRole('button', {
			name: /Alterar Personagem/i,
		});

		expect(changeCharacterButton).toBeInTheDocument();

		fireEvent.click(changeCharacterButton);

		waitFor(() => {
			const selectCharacterButton = screen.getByRole('button', {
				name: /Selecionar Personagem: Zeca/i,
			});
			expect(selectCharacterButton).toBeInTheDocument();

			fireEvent.click(selectCharacterButton);

			expect(mockHandleSelectedCharacter).toHaveBeenCalledWith('Zeca');
		});
	});
});
