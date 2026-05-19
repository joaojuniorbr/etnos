import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ClassRankingList } from './ClassRankingList';

describe('@molecules/ClassRankingList', () => {
	it('renderiza estado vazio quando não há entradas', () => {
		render(<ClassRankingList entries={[]} />);

		expect(
			screen.getByText(/Ranking indisponível/i),
		).toBeInTheDocument();
	});

	it('renderiza medalhas do pódio e fallback para outras posições', () => {
		const { container } = render(
			<ClassRankingList
				entries={[
					{
						rank: 1,
						initials: 'JP',
						name: 'João Pedro',
						score: 2100,
						isCurrentUser: false,
					},
					{
						rank: 2,
						initials: 'ML',
						name: 'Maria Luiza',
						score: 1800,
						isCurrentUser: false,
					},
					{
						rank: 3,
						initials: 'AS',
						name: 'Ana Silva',
						score: 1250,
						isCurrentUser: true,
					},
					{
						rank: 4,
						initials: 'LC',
						name: 'Lucas Costa',
						score: 900,
						isCurrentUser: false,
					},
				]}
			/>,
		);

		expect(screen.getByText('João Pedro')).toBeInTheDocument();
		expect(screen.getByText('Ana Silva')).toBeInTheDocument();
		expect(screen.getByText('(você)')).toBeInTheDocument();
		expect(screen.getByText('Lucas Costa')).toBeInTheDocument();
		expect(screen.getByText('2.100')).toBeInTheDocument();

		const rankBadges = container.querySelectorAll('li > span:first-child');
		expect(rankBadges[0]).toHaveClass('ui:bg-secondary');
		expect(rankBadges[1]).toHaveClass('ui:bg-slate-300');
		expect(rankBadges[2]).toHaveClass('ui:bg-amber-700');
		expect(rankBadges[3]).toHaveClass('ui:bg-primary/10');
	});
});
