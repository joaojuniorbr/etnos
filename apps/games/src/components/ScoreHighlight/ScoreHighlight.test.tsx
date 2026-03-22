// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { ScoreHighlight } from './ScoreHighlight';

describe('ScoreHighlight', () => {
	it('renderiza ícone, rótulo, score e classes extras', () => {
		render(
			<ScoreHighlight
				icon={<span data-testid='icon'>Icone</span>}
				label='Pontuação'
				score={120}
				className='custom-class'
				data-testid='score-highlight'
			/>
		);

		expect(screen.getByTestId('icon')).toBeTruthy();
		expect(screen.getByText('120')).toBeTruthy();
		expect(screen.getByText('Pontuação')).toBeTruthy();
		expect(
			screen.getByTestId('score-highlight').className.includes('custom-class')
		).toBe(true);
	});
});
