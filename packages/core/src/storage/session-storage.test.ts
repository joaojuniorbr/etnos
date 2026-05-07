import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	AUTH_EXPIRES_AT_STORAGE_KEY,
	AUTH_LAST_ACTIVITY_STORAGE_KEY,
	AUTH_REFRESH_TOKEN_STORAGE_KEY,
	AUTH_TOKEN_STORAGE_KEY,
	createSessionStorage,
	daysToMilliseconds,
	hasSessionExceededInactivityLimit,
} from './session-storage.js';

vi.mock('axios', () => ({
	default: {
		post: vi.fn(),
	},
}));

const createStorageAdapter = () => {
	const data = new Map<string, string>();

	return {
		data,
		storage: {
			getItem: vi.fn(async (key: string) => data.get(key) ?? null),
			setItem: vi.fn(async (key: string, value: string) => {
				data.set(key, value);
			}),
			removeItem: vi.fn(async (key: string) => {
				data.delete(key);
			}),
		},
	};
};

describe('session-storage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useRealTimers();
	});

	it('converte dias para milissegundos', () => {
		expect(daysToMilliseconds(2)).toBe(172800000);
	});

	it('detecta quando a sessão excedeu o tempo de inatividade', () => {
		expect(
			hasSessionExceededInactivityLimit(1, daysToMilliseconds(9) + 1),
		).toBe(true);
		expect(hasSessionExceededInactivityLimit(1, daysToMilliseconds(1))).toBe(
			false,
		);
		expect(hasSessionExceededInactivityLimit(null)).toBe(false);
	});

	it('salva e lê a sessão armazenada', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-04-25T12:00:00.000Z'));
		const { storage, data } = createStorageAdapter();
		const sessionStorage = createSessionStorage(storage);

		await sessionStorage.saveStoredAuthSession({
			idToken: 'token',
			refreshToken: 'refresh',
			expiresIn: 60,
		});

		expect(data.get(AUTH_TOKEN_STORAGE_KEY)).toBe('token');
		expect(data.get(AUTH_REFRESH_TOKEN_STORAGE_KEY)).toBe('refresh');
		expect(data.get(AUTH_EXPIRES_AT_STORAGE_KEY)).toBe(
			String(Date.now() + 60000),
		);
		expect(data.get(AUTH_LAST_ACTIVITY_STORAGE_KEY)).toBe(String(Date.now()));

		await expect(sessionStorage.getStoredSession()).resolves.toEqual({
			token: 'token',
			refreshToken: 'refresh',
			expiresAt: Date.now() + 60000,
			lastActivityAt: Date.now(),
		});
	});

	it('salva a sessão sem expiração quando expiresIn é inválido', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-04-25T12:00:00.000Z'));
		const { storage, data } = createStorageAdapter();
		const sessionStorage = createSessionStorage(storage);

		await sessionStorage.saveStoredAuthSession({
			idToken: 'token',
			refreshToken: 'refresh',
			expiresIn: 'invalid',
		});

		expect(data.get(AUTH_TOKEN_STORAGE_KEY)).toBe('token');
		expect(data.get(AUTH_REFRESH_TOKEN_STORAGE_KEY)).toBe('refresh');
		expect(data.has(AUTH_EXPIRES_AT_STORAGE_KEY)).toBe(false);
		expect(data.get(AUTH_LAST_ACTIVITY_STORAGE_KEY)).toBe(String(Date.now()));
	});

	it('salva a sessão apenas com token quando refresh e expiração não são informados', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-04-25T12:00:00.000Z'));
		const { data, storage } = createStorageAdapter();
		const sessionStorage = createSessionStorage(storage);

		await sessionStorage.saveStoredAuthSession({
			idToken: 'token',
		});

		expect(data.get(AUTH_TOKEN_STORAGE_KEY)).toBe('token');
		expect(data.has(AUTH_REFRESH_TOKEN_STORAGE_KEY)).toBe(false);
		expect(data.has(AUTH_EXPIRES_AT_STORAGE_KEY)).toBe(false);
		expect(data.get(AUTH_LAST_ACTIVITY_STORAGE_KEY)).toBe(String(Date.now()));
	});

	it('interpreta metadados numéricos inválidos como null', async () => {
		const { data, storage } = createStorageAdapter();
		data.set(AUTH_TOKEN_STORAGE_KEY, 'token');
		data.set(AUTH_EXPIRES_AT_STORAGE_KEY, 'invalid');
		data.set(AUTH_LAST_ACTIVITY_STORAGE_KEY, 'invalid');
		const sessionStorage = createSessionStorage(storage);

		await expect(sessionStorage.getStoredSession()).resolves.toEqual({
			token: 'token',
			refreshToken: null,
			expiresAt: null,
			lastActivityAt: null,
		});
	});

	it('limpa a sessão quando token/metadata estão inconsistentes', async () => {
		const { storage, data } = createStorageAdapter();
		data.set(AUTH_TOKEN_STORAGE_KEY, 'token');
		const sessionStorage = createSessionStorage(storage);

		await expect(
			sessionStorage.resolveValidStoredAuthToken(),
		).resolves.toBeNull();
		expect(storage.removeItem).toHaveBeenCalledWith(AUTH_TOKEN_STORAGE_KEY);
	});

	it('retorna null quando não existe token armazenado', async () => {
		const { storage } = createStorageAdapter();
		const sessionStorage = createSessionStorage(storage);

		await expect(
			sessionStorage.resolveValidStoredAuthToken(),
		).resolves.toBeNull();
		expect(storage.removeItem).not.toHaveBeenCalled();
	});

	it('limpa a sessão quando a inatividade expira', async () => {
		vi.useFakeTimers();
		const { storage, data } = createStorageAdapter();
		data.set(AUTH_TOKEN_STORAGE_KEY, 'token');
		data.set(AUTH_LAST_ACTIVITY_STORAGE_KEY, '1');
		data.set(AUTH_EXPIRES_AT_STORAGE_KEY, String(daysToMilliseconds(30)));
		const sessionStorage = createSessionStorage(storage);

		vi.setSystemTime(new Date(daysToMilliseconds(9) + 1));

		await expect(
			sessionStorage.resolveValidStoredAuthToken(),
		).resolves.toBeNull();
		expect(storage.removeItem).toHaveBeenCalled();
	});

	it('retorna o token atual quando ele ainda está válido', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-04-25T12:00:00.000Z'));
		const { storage, data } = createStorageAdapter();
		data.set(AUTH_TOKEN_STORAGE_KEY, 'token');
		data.set(AUTH_LAST_ACTIVITY_STORAGE_KEY, String(Date.now()));
		data.set(AUTH_EXPIRES_AT_STORAGE_KEY, String(Date.now() + 120000));
		const sessionStorage = createSessionStorage(storage);

		await expect(sessionStorage.resolveValidStoredAuthToken()).resolves.toBe(
			'token',
		);
	});

	it('atualiza o token usando refresh token quando estiver perto de expirar', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-04-25T12:00:00.000Z'));
		const { storage, data } = createStorageAdapter();
		data.set(AUTH_TOKEN_STORAGE_KEY, 'token');
		data.set(AUTH_REFRESH_TOKEN_STORAGE_KEY, 'refresh-token');
		data.set(AUTH_LAST_ACTIVITY_STORAGE_KEY, String(Date.now()));
		data.set(AUTH_EXPIRES_AT_STORAGE_KEY, String(Date.now() + 30000));
		vi.mocked(axios.post).mockResolvedValueOnce({
			data: {
				id_token: 'new-token',
				refresh_token: 'new-refresh',
				expires_in: '120',
			},
		} as never);

		const sessionStorage = createSessionStorage(storage);

		await expect(
			sessionStorage.resolveValidStoredAuthToken('api-key'),
		).resolves.toBe('new-token');
		expect(axios.post).toHaveBeenCalled();
		expect(data.get(AUTH_TOKEN_STORAGE_KEY)).toBe('new-token');
		expect(data.get(AUTH_REFRESH_TOKEN_STORAGE_KEY)).toBe('new-refresh');
	});

	it('limpa a sessão quando não existe refresh token ou api key para renovar', async () => {
		const { storage, data } = createStorageAdapter();
		data.set(AUTH_TOKEN_STORAGE_KEY, 'token');
		const sessionStorage = createSessionStorage(storage);

		await expect(sessionStorage.refreshStoredAuthToken()).resolves.toBeNull();
		expect(storage.removeItem).toHaveBeenCalled();
	});

	it('retorna null quando a renovação não devolve token', async () => {
		const { storage, data } = createStorageAdapter();
		data.set(AUTH_REFRESH_TOKEN_STORAGE_KEY, 'refresh-token');
		vi.mocked(axios.post).mockResolvedValueOnce({
			data: {},
		} as never);
		const sessionStorage = createSessionStorage(storage);

		await expect(
			sessionStorage.refreshStoredAuthToken('api-key'),
		).resolves.toBeNull();
		expect(storage.removeItem).toHaveBeenCalled();
	});

	it('retorna o token atual quando o refresh expira por timeout mas a sessão ainda é válida', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-04-25T12:00:00.000Z'));
		const { storage, data } = createStorageAdapter();
		data.set(AUTH_TOKEN_STORAGE_KEY, 'token');
		data.set(AUTH_REFRESH_TOKEN_STORAGE_KEY, 'refresh-token');
		data.set(AUTH_LAST_ACTIVITY_STORAGE_KEY, String(Date.now()));
		data.set(AUTH_EXPIRES_AT_STORAGE_KEY, String(Date.now() + 10000));

		vi.mocked(axios.post).mockImplementationOnce(
			(_url, _body, config) =>
				new Promise((_resolve, reject) => {
					const addAbortListener = config?.signal?.addEventListener;

					if (!addAbortListener) {
						reject(new Error('missing abort listener'));
						return;
					}

					addAbortListener.call(config.signal, 'abort', () => {
						reject(new Error('aborted'));
					});
				}) as never,
		);

		const sessionStorage = createSessionStorage(storage);
		const tokenPromise = sessionStorage.refreshStoredAuthToken('api-key');

		await vi.advanceTimersByTimeAsync(5000);

		await expect(tokenPromise).resolves.toBe('token');
	});

	it('retorna null quando o refresh expira por timeout e a sessão já não está válida', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-04-25T12:00:00.000Z'));
		const { storage, data } = createStorageAdapter();
		data.set(AUTH_REFRESH_TOKEN_STORAGE_KEY, 'refresh-token');
		data.set(AUTH_EXPIRES_AT_STORAGE_KEY, String(Date.now() - 1000));

		vi.mocked(axios.post).mockImplementationOnce(
			(_url, _body, config) =>
				new Promise((_resolve, reject) => {
					const addAbortListener = config?.signal?.addEventListener;

					if (!addAbortListener) {
						reject(new Error('missing abort listener'));
						return;
					}

					addAbortListener.call(config.signal, 'abort', () => {
						reject(new Error('aborted'));
					});
				}) as never,
		);

		const sessionStorage = createSessionStorage(storage);
		const tokenPromise = sessionStorage.refreshStoredAuthToken('api-key');

		await vi.advanceTimersByTimeAsync(5000);

		await expect(tokenPromise).resolves.toBeNull();
	});

	it('propaga erro de refresh quando a requisição falha sem timeout', async () => {
		const { storage, data } = createStorageAdapter();
		data.set(AUTH_REFRESH_TOKEN_STORAGE_KEY, 'refresh-token');
		const error = new Error('network error');
		vi.mocked(axios.post).mockRejectedValueOnce(error);
		const sessionStorage = createSessionStorage(storage);

		await expect(
			sessionStorage.refreshStoredAuthToken('api-key'),
		).rejects.toThrow('network error');
	});

	it('retorna null quando o refresh token muda durante a renovação', async () => {
		const { storage, data } = createStorageAdapter();
		data.set(AUTH_REFRESH_TOKEN_STORAGE_KEY, 'refresh-token');
		vi.mocked(axios.post).mockImplementationOnce(async () => {
			data.set(AUTH_REFRESH_TOKEN_STORAGE_KEY, 'changed-refresh-token');

			return {
				data: {
					id_token: 'new-token',
					refresh_token: 'new-refresh',
					expires_in: '120',
				},
			} as never;
		});
		const sessionStorage = createSessionStorage(storage);

		await expect(
			sessionStorage.refreshStoredAuthToken('api-key'),
		).resolves.toBeNull();
		expect(data.get(AUTH_TOKEN_STORAGE_KEY)).not.toBe('new-token');
	});
});
