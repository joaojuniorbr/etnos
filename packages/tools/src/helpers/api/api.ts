import axios from 'axios';

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
});

console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

api.interceptors.request.use((config) => {
	const token = localStorage.getItem('etnos_auth_token');

	if (token) {
		config.headers['Authorization'] = `Bearer ${token}`;
	}
	return config;
});

export { api };
