import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	AUTH_EXPIRES_AT_STORAGE_KEY,
	AUTH_INACTIVITY_LIMIT_IN_DAYS,
	AUTH_INACTIVITY_LIMIT_MS,
	AUTH_LAST_ACTIVITY_STORAGE_KEY,
	AUTH_REFRESH_TOKEN_STORAGE_KEY,
	AUTH_TOKEN_STORAGE_KEY,
	clearStoredAuthSession,
	daysToMilliseconds,
	getStoredSession,
	hasSessionExceededInactivityLimit,
	refreshStoredAuthToken,
	resolveValidStoredAuthToken,
	saveStoredAuthSession,
	updateAuthActivity,
} from './authSession.js';

const { axiosPostMock } = vi.hoisted(() => ({
	axiosPostMock: vi.fn(),
}));

vi.mock('axios', () => ({
	default: {
		post: axiosPostMock,
	},
}));

describe('authSession', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.unstubAllEnvs();
		vi.useRealTimers();
	});

	it('converte dias em milissegundos de forma legível', () => {
		expect(daysToMilliseconds(8)).toBe(8 * 24 * 60 * 60 * 1000);
		expect(AUTH_INACTIVITY_LIMIT_IN_DAYS).toBe(8);
		expect(AUTH_INACTIVITY_LIMIT_MS).toBe(daysToMilliseconds(8));
	});

	it('lê sessão armazenada do localStorage', () => {
		vi.stubGlobal('window', {
			localStorage: {
				getItem: vi.fn((key: string) => {
					if (key === AUTH_TOKEN_STORAGE_KEY) return 'token-123';
					if (key === AUTH_REFRESH_TOKEN_STORAGE_KEY) return 'refresh-123';
					if (key === AUTH_EXPIRES_AT_STORAGE_KEY) return '1000';
					if (key === AUTH_LAST_ACTIVITY_STORAGE_KEY) return '2000';
					return null;
				}),
			},
		} as unknown as Window);

		expect(getStoredSession()).toEqual({
			token: 'token-123',
			refreshToken: 'refresh-123',
			expiresAt: 1000,
			lastActivityAt: 2000,
		});
	});

	it('retorna sessão vazia quando não há window', () => {
		vi.stubGlobal('window', undefined);

		expect(getStoredSession()).toEqual({
			token: null,
			refreshToken: null,
			expiresAt: null,
			lastActivityAt: null,
		});
	});

	it('atualiza a última atividade', () => {
		const setItem = vi.fn();
		vi.stubGlobal('window', {
			localStorage: {
				setItem,
			},
		} as unknown as Window);

		updateAuthActivity(12345);

		expect(setItem).toHaveBeenCalledWith(
			AUTH_LAST_ACTIVITY_STORAGE_KEY,
			'12345'
		);
	});

	it('salva token, refresh token e expiração', () => {
		const setItem = vi.fn();
		vi.stubGlobal('window', {
			localStorage: {
				setItem,
			},
		} as unknown as Window);

		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-03-19T12:00:00Z'));

		saveStoredAuthSession({
			idToken: 'token-123',
			refreshToken: 'refresh-123',
			expiresIn: '3600',
		});

		expect(setItem).toHaveBeenCalledWith(AUTH_TOKEN_STORAGE_KEY, 'token-123');
		expect(setItem).toHaveBeenCalledWith(
			AUTH_REFRESH_TOKEN_STORAGE_KEY,
			'refresh-123'
		);
		expect(setItem).toHaveBeenCalledWith(
			AUTH_EXPIRES_AT_STORAGE_KEY,
			String(Date.now() + 3600 * 1000)
		);
		expect(setItem).toHaveBeenCalledWith(
			AUTH_LAST_ACTIVITY_STORAGE_KEY,
			String(Date.now())
		);
	});

	it('limpa toda a sessão armazenada', () => {
		const removeItem = vi.fn();
		vi.stubGlobal('window', {
			localStorage: {
				removeItem,
			},
		} as unknown as Window);

		clearStoredAuthSession();

		expect(removeItem).toHaveBeenCalledWith(AUTH_TOKEN_STORAGE_KEY);
		expect(removeItem).toHaveBeenCalledWith(AUTH_REFRESH_TOKEN_STORAGE_KEY);
		expect(removeItem).toHaveBeenCalledWith(AUTH_EXPIRES_AT_STORAGE_KEY);
		expect(removeItem).toHaveBeenCalledWith(AUTH_LAST_ACTIVITY_STORAGE_KEY);
	});

	it('identifica quando a sessão excedeu o limite de inatividade', () => {
		const now = Date.now();

		expect(
			hasSessionExceededInactivityLimit(
				now - AUTH_INACTIVITY_LIMIT_MS - 1,
				now
			)
		).toBe(true);
		expect(
			hasSessionExceededInactivityLimit(
				now - AUTH_INACTIVITY_LIMIT_MS + 1,
				now
			)
		).toBe(false);
	});

	it('renova token usando refresh token armazenado', async () => {
		const storage = new Map<string, string>([
			[AUTH_TOKEN_STORAGE_KEY, 'token-antigo'],
			[AUTH_REFRESH_TOKEN_STORAGE_KEY, 'refresh-antigo'],
		]);

		vi.stubGlobal('window', {
			localStorage: {
				getItem: vi.fn((key: string) => storage.get(key) ?? null),
				setItem: vi.fn((key: string, value: string) => {
					storage.set(key, value);
				}),
				removeItem: vi.fn((key: string) => {
					storage.delete(key);
				}),
			},
		} as unknown as Window);

		axiosPostMock.mockResolvedValueOnce({
			data: {
				id_token: 'token-novo',
				refresh_token: 'refresh-novo',
				expires_in: '7200',
			},
		});

		const refreshedToken = await refreshStoredAuthToken('firebase-key');

		expect(refreshedToken).toBe('token-novo');
		expect(axiosPostMock).toHaveBeenCalledTimes(1);
		expect(storage.get(AUTH_TOKEN_STORAGE_KEY)).toBe('token-novo');
		expect(storage.get(AUTH_REFRESH_TOKEN_STORAGE_KEY)).toBe('refresh-novo');
	});

	it('não persiste refresh quando a sessão mudou durante a requisição', async () => {
		const storage = new Map<string, string>([
			[AUTH_TOKEN_STORAGE_KEY, 'token-antigo'],
			[AUTH_REFRESH_TOKEN_STORAGE_KEY, 'refresh-antigo'],
			[AUTH_EXPIRES_AT_STORAGE_KEY, String(Date.now() + 5 * 60 * 1000)],
		]);

		vi.stubGlobal('window', {
			localStorage: {
				getItem: vi.fn((key: string) => storage.get(key) ?? null),
				setItem: vi.fn((key: string, value: string) => {
					storage.set(key, value);
				}),
				removeItem: vi.fn((key: string) => {
					storage.delete(key);
				}),
			},
		} as unknown as Window);

		axiosPostMock.mockImplementationOnce(async () => {
			storage.set(AUTH_TOKEN_STORAGE_KEY, 'token-novo-login');
			storage.set(AUTH_REFRESH_TOKEN_STORAGE_KEY, 'refresh-novo-login');

			return {
				data: {
					id_token: 'token-refresh-antigo',
					refresh_token: 'refresh-refresh-antigo',
					expires_in: '7200',
				},
			};
		});

		await expect(refreshStoredAuthToken('firebase-key')).resolves.toBeNull();
		expect(storage.get(AUTH_TOKEN_STORAGE_KEY)).toBe('token-novo-login');
		expect(storage.get(AUTH_REFRESH_TOKEN_STORAGE_KEY)).toBe(
			'refresh-novo-login'
		);
	});

	it('limpa sessão quando a resposta de refresh não retorna novo token', async () => {
		const removeItem = vi.fn();
		vi.stubGlobal('window', {
			localStorage: {
				getItem: vi.fn((key: string) => {
					if (key === AUTH_REFRESH_TOKEN_STORAGE_KEY) return 'refresh-antigo';
					return null;
				}),
				removeItem,
				setItem: vi.fn(),
			},
		} as unknown as Window);

		axiosPostMock.mockResolvedValueOnce({
			data: {
				refresh_token: 'refresh-novo',
				expires_in: '7200',
			},
		});

		await expect(refreshStoredAuthToken('firebase-key')).resolves.toBeNull();
		expect(removeItem).toHaveBeenCalledWith(AUTH_TOKEN_STORAGE_KEY);
	});

	it('encerra sessão quando o refresh token não estiver disponível', async () => {
		const removeItem = vi.fn();
		vi.stubGlobal('window', {
			localStorage: {
				getItem: vi.fn((key: string) =>
					key === AUTH_TOKEN_STORAGE_KEY ? 'token-123' : null
				),
				removeItem,
			},
		} as unknown as Window);

		const refreshedToken = await refreshStoredAuthToken('firebase-key');

		expect(refreshedToken).toBeNull();
		expect(removeItem).toHaveBeenCalledWith(AUTH_TOKEN_STORAGE_KEY);
	});

	it('resolve o token atual quando ele ainda está válido', async () => {
		const now = Date.now();
		vi.stubGlobal('window', {
			localStorage: {
				getItem: vi.fn((key: string) => {
					if (key === AUTH_TOKEN_STORAGE_KEY) return 'token-123';
					if (key === AUTH_EXPIRES_AT_STORAGE_KEY) return String(now + 5 * 60 * 1000);
					if (key === AUTH_LAST_ACTIVITY_STORAGE_KEY) return String(now);
					return null;
				}),
				removeItem: vi.fn(),
			},
		} as unknown as Window);

		await expect(resolveValidStoredAuthToken()).resolves.toBe('token-123');
		expect(axiosPostMock).not.toHaveBeenCalled();
	});

	it('descarta sessão legada com apenas token armazenado', async () => {
		const removeItem = vi.fn();

		vi.stubGlobal('window', {
			localStorage: {
				getItem: vi.fn((key: string) =>
					key === AUTH_TOKEN_STORAGE_KEY ? 'token-legado' : null
				),
				removeItem,
			},
		} as unknown as Window);

		await expect(resolveValidStoredAuthToken()).resolves.toBeNull();
		expect(removeItem).toHaveBeenCalledWith(AUTH_TOKEN_STORAGE_KEY);
		expect(removeItem).toHaveBeenCalledWith(AUTH_REFRESH_TOKEN_STORAGE_KEY);
		expect(removeItem).toHaveBeenCalledWith(AUTH_EXPIRES_AT_STORAGE_KEY);
		expect(removeItem).toHaveBeenCalledWith(AUTH_LAST_ACTIVITY_STORAGE_KEY);
	});

	it('renova o token quando a expiração está próxima', async () => {
		const storage = new Map<string, string>();
		const now = Date.now();
		vi.stubEnv('NEXT_PUBLIC_FIREBASE_API_KEY', 'firebase-key');

		storage.set(AUTH_TOKEN_STORAGE_KEY, 'token-antigo');
		storage.set(AUTH_REFRESH_TOKEN_STORAGE_KEY, 'refresh-antigo');
		storage.set(AUTH_EXPIRES_AT_STORAGE_KEY, String(now + 30 * 1000));
		storage.set(AUTH_LAST_ACTIVITY_STORAGE_KEY, String(now));

		vi.stubGlobal('window', {
			localStorage: {
				getItem: vi.fn((key: string) => storage.get(key) ?? null),
				setItem: vi.fn((key: string, value: string) => {
					storage.set(key, value);
				}),
				removeItem: vi.fn((key: string) => {
					storage.delete(key);
				}),
			},
		} as unknown as Window);

		axiosPostMock.mockResolvedValueOnce({
			data: {
				id_token: 'token-renovado',
				refresh_token: 'refresh-renovado',
				expires_in: '7200',
			},
		});

		await expect(resolveValidStoredAuthToken()).resolves.toBe('token-renovado');
	});

	it('retorna o token atual se o refresh expirar mas a sessão ainda estiver válida', async () => {
		const storage = new Map<string, string>();
		const now = Date.now();
		vi.stubEnv('NEXT_PUBLIC_FIREBASE_API_KEY', 'firebase-key');
		vi.useFakeTimers();

		storage.set(AUTH_TOKEN_STORAGE_KEY, 'token-antigo');
		storage.set(AUTH_REFRESH_TOKEN_STORAGE_KEY, 'refresh-antigo');
		storage.set(AUTH_EXPIRES_AT_STORAGE_KEY, String(now + 30 * 1000));
		storage.set(AUTH_LAST_ACTIVITY_STORAGE_KEY, String(now));

		vi.stubGlobal('window', {
			localStorage: {
				getItem: vi.fn((key: string) => storage.get(key) ?? null),
				setItem: vi.fn((key: string, value: string) => {
					storage.set(key, value);
				}),
				removeItem: vi.fn((key: string) => {
					storage.delete(key);
				}),
			},
		} as unknown as Window);

		axiosPostMock.mockImplementationOnce(
			(_url: string, _body: URLSearchParams, config?: { signal?: AbortSignal }) =>
				new Promise((_, reject) => {
					config?.signal?.addEventListener('abort', () => {
						reject(new Error('refresh aborted'));
					});
				})
		);

		const tokenPromise = resolveValidStoredAuthToken();
		await vi.advanceTimersByTimeAsync(5_000);

		await expect(tokenPromise).resolves.toBe('token-antigo');
	});

	it('propaga erro quando o refresh falha sem timeout', async () => {
		vi.stubGlobal('window', {
			localStorage: {
				getItem: vi.fn((key: string) => {
					if (key === AUTH_REFRESH_TOKEN_STORAGE_KEY) return 'refresh-antigo';
					return null;
				}),
				setItem: vi.fn(),
				removeItem: vi.fn(),
			},
		} as unknown as Window);

		const refreshError = new Error('refresh failed');
		axiosPostMock.mockRejectedValueOnce(refreshError);

		await expect(refreshStoredAuthToken('firebase-key')).rejects.toThrow(
			'refresh failed'
		);
	});

	it('encerra a sessão quando a inatividade passa do limite', async () => {
		const removeItem = vi.fn();
		const now = Date.now();

		vi.stubGlobal('window', {
			localStorage: {
				getItem: vi.fn((key: string) => {
					if (key === AUTH_TOKEN_STORAGE_KEY) return 'token-123';
					if (key === AUTH_LAST_ACTIVITY_STORAGE_KEY) {
						return String(now - AUTH_INACTIVITY_LIMIT_MS - 1);
					}
					return null;
				}),
				removeItem,
			},
		} as unknown as Window);

		await expect(resolveValidStoredAuthToken()).resolves.toBeNull();
		expect(removeItem).toHaveBeenCalledWith(AUTH_TOKEN_STORAGE_KEY);
	});
});
