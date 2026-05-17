import { describe, expect, it, vi } from 'vitest';
import type { AxiosInstance } from 'axios';
import { createAuthService } from './auth.service';

const createApiMock = () =>
	({
		get: vi.fn(),
		post: vi.fn(),
	}) as unknown as AxiosInstance & {
		get: ReturnType<typeof vi.fn>;
		post: ReturnType<typeof vi.fn>;
	};

describe('createAuthService', () => {
	it('usa os endpoints esperados', async () => {
		const api = createApiMock();
		api.post.mockResolvedValue({ data: { ok: true } });
		api.get.mockResolvedValue({ data: { uid: '1' } });
		const service = createAuthService(api);

		await expect(
			service.login({ email: 'user@test.com', password: '123' }),
		).resolves.toEqual({ ok: true });
		await expect(service.getProfile()).resolves.toEqual({ uid: '1' });
		await service.updateProfile({ childName: 'Maria' });
		await service.changePassword('old', 'new');
		await service.recovery('user@test.com');

		expect(api.post).toHaveBeenCalledWith('/auth/login', {
			email: 'user@test.com',
			password: '123',
		});
		expect(api.get).toHaveBeenCalledWith('/auth/profile');
		expect(api.post).toHaveBeenCalledWith('/auth/profile', {
			childName: 'Maria',
		});
		expect(api.post).toHaveBeenCalledWith('/auth/change-password', {
			currentPassword: 'old',
			newPassword: 'new',
		});
		expect(api.post).toHaveBeenCalledWith('/auth/recovery', {
			email: 'user@test.com',
		});
	});
});
