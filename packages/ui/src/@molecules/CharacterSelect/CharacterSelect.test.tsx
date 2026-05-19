import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { mockCharacters } from '@ui/test/fixtures';

import { CharacterSelect } from './CharacterSelect';

describe('@molecules/CharacterSelect', () => {
	it('renderiza personagens e chama onSelect ao clicar', () => {
		const onSelect = vi.fn();

		render(
			<CharacterSelect
				characters={mockCharacters}
				selectedCharacter={mockCharacters[0]}
				onSelect={onSelect}
			/>,
		);

		expect(
			screen.getByRole('button', { name: /Selecionar Personagem: Iara/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /Selecionar Personagem: Saci/i }),
		).toBeInTheDocument();

		fireEvent.click(
			screen.getByRole('button', { name: /Selecionar Personagem: Saci/i }),
		);

		expect(onSelect).toHaveBeenCalledWith(mockCharacters[1]);
	});
});
