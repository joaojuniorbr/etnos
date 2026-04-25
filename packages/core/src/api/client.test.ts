import type { InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from './client.js';

const createRequestConfig = (
	headers: Record<string, string> = {},
): InternalAxiosRequestConfig =>
	({
		headers: headers as unknown as InternalAxiosRequestConfig['headers'],
	}) as InternalAxiosRequestConfig;

const getRequestInterceptor = (api: ReturnType<typeof createApiClient>) => {
	const interceptor = api.interceptors.request.handlers?.[0]?.fulfilled;

	expect(interceptor).toBeTypeOf('function');

	return interceptor!;
};

describe('createApiClient', () => {
	it('cria cliente com baseURL e adiciona token quando existir', async () => {
		const resolveToken = vi.fn().mockResolvedValue('token-123');
		const onRequestAuthenticated = vi.fn();
		const api = createApiClient({
			baseURL: 'https://api.example.com',
			resolveToken,
			onRequestAuthenticated,
		});

		expect(api.defaults.baseURL).toBe('https://api.example.com');

		const interceptor = getRequestInterceptor(api);

		const config = (await interceptor?.(
			createRequestConfig(),
		)) as InternalAxiosRequestConfig;

		expect(resolveToken).toHaveBeenCalled();
		expect(config.headers?.Authorization).toBe('Bearer token-123');
		expect(onRequestAuthenticated).toHaveBeenCalled();
	});

	it('mantém a configuração original quando não houver token', async () => {
		const resolveToken = vi.fn().mockResolvedValue(null);
		const onRequestAuthenticated = vi.fn();
		const api = createApiClient({
			resolveToken,
			onRequestAuthenticated,
		});

		const interceptor = getRequestInterceptor(api);
		const originalConfig = createRequestConfig({ 'X-Test': 'ok' });

		const config = (await interceptor?.(originalConfig)) as InternalAxiosRequestConfig;

		expect(config).toBe(originalConfig);
		expect(onRequestAuthenticated).not.toHaveBeenCalled();
	});

	it('não tenta autenticar quando resolveToken não for informado', async () => {
		const api = createApiClient();
		const interceptor = getRequestInterceptor(api);
		const originalConfig = createRequestConfig();

		const config = (await interceptor?.(originalConfig)) as InternalAxiosRequestConfig;

		expect(config).toBe(originalConfig);
	});
});
