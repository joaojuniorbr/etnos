import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from './Footer';

describe('Footer', () => {
	it('renderiza o link para a home', () => {
		render(<Footer />);
		const link = screen.getByRole('link');
		expect(link).toHaveAttribute('href', '/');
	});

	it('renderiza a imagem da marca com src e alt corretos', () => {
		render(<Footer />);
		const img = screen.getByRole('img', { name: /etnos/i });
		expect(img).toHaveAttribute('src', '/images/brand-horizontal.svg');
		expect(img).toHaveAttribute('alt', 'Etnos');
	});

	it('renderiza o texto com o ano atual', () => {
		render(<Footer />);
		const year = new Date().getFullYear();
		const text = screen.getByText(
			new RegExp(`Etnos © ${year}\\. Todos os Direitos Reservados`, 'i')
		);
		expect(text).toBeInTheDocument();
	});
});
