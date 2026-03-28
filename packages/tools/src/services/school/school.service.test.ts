import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock } = vi.hoisted(() => ({
	apiMock: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}));

vi.mock('../../helpers', () => ({
	api: apiMock,
}));

import { schoolService } from './school.service';

describe('schoolService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve buscar escolas', async () => {
		apiMock.get.mockResolvedValueOnce({ data: [{ id: '1' }] });

		const result = await schoolService.getAll();

		expect(apiMock.get).toHaveBeenCalledWith('/schools');
		expect(result).toEqual([{ id: '1' }]);
	});

	it('deve criar escola', async () => {
		const school = { id: '1', name: 'IFPR' } as any;
		apiMock.post.mockResolvedValueOnce({ data: school });

		await schoolService.create(school);

		expect(apiMock.post).toHaveBeenCalledWith('/schools', school);
	});

	it('deve atualizar escola', async () => {
		const payload = { name: 'Novo nome' };
		apiMock.patch.mockResolvedValueOnce({ data: payload });

		await schoolService.update('1', payload);

		expect(apiMock.patch).toHaveBeenCalledWith('/schools/1', payload);
	});

	it('deve excluir escola', async () => {
		apiMock.delete.mockResolvedValueOnce({ data: true });

		await schoolService.delete('1');

		expect(apiMock.delete).toHaveBeenCalledWith('/schools/1');
	});

	it('deve buscar escola por id', async () => {
		apiMock.get.mockResolvedValueOnce({ data: { id: '1', name: 'IFPR' } });

		const result = await schoolService.getOne('1');

		expect(apiMock.get).toHaveBeenCalledWith('/schools/1');
		expect(result).toEqual({ id: '1', name: 'IFPR' });
	});

	it('deve buscar a escola do perfil autenticado', async () => {
		apiMock.get.mockResolvedValueOnce({ data: { id: '1', name: 'IFPR' } });

		const result = await schoolService.getMySchool();

		expect(apiMock.get).toHaveBeenCalledWith('/schools/me');
		expect(result).toEqual({ id: '1', name: 'IFPR' });
	});

	it('deve buscar usuarios da escola autenticada com filtro', async () => {
		apiMock.get.mockResolvedValueOnce({ data: [{ uid: 'user-1' }] });

		const result = await schoolService.getMyUsers('maria');

		expect(apiMock.get).toHaveBeenCalledWith('/schools/me/users', {
			params: { search: 'maria' },
		});
		expect(result).toEqual([{ uid: 'user-1' }]);
	});

	it('deve buscar usuarios da escola autenticada sem filtro', async () => {
		apiMock.get.mockResolvedValueOnce({ data: [{ uid: 'user-1' }] });

		const result = await schoolService.getMyUsers();

		expect(apiMock.get).toHaveBeenCalledWith('/schools/me/users', {
			params: undefined,
		});
		expect(result).toEqual([{ uid: 'user-1' }]);
	});

	it('deve buscar ranking de escolas com filtro por jogo', async () => {
		apiMock.get.mockResolvedValueOnce({ data: [{ position: 1 }] });

		const result = await schoolService.getRanking('memory-game');

		expect(apiMock.get).toHaveBeenCalledWith('/schools/me/ranking', {
			params: { gameSlug: 'memory-game' },
		});
		expect(result).toEqual([{ position: 1 }]);
	});

	it('deve buscar ranking de escolas sem filtro por jogo', async () => {
		apiMock.get.mockResolvedValueOnce({ data: [{ position: 1 }] });

		const result = await schoolService.getRanking();

		expect(apiMock.get).toHaveBeenCalledWith('/schools/me/ranking', {
			params: undefined,
		});
		expect(result).toEqual([{ position: 1 }]);
	});

	it('deve buscar ranking de usuarios da escola com filtro por jogo', async () => {
		apiMock.get.mockResolvedValueOnce({ data: [{ position: 1, uid: 'user-1' }] });

		const result = await schoolService.getMyUsersRanking('memory-game');

		expect(apiMock.get).toHaveBeenCalledWith('/schools/me/users/ranking', {
			params: { gameSlug: 'memory-game' },
		});
		expect(result).toEqual([{ position: 1, uid: 'user-1' }]);
	});

	it('deve buscar ranking de usuarios da escola sem filtro por jogo', async () => {
		apiMock.get.mockResolvedValueOnce({ data: [{ position: 1, uid: 'user-1' }] });

		const result = await schoolService.getMyUsersRanking();

		expect(apiMock.get).toHaveBeenCalledWith('/schools/me/users/ranking', {
			params: undefined,
		});
		expect(result).toEqual([{ position: 1, uid: 'user-1' }]);
	});

	it('deve buscar ranking de usuarios por escola para admin', async () => {
		apiMock.get.mockResolvedValueOnce({ data: [{ position: 1, uid: 'user-1' }] });

		const result = await schoolService.getUsersRankingBySchool(
			'school-1',
			'memory-game'
		);

		expect(apiMock.get).toHaveBeenCalledWith('/schools/school-1/users/ranking', {
			params: { gameSlug: 'memory-game' },
		});
		expect(result).toEqual([{ position: 1, uid: 'user-1' }]);
	});

	it('deve buscar ranking de usuarios por escola para admin sem filtro por jogo', async () => {
		apiMock.get.mockResolvedValueOnce({ data: [{ position: 1, uid: 'user-1' }] });

		const result = await schoolService.getUsersRankingBySchool('school-1');

		expect(apiMock.get).toHaveBeenCalledWith('/schools/school-1/users/ranking', {
			params: undefined,
		});
		expect(result).toEqual([{ position: 1, uid: 'user-1' }]);
	});
});
