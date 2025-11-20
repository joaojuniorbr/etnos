import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CharacterCard } from './CharacterCard';

vi.mock('next/image', () => ({
	default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
		return <img {...props} />;
	},
}));

const mockCharacter = {
	slug: 'aragorn',
	name: 'Aragorn',
	region: 'Gondor',
	description: 'Descrição do personagem',
} as const;

describe('@atoms/CharacterCard', () => {
	it('renderiza nome, região e imagem corretamente', () => {
		render(<CharacterCard character={mockCharacter} />);

		expect(screen.getByText(/aragorn/i)).toBeInTheDocument();
		expect(screen.getByText(/gondor/i)).toBeInTheDocument();
		const img = screen.getByRole('img', { name: /aragorn/i });
		expect(img).toHaveAttribute('src', '/images/character/md/aragorn.png');
		expect(img).toHaveAttribute('alt', 'Aragorn');
	});

	it('aplica classe ui:border-primary quando selected=true', () => {
		const { container } = render(
			<CharacterCard character={mockCharacter} selected />
		);
		expect(container.firstChild).toHaveClass('ui:border-primary');
	});

	it('aplica classe ui:border-white quando selected=false', () => {
		const { container } = render(
			<CharacterCard character={mockCharacter} selected={false} />
		);
		expect(container.firstChild).toHaveClass('ui:border-white');
	});

	it('prop extra é repassada para o div', () => {
		render(<CharacterCard character={mockCharacter} data-testid='card-test' />);
		expect(screen.getByTestId('card-test')).toBeInTheDocument();
	});
});
