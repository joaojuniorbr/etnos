import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRandomIndex } from './getRandomIndex';

describe('getRandomIndex', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve retornar um número dentro do intervalo permitido', () => {
		const max = 10;
		const result = getRandomIndex(max);

		expect(result).toBeGreaterThanOrEqual(0);
		expect(result).toBeLessThan(max);
		expect(Number.isInteger(result)).toBe(true);
	});

	it('deve retornar 0 quando o valor de crypto for o mínimo (0)', () => {
		const spy = vi
			.spyOn(crypto, 'getRandomValues')
			.mockImplementation((buffer) => {
				(buffer as Uint32Array)[0] = 0;
				return buffer;
			});

		const result = getRandomIndex(100);
		expect(result).toBe(0);
		spy.mockRestore();
	});

	it('deve gerar valores diferentes (teste de distribuição básica)', () => {
		const results = new Set();
		for (let i = 0; i < 100; i++) {
			results.add(getRandomIndex(1000000));
		}
		expect(results.size).toBeGreaterThan(1);
	});
});
