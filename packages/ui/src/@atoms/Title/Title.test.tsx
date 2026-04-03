import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Title } from './Title';

describe('Title', () => {
	it('renderiza o conteúdo e aplica as classes e props recebidas', () => {
		render(
			<Title className="custom-class" data-testid="title">
				Titulo
			</Title>,
		);

		const title = screen.getByTestId('title');

		expect(title).toHaveTextContent('Titulo');
		expect(title).toHaveClass(
			'ui:text-xl',
			'ui:font-black',
			'ui:uppercase',
			'ui:text-primary',
			'custom-class',
		);
	});
});
