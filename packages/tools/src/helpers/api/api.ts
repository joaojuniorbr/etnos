import axios, {
	AxiosHeaders,
	AxiosInstance,
	InternalAxiosRequestConfig,
} from 'axios';
import {
	resolveValidStoredAuthToken,
	updateAuthActivity,
} from '../authSession';

const addAuthToken = async (config: InternalAxiosRequestConfig) => {
	if (globalThis.window === undefined) {
		return config;
	}

	const token = await resolveValidStoredAuthToken();

	if (!token) return config;

	const headers = AxiosHeaders.from(config.headers);
	headers.set('Authorization', `Bearer ${token}`);
	config.headers = headers;
	updateAuthActivity();

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
