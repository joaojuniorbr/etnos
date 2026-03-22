import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NotFound } from './NotFound';

vi.mock('next/image', () => ({
	default: ({
		alt,
		src,
		...props
	}: React.ImgHTMLAttributes<HTMLImageElement>) => (
		<img alt={alt} src={src} {...props} />
	),
}));

describe('NotFound', () => {
	it('renderiza a imagem da página 404', () => {
		const { container } = render(<NotFound />);

		expect(screen.getByAltText('Página não encontrada')).toHaveAttribute(
			'src',
			'/images/404.png'
		);
		expect(container.firstChild).toHaveClass(
			'ui:flex',
			'ui:flex-1',
			'ui:items-center',
			'ui:justify-center'
		);
	});
});
