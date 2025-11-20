import { vi } from 'vitest';

import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('@atoms/Button', () => {
	it('renderiza o texto passado como children', () => {
		render(<Button>Botão</Button>);

		const buttonElement = screen.getByRole('button', { name: /botão/i });

		expect(buttonElement).toBeInTheDocument();
	});

	it('chama onClick quando clicado', async () => {
		const onClick = vi.fn();

		render(<Button onClick={onClick}>Clique</Button>);

		const buttonElement = screen.getByRole('button', { name: /clique/i });

		await buttonElement.click();

		expect(onClick).toHaveBeenCalledTimes(1);
	});
});
