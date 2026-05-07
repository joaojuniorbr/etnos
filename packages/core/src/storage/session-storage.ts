import axios from 'axios';

export const AUTH_TOKEN_STORAGE_KEY = 'etnos_auth_token';
export const AUTH_REFRESH_TOKEN_STORAGE_KEY = 'etnos_auth_refresh_token';
export const AUTH_EXPIRES_AT_STORAGE_KEY = 'etnos_auth_expires_at';
export const AUTH_LAST_ACTIVITY_STORAGE_KEY = 'etnos_auth_last_activity_at';

const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;
const TOKEN_REFRESH_BUFFER_IN_SECONDS = 60;
const TOKEN_REFRESH_TIMEOUT_MS = 5 * 1000;

export const daysToMilliseconds = (days: number) =>
	days *
	HOURS_PER_DAY *
	MINUTES_PER_HOUR *
	SECONDS_PER_MINUTE *
	MILLISECONDS_PER_SECOND;

export const AUTH_INACTIVITY_LIMIT_IN_DAYS = 8;
export const AUTH_INACTIVITY_LIMIT_MS = daysToMilliseconds(
	AUTH_INACTIVITY_LIMIT_IN_DAYS,
);

const TOKEN_REFRESH_BUFFER_MS = TOKEN_REFRESH_BUFFER_IN_SECONDS * 1000;

export type StorageAdapter = {
	getItem(key: string): Promise<string | null>;
	setItem(key: string, value: string): Promise<void>;
	removeItem(key: string): Promise<void>;
};

export type StoredSession = {
	token: string | null;
	refreshToken: string | null;
	expiresAt: number | null;
	lastActivityAt: number | null;
};

export type SessionPayload = {
	idToken: string;
	refreshToken?: string | null;
	expiresIn?: string | number | null;
};

const parseStoredNumber = (value: string | null) => {
	if (!value) return null;

	const parsedValue = Number(value);
	return Number.isFinite(parsedValue) ? parsedValue : null;
};

export const hasSessionExceededInactivityLimit = (
	lastActivityAt: number | null,
	now = Date.now(),
) => {
	if (!lastActivityAt) return false;
	return now - lastActivityAt >= AUTH_INACTIVITY_LIMIT_MS;
};

export const createSessionStorage = (storage: StorageAdapter) => {
	let refreshPromise: Promise<string | null> | null = null;

	const getStoredSession = async (): Promise<StoredSession> => {
		const [token, refreshToken, expiresAt, lastActivityAt] = await Promise.all([
			storage.getItem(AUTH_TOKEN_STORAGE_KEY),
			storage.getItem(AUTH_REFRESH_TOKEN_STORAGE_KEY),
			storage.getItem(AUTH_EXPIRES_AT_STORAGE_KEY),
			storage.getItem(AUTH_LAST_ACTIVITY_STORAGE_KEY),
		]);

		return {
			token,
			refreshToken,
			expiresAt: parseStoredNumber(expiresAt),
			lastActivityAt: parseStoredNumber(lastActivityAt),
		};
	};

	const updateAuthActivity = async (time = Date.now()) => {
		await storage.setItem(AUTH_LAST_ACTIVITY_STORAGE_KEY, String(time));
	};

	const clearStoredAuthSession = async () => {
		await Promise.all([
			storage.removeItem(AUTH_TOKEN_STORAGE_KEY),
			storage.removeItem(AUTH_REFRESH_TOKEN_STORAGE_KEY),
			storage.removeItem(AUTH_EXPIRES_AT_STORAGE_KEY),
			storage.removeItem(AUTH_LAST_ACTIVITY_STORAGE_KEY),
		]);
	};

	const saveStoredAuthSession = async ({
		idToken,
		refreshToken,
		expiresIn,
	}: SessionPayload) => {
		await storage.setItem(AUTH_TOKEN_STORAGE_KEY, idToken);

		if (refreshToken) {
			await storage.setItem(AUTH_REFRESH_TOKEN_STORAGE_KEY, refreshToken);
		}

		if (expiresIn) {
			const expiresInSeconds = Number(expiresIn);

			if (Number.isFinite(expiresInSeconds) && expiresInSeconds > 0) {
				const expiresAt =
					Date.now() + expiresInSeconds * MILLISECONDS_PER_SECOND;
				await storage.setItem(AUTH_EXPIRES_AT_STORAGE_KEY, String(expiresAt));
			}
		}

		await updateAuthActivity();
	};

	const refreshStoredAuthToken = async (apiKey?: string) => {
		const { refreshToken } = await getStoredSession();

		if (!refreshToken || !apiKey) {
			await clearStoredAuthSession();
			return null;
		}

		const abortController = new AbortController();
		const timeoutId = globalThis.setTimeout(() => {
			abortController.abort(new Error('Auth token refresh timeout'));
		}, TOKEN_REFRESH_TIMEOUT_MS);

		let response;

		try {
			response = await axios.post(
				'https://securetoken.googleapis.com/v1/token',
				new URLSearchParams({
					grant_type: 'refresh_token',
					refresh_token: refreshToken,
				}),
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					params: {
						key: apiKey,
					},
					signal: abortController.signal,
					timeout: TOKEN_REFRESH_TIMEOUT_MS,
				},
			);
		} catch (error) {
			if (abortController.signal.aborted) {
				const currentSession = await getStoredSession();
				return currentSession.expiresAt && currentSession.expiresAt > Date.now()
					? currentSession.token
					: null;
			}

			throw error;
		} finally {
			globalThis.clearTimeout(timeoutId);
		}

		const refreshedToken = response.data.id_token as string | undefined;
		const refreshedRefreshToken = response.data.refresh_token as
			| string
			| undefined;
		const expiresIn = response.data.expires_in as string | undefined;

		if (!refreshedToken) {
			await clearStoredAuthSession();
			return null;
		}

		const currentRefreshToken = (await getStoredSession()).refreshToken;

		if (!currentRefreshToken || currentRefreshToken !== refreshToken) {
			return null;
		}

		await saveStoredAuthSession({
			idToken: refreshedToken,
			refreshToken: refreshedRefreshToken,
			expiresIn,
		});

		return refreshedToken;
	};

	const resolveValidStoredAuthToken = async (apiKey?: string) => {
		const session = await getStoredSession();
		const now = Date.now();

		if (!session.token) return null;

		if (
			session.expiresAt == null &&
			session.refreshToken == null &&
			session.lastActivityAt == null
		) {
			await clearStoredAuthSession();
			return null;
		}

		if (hasSessionExceededInactivityLimit(session.lastActivityAt, now)) {
			await clearStoredAuthSession();
			return null;
		}

		if (
			session.expiresAt &&
			session.expiresAt - now <= TOKEN_REFRESH_BUFFER_MS
		) {
			refreshPromise ??= refreshStoredAuthToken(apiKey).finally(() => {
				refreshPromise = null;
			});

			return refreshPromise;
		}

		return session.token;
	};

	return {
		clearStoredAuthSession,
		getStoredSession,
		refreshStoredAuthToken,
		resolveValidStoredAuthToken,
		saveStoredAuthSession,
		updateAuthActivity,
	};
};
