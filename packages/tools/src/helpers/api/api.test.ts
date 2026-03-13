import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createApiClient, AUTH_TOKEN_STORAGE_KEY } from './api.js';

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

describe('createApiClient', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('deve criar cliente axios com baseURL informada', async () => {
		createApiClient('http://localhost:3000');

		expect(createMock).toHaveBeenCalledWith({
			baseURL: 'http://localhost:3000',
		});
		expect(requestUseMock).toHaveBeenCalledTimes(createMock.mock.calls.length);
	});

	it('deve adicionar Authorization quando houver token no localStorage', async () => {
		const localStorageMock = {
			getItem: vi.fn().mockReturnValue('token-123'),
		};
		vi.stubGlobal('window', {
			localStorage: localStorageMock,
		} as unknown as Window);

		createApiClient('http://localhost:3000');

		const interceptor = requestUseMock.mock.calls[0]?.[0];
		expect(interceptor).toBeTypeOf('function');
		if (!interceptor) return;

		const config = interceptor({ headers: {} } as any);

		expect(localStorageMock.getItem).toHaveBeenCalledWith(AUTH_TOKEN_STORAGE_KEY);
		expect(config.headers.Authorization).toBe('Bearer token-123');
	});

	it('não deve quebrar em ambiente sem window', async () => {
		vi.stubGlobal('window', undefined);

		createApiClient('http://localhost:3000');

		const interceptor = requestUseMock.mock.calls[0]?.[0];
		expect(interceptor).toBeTypeOf('function');
		if (!interceptor) return;

		const originalConfig = { headers: {} } as any;
		const config = interceptor(originalConfig);

		expect(config).toEqual(originalConfig);
	});

	it('não deve adicionar Authorization quando token não existir', async () => {
		const localStorageMock = {
			getItem: vi.fn().mockReturnValue(null),
		};
		vi.stubGlobal('window', {
			localStorage: localStorageMock,
		} as unknown as Window);

		createApiClient('http://localhost:3000');

		const interceptor = requestUseMock.mock.calls[0]?.[0];
		expect(interceptor).toBeTypeOf('function');
		if (!interceptor) return;

		const originalConfig = { headers: {} } as any;
		const config = interceptor(originalConfig);

		expect(localStorageMock.getItem).toHaveBeenCalledWith(AUTH_TOKEN_STORAGE_KEY);
		expect(config).toEqual(originalConfig);
		expect(config.headers.Authorization).toBeUndefined();
	});
});
