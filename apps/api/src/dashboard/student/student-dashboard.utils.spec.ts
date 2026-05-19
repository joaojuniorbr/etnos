import type { StudentDashboardRawData } from './student-dashboard.utils';
import { toStudentDashboard, totalScoreByUser } from './student-dashboard.utils';

const baseRawData = (
	overrides: Partial<StudentDashboardRawData> = {},
): StudentDashboardRawData => ({
	profile: {
		firebaseUid: 'user-1',
		childName: 'Ana Silva',
		parentName: null,
		email: 'ana@test.com',
		schoolId: 'school-1',
	},
	characterSlug: 'iara',
	scores: [
		{ slug: 'memory-game', characterSlug: 'iara', score: 100 },
		{ slug: 'memory-game', characterSlug: 'iara', score: 50 },
		{ slug: 'guess-game', characterSlug: 'iara', score: 0 },
	],
	history: [
		{
			id: 'h1',
			gameSlug: 'memory-game',
			characterSlug: 'iara',
			score: 80,
			startedAt: new Date('2026-05-10T10:00:00Z'),
			endedAt: new Date('2026-05-10T10:05:00Z'),
			status: 'completed',
		},
		{
			id: 'h2',
			gameSlug: 'unknown-game',
			characterSlug: 'iara',
			score: 40,
			startedAt: new Date('2026-05-09T10:00:00Z'),
			endedAt: null,
			status: 'completed',
		},
		{
			id: 'h3',
			gameSlug: 'memory-game',
			characterSlug: 'iara',
			score: 0,
			startedAt: new Date('2026-05-08T10:00:00Z'),
			endedAt: null,
			status: 'completed',
		},
	],
	games: [
		{
			slug: 'memory-game',
			name: 'Jogo da Memória',
			description: 'desc',
			url: '/memoria',
		},
		{
			slug: 'guess-game',
			name: 'Amotione a Palavra',
			description: 'desc',
			url: '/advinhe',
		},
	],
	enabledCharacterSlugs: ['iara', 'saci'],
	schoolUsers: [
		{
			firebaseUid: 'user-1',
			childName: 'Ana Silva',
			parentName: null,
			email: 'ana@test.com',
		},
		{
			firebaseUid: 'user-2',
			childName: 'João Pedro',
			parentName: null,
			email: 'joao@test.com',
		},
	],
	schoolScoresByUid: new Map([
		['user-1', 150],
		['user-2', 300],
	]),
	characters: [
		{
			id: 'char-1',
			slug: 'iara',
			name: 'Iara',
			region: 'Norte',
			description: 'Guardiã das águas',
			imageUrl: 'https://cdn.test/iara.png',
		},
	],
	covers: new Map([['memory-game:iara', 'https://cdn.test/cover.jpg']]),
	...overrides,
});

describe('student-dashboard.utils', () => {
	it('monta dashboard completo com guia, ranking e atividades', () => {
		const result = toStudentDashboard(baseRawData());

		expect(result.user).toEqual({
			name: 'Ana Silva',
			totalScore: 100,
			gamesCompleted: 0,
			classRank: 2,
			schoolStudentsCount: 2,
		});
		expect(result.culturalGuide).toMatchObject({
			slug: 'iara',
			name: 'Iara',
			imageUrl: 'https://cdn.test/iara.png',
		});
		expect(result.classRanking[0]).toMatchObject({
			rank: 1,
			name: 'João Pedro',
			initials: 'JP',
		});
		expect(result.classRanking[1]).toMatchObject({
			isCurrentUser: true,
			initials: 'AS',
		});
		expect(result.availableGames[0]).toEqual({
			slug: 'memory-game',
			name: 'Jogo da Memória',
			coverUrl: 'https://cdn.test/cover.jpg',
		});
		expect(result.recentActivity).toHaveLength(2);
		expect(result.recentActivity[0]).toMatchObject({
			description: 'Pontuou no Jogo da Memória',
			highlight: '+80',
			coverUrl: 'https://cdn.test/cover.jpg',
		});
		expect(result.recentActivity[1]).toMatchObject({
			description: 'Pontuou no unknown-game',
			timestamp: new Date('2026-05-09T10:00:00Z').toISOString(),
		});
	});

	it('usa fallbacks de nome, ranking e guia quando dados estão ausentes', () => {
		const result = toStudentDashboard(
			baseRawData({
				characterSlug: undefined,
				profile: {
					firebaseUid: 'user-9',
					childName: null,
					parentName: 'Responsável',
					email: null,
					schoolId: null,
				},
				scores: [],
				schoolUsers: [],
				schoolScoresByUid: new Map(),
				characters: [],
				covers: new Map(),
			}),
		);

		expect(result.user.name).toBe('Responsável');
		expect(result.user.classRank).toBeNull();
		expect(result.culturalGuide).toBeNull();
		expect(result.availableGames[0]?.coverUrl).toBeNull();
	});

	it('usa e-mail e nome padrão quando perfil não tem childName nem parentName', () => {
		const onlyEmail = toStudentDashboard(
			baseRawData({
				profile: {
					firebaseUid: 'user-3',
					childName: null,
					parentName: null,
					email: 'aluno@test.com',
					schoolId: null,
				},
			}),
		);
		const defaultName = toStudentDashboard(
			baseRawData({
				profile: {
					firebaseUid: 'user-4',
					childName: null,
					parentName: null,
					email: null,
					schoolId: null,
				},
			}),
		);

		expect(onlyEmail.user.name).toBe('aluno@test.com');
		expect(defaultName.user.name).toBe('Estudante');
	});

	it('conta jogos concluídos e retorna null no ranking quando usuário não está na turma', () => {
		const completed = toStudentDashboard(
			baseRawData({
				scores: [
					{ slug: 'memory-game', characterSlug: 'iara', score: 10 },
					{ slug: 'memory-game', characterSlug: 'saci', score: 10 },
					{ slug: 'guess-game', characterSlug: 'iara', score: 10 },
					{ slug: 'guess-game', characterSlug: 'saci', score: 10 },
				],
			}),
		);
		const missingRank = toStudentDashboard(
			baseRawData({
				profile: {
					firebaseUid: 'fora-da-lista',
					childName: 'Fora',
					parentName: null,
					email: null,
					schoolId: 'school-1',
				},
			}),
		);

		expect(completed.user.gamesCompleted).toBe(2);
		expect(missingRank.user.classRank).toBeNull();
	});

	it('retorna guia nulo quando characterSlug não existe na lista', () => {
		const result = toStudentDashboard(
			baseRawData({
				characterSlug: 'inexistente',
				characters: [],
			}),
		);

		expect(result.culturalGuide).toBeNull();
	});

	it('desempata ranking por nome quando pontuações são iguais', () => {
		const result = toStudentDashboard(
			baseRawData({
				schoolUsers: [
					{
						firebaseUid: 'user-1',
						childName: 'Bruno',
						parentName: null,
						email: null,
					},
					{
						firebaseUid: 'user-2',
						childName: 'Ana',
						parentName: null,
						email: null,
					},
				],
				schoolScoresByUid: new Map([
					['user-1', 100],
					['user-2', 100],
				]),
			}),
		);

		expect(result.classRanking.map((entry) => entry.name)).toEqual([
			'Ana',
			'Bruno',
		]);
	});

	it('agrega pontuação por usuário', () => {
		const scoresByUser = totalScoreByUser([
			{ userId: 'u1', slug: 'memory-game', characterSlug: 'iara', score: 50 },
			{ userId: 'u1', slug: 'guess-game', characterSlug: 'iara', score: 80 },
			{ userId: 'u1', slug: 'memory-game', characterSlug: 'saci', score: 20 },
			{ userId: 'u2', slug: 'memory-game', characterSlug: 'iara', score: 0 },
		]);

		expect(scoresByUser.get('u1')).toBe(100);
		expect(scoresByUser.get('u2')).toBe(0);
	});
});
