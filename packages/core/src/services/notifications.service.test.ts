import { describe, expect, it, vi } from 'vitest';
import type { AxiosInstance } from 'axios';
import { createNotificationsService } from './notifications.service.js';

describe('createNotificationsService', () => {
	it('registra token push', async () => {
		const api = {
			post: vi.fn().mockResolvedValue({ data: { ok: true } }),
		} as unknown as AxiosInstance & {
			post: ReturnType<typeof vi.fn>;
		};
		const service = createNotificationsService(api);

		await expect(
			service.registerPushToken({
				token: 'ExponentPushToken[token]',
				platform: 'android',
			}),
		).resolves.toEqual({ ok: true });

		expect(api.post).toHaveBeenCalledWith('/notifications/push-token', {
			token: 'ExponentPushToken[token]',
			platform: 'android',
		});
	});
});
