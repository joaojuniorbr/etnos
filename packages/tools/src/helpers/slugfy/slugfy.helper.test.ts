import { vi } from 'vitest';

import { slugfy } from './slugfy.helper';

describe('Helpers: slugfy', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve criar o slug a partir da palavra Coração', async () => {
		const mockWord = 'Coração';

		const slug = slugfy(mockWord);

		expect(slug).toBe('coracao');
	});

	it('deve criar o slug a partir da palavra "Coração de Papel" e não deve colocar nem acentuação nem espaços', async () => {
		const mockWord = 'Coração de Papel';

		const slug = slugfy(mockWord);

		expect(slug).not.toBe('coração de papel');

		expect(slug).toBe('coracao-de-papel');
	});
});
