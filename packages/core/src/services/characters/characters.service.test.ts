import { describe, expect, it, vi } from 'vitest';
import type { AxiosInstance } from 'axios';
import { createCharactersService } from './characters.service';

const createApiMock = () =>
	({
		get: vi.fn(),
	}) as unknown as AxiosInstance & {
		get: ReturnType<typeof vi.fn>;
	};

describe('createCharactersService', () => {
	it('usa os endpoints esperados', async () => {
		const api = createApiMock();
		api.get.mockResolvedValue({ data: [{ id: '1' }] });
		const service = createCharactersService(api);

		await service.getCharacters('anita');
		await service.getCharacters();
		await service.getCharacterBySlug('anita');
		await service.getCharacterAvatars('anita');

		expect(api.get).toHaveBeenCalledWith('/characters', {
			params: { slug: 'anita' },
		});
		expect(api.get).toHaveBeenCalledWith('/characters', {
			params: undefined,
		});
		expect(api.get).toHaveBeenCalledWith('/characters/anita');
		expect(api.get).toHaveBeenCalledWith('/characters/anita/avatars');
	});
});
