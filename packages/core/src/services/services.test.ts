import { describe, expect, it, vi } from 'vitest';
import type { AxiosInstance } from 'axios';
import {
	createAuthService,
	createCharactersService,
	createMemoryGameService,
	createNotificationsService,
	createSchoolService,
	createScoreGamesService,
} from './index.js';

const createApiMock = () =>
	({
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	}) as unknown as AxiosInstance & {
		get: ReturnType<typeof vi.fn>;
		post: ReturnType<typeof vi.fn>;
		patch: ReturnType<typeof vi.fn>;
		delete: ReturnType<typeof vi.fn>;
	};

describe('core services', () => {
	it('auth service usa os endpoints esperados', async () => {
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

	it('characters, memory-game e school services usam os endpoints esperados', async () => {
		const api = createApiMock();
		api.get.mockResolvedValue({ data: [{ id: '1' }] });

		const charactersService = createCharactersService(api);
		const memoryGameService = createMemoryGameService(api);
		const schoolService = createSchoolService(api);

		await charactersService.getCharacters('anita');
		await charactersService.getCharacters();
		await charactersService.getCharacterBySlug('anita');
		await charactersService.getCharacterAvatars('anita');
		await memoryGameService.getMemoryGameImages('anita');
		await schoolService.getAll();
		await schoolService.getMyGameAccess();

		expect(api.get).toHaveBeenCalledWith('/characters', {
			params: { slug: 'anita' },
		});
		expect(api.get).toHaveBeenCalledWith('/characters', {
			params: undefined,
		});
		expect(api.get).toHaveBeenCalledWith('/characters/anita');
		expect(api.get).toHaveBeenCalledWith('/characters/anita/avatars');
		expect(api.get).toHaveBeenCalledWith('/games/memory/images/anita');
		expect(api.get).toHaveBeenCalledWith('/schools');
		expect(api.get).toHaveBeenCalledWith('/schools/me/game-access');
	});

	it('score games service usa fallback quando userId não existe e chama endpoints quando existe', async () => {
		const api = createApiMock();
		api.post.mockResolvedValue({ data: { ok: true } });
		api.get.mockResolvedValue({ data: [{ score: 10 }] });
		const service = createScoreGamesService(api);

		await expect(
			service.saveScore('memory-game', 'anita', 100, ''),
		).resolves.toBeNull();
		await expect(service.getScore('')).resolves.toEqual([]);
		await expect(service.getScoreHistory('')).resolves.toEqual([]);

		await expect(
			service.saveScore('memory-game', 'anita', 100, 'user-1'),
		).resolves.toEqual({ ok: true });
		await expect(
			service.saveScoreHistory('memory-game', 'anita', 80, 'user-1'),
		).resolves.toEqual({ ok: true });
		await expect(service.getScore('user-1')).resolves.toEqual([{ score: 10 }]);
		await expect(service.getScoreHistory('user-1', 'memory-game')).resolves.toEqual([
			{ score: 10 },
		]);
		await expect(service.getScoreHistory('user-1')).resolves.toEqual([{ score: 10 }]);

		expect(api.post).toHaveBeenCalledWith('/games/score', {
			slug: 'memory-game',
			characterSlug: 'anita',
			score: 100,
		});
		expect(api.post).toHaveBeenCalledWith('/games/score/history', {
			slug: 'memory-game',
			characterSlug: 'anita',
			score: 80,
		});
		expect(api.get).toHaveBeenCalledWith('/games/score');
		expect(api.get).toHaveBeenCalledWith('/games/score/history', {
			params: { gameSlug: 'memory-game' },
		});
		expect(api.get).toHaveBeenCalledWith('/games/score/history', {
			params: undefined,
		});
	});

	it('notifications service usa os endpoints esperados', async () => {
		const api = createApiMock();
		api.post.mockResolvedValue({ data: { ok: true } });
		api.delete.mockResolvedValue({ data: { ok: true } });
		const service = createNotificationsService(api);

		await expect(
			service.registerPushToken({ token: 'push-token-123' }),
		).resolves.toEqual({ ok: true });
		await expect(service.unregisterPushToken()).resolves.toEqual({ ok: true });

		expect(api.post).toHaveBeenCalledWith('/notifications/push-token', {
			token: 'push-token-123',
		});
		expect(api.delete).toHaveBeenCalledWith(
			'/notifications/push-token',
			undefined,
		);
	});
});
