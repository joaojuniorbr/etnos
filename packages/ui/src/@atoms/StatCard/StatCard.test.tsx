import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StatCard } from './StatCard';

describe('@atoms/StatCard', () => {
	it('renderiza label, valor e ícone', () => {
		render(<StatCard label="Pontuação total" value="1.250" icon="🏆" />);

		expect(screen.getByText('Pontuação total')).toBeInTheDocument();
		expect(screen.getByText('1.250')).toBeInTheDocument();
		expect(screen.getByText('🏆')).toBeInTheDocument();
	});

	it('repassa className e props extras para o container', () => {
		render(
			<StatCard
				label="Jogos"
				value={3}
				icon="🎮"
				className="custom-class"
				data-testid="stat-card"
			/>,
		);

		expect(screen.getByTestId('stat-card')).toHaveClass('custom-class');
	});
});
