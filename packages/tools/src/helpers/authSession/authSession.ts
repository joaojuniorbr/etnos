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

export const daysToMilliseconds = (days: number) =>
	days *
	HOURS_PER_DAY *
	MINUTES_PER_HOUR *
	SECONDS_PER_MINUTE *
	MILLISECONDS_PER_SECOND;

export const AUTH_INACTIVITY_LIMIT_IN_DAYS = 8;
export const AUTH_INACTIVITY_LIMIT_MS = daysToMilliseconds(
	AUTH_INACTIVITY_LIMIT_IN_DAYS
);

const TOKEN_REFRESH_BUFFER_MS = TOKEN_REFRESH_BUFFER_IN_SECONDS * 1000;
const TOKEN_REFRESH_TIMEOUT_MS = 5 * 1000;

type StoredSession = {
	token: string | null;
	refreshToken: string | null;
	expiresAt: number | null;
	lastActivityAt: number | null;
};

type SessionPayload = {
	idToken: string;
	refreshToken?: string | null;
	expiresIn?: string | number | null;
};

const isBrowser = () => globalThis.window !== undefined;

const parseStoredNumber = (value: string | null) => {
	if (!value) return null;

	const parsedValue = Number(value);
	return Number.isFinite(parsedValue) ? parsedValue : null;
};

export const getStoredSession = (): StoredSession => {
	if (!isBrowser()) {
		return {
			token: null,
			refreshToken: null,
			expiresAt: null,
			lastActivityAt: null,
		};
	}

	return {
		token: globalThis.window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY),
		refreshToken: globalThis.window.localStorage.getItem(
			AUTH_REFRESH_TOKEN_STORAGE_KEY
		),
		expiresAt: parseStoredNumber(
			globalThis.window.localStorage.getItem(AUTH_EXPIRES_AT_STORAGE_KEY)
		),
		lastActivityAt: parseStoredNumber(
			globalThis.window.localStorage.getItem(AUTH_LAST_ACTIVITY_STORAGE_KEY)
		),
	};
};

export const updateAuthActivity = (time = Date.now()) => {
	if (!isBrowser()) return;

	globalThis.window.localStorage.setItem(
		AUTH_LAST_ACTIVITY_STORAGE_KEY,
		String(time)
	);
};

export const clearStoredAuthSession = () => {
	if (!isBrowser()) return;

	// Async writers must verify the originating session is still current
	// before persisting refreshed credentials after calling out to the network.
	globalThis.window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
	globalThis.window.localStorage.removeItem(AUTH_REFRESH_TOKEN_STORAGE_KEY);
	globalThis.window.localStorage.removeItem(AUTH_EXPIRES_AT_STORAGE_KEY);
	globalThis.window.localStorage.removeItem(AUTH_LAST_ACTIVITY_STORAGE_KEY);
};

export const saveStoredAuthSession = ({
	idToken,
	refreshToken,
	expiresIn,
}: SessionPayload) => {
	if (!isBrowser()) return;

	globalThis.window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, idToken);

	if (refreshToken) {
		globalThis.window.localStorage.setItem(
			AUTH_REFRESH_TOKEN_STORAGE_KEY,
			refreshToken
		);
	}

	if (expiresIn) {
		const expiresInSeconds = Number(expiresIn);
		if (Number.isFinite(expiresInSeconds) && expiresInSeconds > 0) {
			const expiresAt = Date.now() + expiresInSeconds * MILLISECONDS_PER_SECOND;
			globalThis.window.localStorage.setItem(
				AUTH_EXPIRES_AT_STORAGE_KEY,
				String(expiresAt)
			);
		}
	}

	updateAuthActivity();
};

export const hasSessionExceededInactivityLimit = (
	lastActivityAt: number | null,
	now = Date.now()
) => {
	if (!lastActivityAt) return false;
	return now - lastActivityAt >= AUTH_INACTIVITY_LIMIT_MS;
};

let refreshPromise: Promise<string | null> | null = null;

export const refreshStoredAuthToken = async (
	apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
) => {
	const { refreshToken } = getStoredSession();

	if (!refreshToken || !apiKey) {
		clearStoredAuthSession();
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
			}
		);
	} catch (error) {
		if (abortController.signal.aborted) {
			const currentSession = getStoredSession();
			return currentSession.expiresAt && currentSession.expiresAt > Date.now()
				? currentSession.token
				: null;
		}

		throw error;
	} finally {
		globalThis.clearTimeout(timeoutId);
	}

	const refreshedToken = response.data.id_token as string | undefined;
	const refreshedRefreshToken = response.data.refresh_token as string | undefined;
	const expiresIn = response.data.expires_in as string | undefined;

	if (!refreshedToken) {
		clearStoredAuthSession();
		return null;
	}

	const currentRefreshToken = getStoredSession().refreshToken;
	if (!currentRefreshToken || currentRefreshToken !== refreshToken) {
		return null;
	}

	saveStoredAuthSession({
		idToken: refreshedToken,
		refreshToken: refreshedRefreshToken,
		expiresIn,
	});

	return refreshedToken;
};

export const resolveValidStoredAuthToken = async () => {
	const session = getStoredSession();
	const now = Date.now();

	if (!session.token) return null;

	if (
		session.expiresAt == null &&
		session.refreshToken == null &&
		session.lastActivityAt == null
	) {
		clearStoredAuthSession();
		return null;
	}

	if (hasSessionExceededInactivityLimit(session.lastActivityAt, now)) {
		clearStoredAuthSession();
		return null;
	}

	if (
		session.expiresAt &&
		session.expiresAt - now <= TOKEN_REFRESH_BUFFER_MS
	) {
		refreshPromise ??= refreshStoredAuthToken().finally(() => {
			refreshPromise = null;
		});

		return refreshPromise;
	}

	return session.token;
};
