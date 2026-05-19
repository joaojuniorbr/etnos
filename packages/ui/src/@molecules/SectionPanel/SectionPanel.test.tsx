import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SectionPanel } from './SectionPanel';

describe('@molecules/SectionPanel', () => {
	it('renderiza título, conteúdo e ação opcional', () => {
		render(
			<SectionPanel title="Ranking da turma" action={<button type="button">Ver tudo</button>}>
				<p>Conteúdo do painel</p>
			</SectionPanel>,
		);

		expect(screen.getByRole('heading', { name: 'Ranking da turma' })).toBeInTheDocument();
		expect(screen.getByText('Conteúdo do painel')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Ver tudo' })).toBeInTheDocument();
	});
});
