import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MainLayout } from './MainLayout';

vi.mock('@ui/@molecules', () => ({
	Footer: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('@ui/@organisms', () => ({
	Header: () => <header data-testid="header">Header</header>,
}));

describe('@templates/MainLayout', () => {
	it('renderiza header, conteúdo e footer', () => {
		const html = renderToStaticMarkup(
			<MainLayout>
				<div data-testid="child-content">Conteúdo da Página</div>
			</MainLayout>,
		);

		expect(html).toContain('data-testid="header"');
		expect(html).toContain('data-testid="footer"');
		expect(html).toContain('data-testid="child-content"');
	});
});
