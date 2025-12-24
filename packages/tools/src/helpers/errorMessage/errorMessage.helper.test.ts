import { vi } from 'vitest';

import { errorMessage } from './errorMessage.helper';

describe('Helpers: ErrorMessage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve retornar a mensagem de erro quando for do type: Error', () => {
		const error = new Error('Erro de teste');
		const result = errorMessage(error);
		expect(result).toBe(error.message);
	});

	it('deve retornar a mensagem padrão de erro quando for do type: string', () => {
		const error = 'Erro de teste';
		const result = errorMessage(error);
		expect(result).toBe('Ocorreu um erro inesperado.');
	});

	it('dever retornar uma mensagem customizada quando o type: string', () => {
		const error = 'Erro de teste';
		const result = errorMessage(error, 'Mensagem de Erro');
		expect(result).toBe('Mensagem de Erro');
	});
});
