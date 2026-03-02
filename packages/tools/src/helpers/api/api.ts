import axios, {
	AxiosHeaders,
	AxiosInstance,
	InternalAxiosRequestConfig,
} from 'axios';

export const AUTH_TOKEN_STORAGE_KEY = 'etnos_auth_token';

const addAuthToken = (config: InternalAxiosRequestConfig) => {
	if (typeof window === 'undefined') {
		return config;
	}

	const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

	if (!token) return config;

	const headers = AxiosHeaders.from(config.headers);
	headers.set('Authorization', `Bearer ${token}`);
	config.headers = headers;

	return config;
};

export const createApiClient = (
	baseURL = process.env.NEXT_PUBLIC_API_URL
): AxiosInstance => {
	const instance = axios.create({ baseURL });
	instance.interceptors.request.use(addAuthToken);
	return instance;
};

const api = createApiClient();

export { api };
