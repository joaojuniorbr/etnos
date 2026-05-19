import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ActivityRow } from './ActivityRow';

const mockActivity = {
	id: 'activity-1',
	description: 'Pontuou no Jogo da Memória',
	highlight: '+120',
	gameSlug: 'memory-game',
	characterSlug: 'iara',
	timestamp: '2026-05-18T10:00:00.000Z',
	points: 120,
	coverUrl: null,
} as const;

describe('@molecules/ActivityRow', () => {
	it('renderiza descrição, destaque, pontos e tempo relativo', () => {
		render(<ActivityRow activity={mockActivity} relativeTime="Hoje" />);

		expect(
			screen.getByText(/Pontuou no Jogo da Memória/i),
		).toBeInTheDocument();
		expect(screen.getByText('Hoje')).toBeInTheDocument();
		expect(screen.getAllByText('+120').length).toBeGreaterThanOrEqual(1);
	});

	it('usa capa padrão quando coverUrl é nulo', () => {
		render(<ActivityRow activity={mockActivity} relativeTime="Ontem" />);

		const image = screen.getByRole('img', { name: 'memory-game' });
		expect(image).toHaveAttribute(
			'src',
			'/games/memory-game/cover/iara.jpg',
		);
	});

	it('usa coverUrl customizada quando informada', () => {
		render(
			<ActivityRow
				activity={{
					...mockActivity,
					coverUrl: 'https://cdn.etnos.test/cover.jpg',
				}}
				relativeTime="Hoje"
			/>,
		);

		const image = screen.getByRole('img', { name: 'memory-game' });
		expect(image).toHaveAttribute('src', 'https://cdn.etnos.test/cover.jpg');
	});
});
