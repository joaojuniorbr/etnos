import { isSentryEnabled } from './sentry.config';

describe('isSentryEnabled', () => {
	const originalEnv = process.env;

	beforeEach(() => {
		process.env = { ...originalEnv };
	});

	afterAll(() => {
		process.env = originalEnv;
	});

	it('deve retornar false em desenvolvimento mesmo com SENTRY_DSN', () => {
		process.env.NODE_ENV = 'development';
		process.env.SENTRY_DSN = 'https://dsn.example';

		expect(isSentryEnabled()).toBe(false);
	});

	it('deve retornar false sem SENTRY_DSN fora de desenvolvimento', () => {
		process.env.NODE_ENV = 'production';
		delete process.env.SENTRY_DSN;

		expect(isSentryEnabled()).toBe(false);
	});

	it('deve retornar true em produção com SENTRY_DSN', () => {
		process.env.NODE_ENV = 'production';
		process.env.SENTRY_DSN = 'https://dsn.example';

		expect(isSentryEnabled()).toBe(true);
	});
});
