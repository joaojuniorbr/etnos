import { formatPhoneBR, normalizePhone } from './phone.helper';

describe('Helpers: Phone', () => {
	it('deve normalizar o telefone removendo caracteres não numéricos', () => {
		expect(normalizePhone('(41) 99999-1234')).toBe('41999991234');
	});

	it('deve formatar telefone com 10 dígitos', () => {
		expect(formatPhoneBR('4133331234')).toBe('(41) 3333-1234');
	});

	it('deve formatar telefone com 11 dígitos', () => {
		expect(formatPhoneBR('41999991234')).toBe('(41) 99999-1234');
	});

	it('deve manter a formatação parcial enquanto o usuário digita', () => {
		expect(formatPhoneBR('4')).toBe('(4');
		expect(formatPhoneBR('419')).toBe('(41) 9');
		expect(formatPhoneBR('4199999')).toBe('(41) 9999-9');
		expect(formatPhoneBR('41999991')).toBe('(41) 9999-91');
	});

	it('deve limitar a formatação em 11 dígitos', () => {
		expect(formatPhoneBR('4199999123456')).toBe('(41) 99999-1234');
	});

	it('deve retornar vazio quando não houver dígitos', () => {
		expect(formatPhoneBR('abc')).toBe('');
	});
});
