import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MainLayout } from './MainLayout';

vi.mock('../../@molecules', () => ({
	Footer: () => <footer data-testid='footer'>Footer</footer>,
}));

vi.mock('../../@organisms', () => ({
	Header: () => <header data-testid='header'>Header</header>,
}));

describe('MainLayout', () => {
	it('deve renderizar o Header, Footer e o conteúdo (children) corretamente', () => {
		render(
			<MainLayout>
				<div data-testid='child-content'>Conteúdo da Página</div>
			</MainLayout>
		);

		expect(screen.getByTestId('header')).toBeInTheDocument();
		expect(screen.getByTestId('footer')).toBeInTheDocument();
		expect(screen.getByTestId('child-content')).toBeInTheDocument();
	});
});
