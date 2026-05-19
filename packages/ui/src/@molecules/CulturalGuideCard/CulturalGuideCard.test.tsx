import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { mockCharacter } from '@ui/test/fixtures';

import { CulturalGuideCard } from './CulturalGuideCard';

describe('@molecules/CulturalGuideCard', () => {
	it('renderiza dados do guia e dispara onChangeGuide', () => {
		const onChangeGuide = vi.fn();

		render(
			<CulturalGuideCard guide={mockCharacter} onChangeGuide={onChangeGuide} />,
		);

		expect(screen.getByText('Seu guia cultural')).toBeInTheDocument();
		expect(screen.getByText('Iara')).toBeInTheDocument();
		expect(screen.getByText(mockCharacter.description)).toBeInTheDocument();

		const image = screen.getByRole('img', { name: 'Iara' });
		expect(image).toHaveAttribute('src', mockCharacter.imageUrl);

		fireEvent.click(screen.getByRole('button', { name: /Trocar guia/i }));

		expect(onChangeGuide).toHaveBeenCalledTimes(1);
	});

	it('usa imagem padrão quando imageUrl não está definida', () => {
		render(
			<CulturalGuideCard
				guide={{ ...mockCharacter, imageUrl: undefined }}
				onChangeGuide={vi.fn()}
			/>,
		);

		const image = screen.getByRole('img', { name: 'Iara' });
		expect(image).toHaveAttribute('src', '/images/character/md/iara.png');
	});
});
