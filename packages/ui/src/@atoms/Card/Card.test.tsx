import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('@atoms/Card', () => {
	it('renderiza o conteúdo filho', () => {
		render(<Card>Conteúdo do card</Card>);

		expect(screen.getByText('Conteúdo do card')).toBeInTheDocument();
	});

	it('mescla a className customizada com as classes base', () => {
		render(
			<Card className="custom-card" data-testid="card">
				Personalizado
			</Card>,
		);

		const cardElement = screen.getByTestId('card');

		expect(cardElement).toHaveClass('ui:border');
		expect(cardElement).toHaveClass('ui:bg-white');
		expect(cardElement).toHaveClass('custom-card');
	});
});
