import { describe, expect, it, vi } from 'vitest';
import type { AxiosInstance } from 'axios';
import { createSchoolService } from './school.service';

const createApiMock = () =>
	({
		get: vi.fn(),
	}) as unknown as AxiosInstance & {
		get: ReturnType<typeof vi.fn>;
	};

describe('createSchoolService', () => {
	it('usa os endpoints esperados', async () => {
		const api = createApiMock();
		api.get.mockResolvedValue({ data: [{ id: '1' }] });
		const service = createSchoolService(api);

		await service.getAll();
		await service.getMyGameAccess();

		expect(api.get).toHaveBeenCalledWith('/schools');
		expect(api.get).toHaveBeenCalledWith('/schools/me/game-access');
	});
});
