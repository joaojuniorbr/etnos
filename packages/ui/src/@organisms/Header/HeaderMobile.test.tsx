import { act, fireEvent, render, screen } from '@testing-library/react';
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
	data: mockCharacters,
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
	it('abre menu, abre modal e seleciona personagem', async () => {
		render(<HeaderMobile />);

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

		const selectCharacterButton = screen.getByRole('button', {
			name: /Selecionar Personagem: Zeca/i,
		});

		await act(async () => {
			fireEvent.click(selectCharacterButton);
		});

		expect(mockHandleSelectedCharacter).toHaveBeenCalledWith('zeca');
	});
});
