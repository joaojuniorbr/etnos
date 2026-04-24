import type { AxiosInstance } from 'axios';
import type { UserProfileInterface } from '@etnos/types';

export type LoginResponse = {
	idToken: string;
	refreshToken?: string | null;
	expiresIn?: string | number | null;
	user: UserProfileInterface;
};

export type LoginPayload = {
	email: string;
	password: string;
};

export const createAuthService = (api: AxiosInstance) => ({
	login(payload: LoginPayload): Promise<LoginResponse> {
		return api.post('/auth/login', payload).then((response) => response.data);
	},

	getProfile(): Promise<UserProfileInterface> {
		return api.get('/auth/profile').then((response) => response.data);
	},

	updateProfile(
		payload: Partial<UserProfileInterface>,
	): Promise<UserProfileInterface> {
		return api.post('/auth/profile', payload).then((response) => response.data);
	},

	changePassword(currentPassword: string, newPassword: string) {
		return api
			.post('/auth/change-password', {
				currentPassword,
				newPassword,
			})
			.then((response) => response.data);
	},

	recovery(email: string) {
		return api.post('/auth/recovery', { email }).then((response) => response.data);
	},
});
