import axios, {
	AxiosHeaders,
	type AxiosInstance,
	type InternalAxiosRequestConfig,
} from 'axios';

export type ApiClientOptions = {
	baseURL?: string;
	resolveToken?: () => Promise<string | null>;
	onRequestAuthenticated?: () => Promise<void> | void;
};

export const createApiClient = ({
	baseURL,
	resolveToken,
	onRequestAuthenticated,
}: ApiClientOptions = {}): AxiosInstance => {
	const instance = axios.create({ baseURL });

	instance.interceptors.request.use(
		async (config: InternalAxiosRequestConfig) => {
			if (!resolveToken) {
				return config;
			}

			const token = await resolveToken();

			if (!token) {
				return config;
			}

			const headers = AxiosHeaders.from(config.headers);
			headers.set('Authorization', `Bearer ${token}`);
			config.headers = headers;

			await onRequestAuthenticated?.();

			return config;
		},
	);

	return instance;
};
