import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApiClient } from './api.js';

const { requestUseMock, createMock } = vi.hoisted(() => {
	const requestUse = vi.fn();
	const create = vi.fn(() => ({
		interceptors: {
			request: {
				use: requestUse,
			},
		},
	}));

	return {
		requestUseMock: requestUse,
		createMock: create,
	};
});

const { resolveValidStoredAuthTokenMock, updateAuthActivityMock } = vi.hoisted(
	() => ({
		resolveValidStoredAuthTokenMock: vi.fn(),
		updateAuthActivityMock: vi.fn(),
	}),
);

vi.mock('axios', () => ({
	AxiosHeaders: {
		from: (headers?: Record<string, string>) => ({
			...(headers ?? {}),
			set(key: string, value: string) {
				Object.assign(this, {
					[key]: value,
				});
			},
		}),
	},
	default: {
		create: createMock,
	},
}));

vi.mock('../authSession', () => ({
	resolveValidStoredAuthToken: resolveValidStoredAuthTokenMock,
	updateAuthActivity: updateAuthActivityMock,
}));

describe('createApiClient', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('deve criar cliente axios com baseURL informada', () => {
		createApiClient('http://localhost:3000');

		expect(createMock).toHaveBeenCalledWith({
			baseURL: 'http://localhost:3000',
		});
		expect(requestUseMock).toHaveBeenCalledTimes(createMock.mock.calls.length);
	});

	it('deve adicionar Authorization quando a sessão devolver token válido', async () => {
		resolveValidStoredAuthTokenMock.mockResolvedValueOnce('token-123');
		vi.stubGlobal('window', {
			localStorage: {},
		} as unknown as Window);

		createApiClient('http://localhost:3000');

		const interceptor = requestUseMock.mock.calls[0]?.[0];
		expect(interceptor).toBeTypeOf('function');
		if (!interceptor) return;

		const config = await interceptor({ headers: {} } as any);

		expect(resolveValidStoredAuthTokenMock).toHaveBeenCalledTimes(1);
		expect(config.headers.Authorization).toBe('Bearer token-123');
		expect(updateAuthActivityMock).toHaveBeenCalledTimes(1);
	});

	it('não deve adicionar Authorization quando não houver token válido', async () => {
		resolveValidStoredAuthTokenMock.mockResolvedValueOnce(null);
		vi.stubGlobal('window', {
			localStorage: {},
		} as unknown as Window);

		createApiClient('http://localhost:3000');

		const interceptor = requestUseMock.mock.calls[0]?.[0];
		expect(interceptor).toBeTypeOf('function');
		if (!interceptor) return;

		const originalConfig = { headers: {} } as any;
		const config = await interceptor(originalConfig);

		expect(config).toEqual(originalConfig);
		expect(updateAuthActivityMock).not.toHaveBeenCalled();
	});

	it('não deve quebrar em ambiente sem window', async () => {
		vi.stubGlobal('window', undefined);

		createApiClient('http://localhost:3000');

		const interceptor = requestUseMock.mock.calls[0]?.[0];
		expect(interceptor).toBeTypeOf('function');
		if (!interceptor) return;

		const originalConfig = { headers: {} } as any;
		const config = await interceptor(originalConfig);

		expect(config).toEqual(originalConfig);
		expect(resolveValidStoredAuthTokenMock).not.toHaveBeenCalled();
	});
});
