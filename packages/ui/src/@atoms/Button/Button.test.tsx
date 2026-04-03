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

	it('aplica estilo secundario e mapeia type para default', () => {
		render(<Button type="secondary">Secundario</Button>);

		const buttonElement = screen.getByRole('button', { name: /secundario/i });

		expect(buttonElement).toHaveClass('ui:bg-secondary!');
		expect(buttonElement).toHaveClass('ui:text-primary!');
		expect(buttonElement).toHaveClass('ui:font-bold!');
		expect(buttonElement).toHaveClass('ant-btn-default');
		expect(buttonElement).not.toHaveClass('ant-btn-primary');
	});

	it('aplica estilo xl e mapeia size para large', () => {
		render(<Button size="xl">Grande</Button>);

		const buttonElement = screen.getByRole('button', { name: /grande/i });

		expect(buttonElement).toHaveClass('ui:px-10!');
		expect(buttonElement).toHaveClass('ui:py-6!');
		expect(buttonElement).toHaveClass('ui:text-base!');
		expect(buttonElement).toHaveClass('ui:md:text-xl!');
		expect(buttonElement).toHaveClass('ui:md:px-12!');
		expect(buttonElement).toHaveClass('ui:md:py-8!');
		expect(buttonElement).toHaveClass('ant-btn-lg');
	});
});
