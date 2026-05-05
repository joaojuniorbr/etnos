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

	it('deve buscar as escolas que o perfil pode visualizar', async () => {
		apiMock.get.mockResolvedValueOnce({ data: [{ id: '1', name: 'IFPR' }] });

		const result = await schoolService.getManagedSchools();

		expect(apiMock.get).toHaveBeenCalledWith('/schools/me/managed');
		expect(result).toEqual([{ id: '1', name: 'IFPR' }]);
	});

	it('deve buscar a configuracao de jogos da escola do usuario autenticado', async () => {
		apiMock.get.mockResolvedValueOnce({
			data: { schoolId: '1', enabledGameSlugs: ['memory-game'] },
		});

		const result = await schoolService.getMyGameAccess();

		expect(apiMock.get).toHaveBeenCalledWith('/schools/me/game-access');
		expect(result).toEqual({
			schoolId: '1',
			enabledGameSlugs: ['memory-game'],
		});
	});

	it('deve buscar a configuracao de jogos de uma escola especifica', async () => {
		apiMock.get.mockResolvedValueOnce({
			data: { schoolId: 'school-1', enabledCharacterSlugs: ['anita'] },
		});

		const result = await schoolService.getGameAccessBySchool('school-1');

		expect(apiMock.get).toHaveBeenCalledWith('/schools/school-1/game-access');
		expect(result).toEqual({
			schoolId: 'school-1',
			enabledCharacterSlugs: ['anita'],
		});
	});

	it('deve atualizar a configuracao de jogos de uma escola', async () => {
		apiMock.patch.mockResolvedValueOnce({
			data: { schoolId: 'school-1', enabledGameSlugs: ['guess-game'] },
		});

		const payload = {
			enabledGameSlugs: ['guess-game'],
			enabledCharacterSlugs: ['iara'],
		};

		const result = await schoolService.updateGameAccessBySchool(
			'school-1',
			payload,
		);

		expect(apiMock.patch).toHaveBeenCalledWith(
			'/schools/school-1/game-access',
			payload,
		);
		expect(result).toEqual({
			schoolId: 'school-1',
			enabledGameSlugs: ['guess-game'],
		});
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

	it('deve buscar usuarios de uma escola especifica com filtro', async () => {
		apiMock.get.mockResolvedValueOnce({ data: [{ uid: 'user-2' }] });

		const result = await schoolService.getUsersBySchool('school-1', 'maria');

		expect(apiMock.get).toHaveBeenCalledWith('/schools/school-1/users', {
			params: { search: 'maria' },
		});
		expect(result).toEqual([{ uid: 'user-2' }]);
	});

	it('deve buscar usuarios de uma escola especifica sem filtro', async () => {
		apiMock.get.mockResolvedValueOnce({ data: [{ uid: 'user-2' }] });

		const result = await schoolService.getUsersBySchool('school-1');

		expect(apiMock.get).toHaveBeenCalledWith('/schools/school-1/users', {
			params: undefined,
		});
		expect(result).toEqual([{ uid: 'user-2' }]);
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
		apiMock.get.mockResolvedValueOnce({
			data: [{ position: 1, uid: 'user-1' }],
		});

		const result = await schoolService.getMyUsersRanking('memory-game');

		expect(apiMock.get).toHaveBeenCalledWith('/schools/me/users/ranking', {
			params: { gameSlug: 'memory-game' },
		});
		expect(result).toEqual([{ position: 1, uid: 'user-1' }]);
	});

	it('deve buscar ranking de usuarios da escola sem filtro por jogo', async () => {
		apiMock.get.mockResolvedValueOnce({
			data: [{ position: 1, uid: 'user-1' }],
		});

		const result = await schoolService.getMyUsersRanking();

		expect(apiMock.get).toHaveBeenCalledWith('/schools/me/users/ranking', {
			params: undefined,
		});
		expect(result).toEqual([{ position: 1, uid: 'user-1' }]);
	});

	it('deve buscar ranking de usuarios por escola para admin', async () => {
		apiMock.get.mockResolvedValueOnce({
			data: [{ position: 1, uid: 'user-1' }],
		});

		const result = await schoolService.getUsersRankingBySchool(
			'school-1',
			'memory-game',
			'anita',
		);

		expect(apiMock.get).toHaveBeenCalledWith(
			'/schools/school-1/users/ranking',
			{
				params: { gameSlug: 'memory-game', characterSlug: 'anita' },
			},
		);
		expect(result).toEqual([{ position: 1, uid: 'user-1' }]);
	});

	it('deve buscar ranking de usuarios da escola filtrando apenas por personagem', async () => {
		apiMock.get.mockResolvedValueOnce({
			data: [{ position: 1, uid: 'user-1' }],
		});

		const result = await schoolService.getMyUsersRanking(undefined, 'anita');

		expect(apiMock.get).toHaveBeenCalledWith('/schools/me/users/ranking', {
			params: { characterSlug: 'anita' },
		});
		expect(result).toEqual([{ position: 1, uid: 'user-1' }]);
	});

	it('deve buscar ranking de usuarios por escola para admin sem filtro por jogo', async () => {
		apiMock.get.mockResolvedValueOnce({
			data: [{ position: 1, uid: 'user-1' }],
		});

		const result = await schoolService.getUsersRankingBySchool('school-1');

		expect(apiMock.get).toHaveBeenCalledWith(
			'/schools/school-1/users/ranking',
			{
				params: undefined,
			},
		);
		expect(result).toEqual([{ position: 1, uid: 'user-1' }]);
	});

	it('deve buscar ranking de usuarios por escola filtrando apenas por personagem', async () => {
		apiMock.get.mockResolvedValueOnce({
			data: [{ position: 2, uid: 'user-2' }],
		});

		const result = await schoolService.getUsersRankingBySchool(
			'school-1',
			undefined,
			'anita',
		);

		expect(apiMock.get).toHaveBeenCalledWith(
			'/schools/school-1/users/ranking',
			{
				params: { characterSlug: 'anita' },
			},
		);
		expect(result).toEqual([{ position: 2, uid: 'user-2' }]);
	});

	it('deve buscar ranking de usuarios por escola filtrando apenas por jogo', async () => {
		apiMock.get.mockResolvedValueOnce({
			data: [{ position: 3, uid: 'user-3' }],
		});

		const result = await schoolService.getUsersRankingBySchool(
			'school-1',
			'memory-game',
		);

		expect(apiMock.get).toHaveBeenCalledWith(
			'/schools/school-1/users/ranking',
			{
				params: { gameSlug: 'memory-game' },
			},
		);
		expect(result).toEqual([{ position: 3, uid: 'user-3' }]);
	});

	it('deve listar usuarios school vinculados a uma escola', async () => {
		apiMock.get.mockResolvedValueOnce({ data: [{ uid: 'user-2' }] });

		const result = await schoolService.getAccessUsersBySchool('school-1');

		expect(apiMock.get).toHaveBeenCalledWith('/schools/school-1/access-users');
		expect(result).toEqual([{ uid: 'user-2' }]);
	});

	it('deve vincular usuario school a uma escola por email', async () => {
		apiMock.post.mockResolvedValueOnce({ data: { uid: 'user-2' } });

		const result = await schoolService.addAccessUserToSchool(
			'school-1',
			'escola@teste.com',
		);

		expect(apiMock.post).toHaveBeenCalledWith('/schools/school-1/access-users', {
			email: 'escola@teste.com',
		});
		expect(result).toEqual({ uid: 'user-2' });
	});

	it('deve remover o acesso school de um usuario na escola', async () => {
		apiMock.delete.mockResolvedValueOnce({ data: true });

		const result = await schoolService.removeAccessUserFromSchool(
			'school-1',
			'user-2',
		);

		expect(apiMock.delete).toHaveBeenCalledWith(
			'/schools/school-1/access-users/user-2',
		);
		expect(result).toBe(true);
	});

	it('deve buscar histórico de pontuação de um estudante por escola', async () => {
		apiMock.get.mockResolvedValueOnce({
			data: [{ id: 'history-1', score: 120 }],
		});

		const result = await schoolService.getUserGameScoreHistory(
			'school-1',
			'student-1',
		);

		expect(apiMock.get).toHaveBeenCalledWith(
			'/schools/school-1/users/student-1/game-score-history',
		);
		expect(result).toEqual([{ id: 'history-1', score: 120 }]);
	});
});
