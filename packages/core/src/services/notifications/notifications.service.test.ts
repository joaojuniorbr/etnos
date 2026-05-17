import { describe, expect, it, vi } from 'vitest';
import type { AxiosInstance } from 'axios';
import { createNotificationsService } from './notifications.service.js';

describe('createNotificationsService', () => {
	it('registra e remove token push com payload', async () => {
		const api = {
			delete: vi.fn().mockResolvedValue({ data: { ok: true } }),
			post: vi.fn().mockResolvedValue({ data: { ok: true } }),
		} as unknown as AxiosInstance & {
			delete: ReturnType<typeof vi.fn>;
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

		await expect(
			service.unregisterPushToken({ token: 'ExponentPushToken[token]' }),
		).resolves.toEqual({ ok: true });

		expect(api.delete).toHaveBeenCalledWith('/notifications/push-token', {
			data: { token: 'ExponentPushToken[token]' },
		});
	});

	it('remove token push sem payload', async () => {
		const api = {
			delete: vi.fn().mockResolvedValue({ data: { ok: true } }),
			post: vi.fn(),
		} as unknown as AxiosInstance & {
			delete: ReturnType<typeof vi.fn>;
			post: ReturnType<typeof vi.fn>;
		};
		const service = createNotificationsService(api);

		await expect(service.unregisterPushToken()).resolves.toEqual({ ok: true });

		expect(api.delete).toHaveBeenCalledWith(
			'/notifications/push-token',
			undefined,
		);
	});
});
