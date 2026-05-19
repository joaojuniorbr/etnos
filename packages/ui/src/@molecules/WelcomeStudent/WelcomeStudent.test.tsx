import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { WelcomeStudent } from './WelcomeStudent';

describe('@molecules/WelcomeStudent', () => {
	it('renderiza saudação com o nome do estudante', () => {
		render(<WelcomeStudent name="Ana" />);

		expect(
			screen.getByRole('heading', { name: /Olá Ana/i }),
		).toBeInTheDocument();
		expect(
			screen.getByText(/Hoje é um ótimo dia para aprender sobre o Brasil/i),
		).toBeInTheDocument();
	});
});
