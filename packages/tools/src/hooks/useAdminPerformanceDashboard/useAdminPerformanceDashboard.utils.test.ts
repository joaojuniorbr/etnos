import { describe, expect, it } from 'vitest';
import {
	ADMIN_DASHBOARD_ALL_SCHOOLS,
	SchoolRankingInterface,
} from '@etnos/types';
import { buildSchoolAverageChartRows } from './useAdminPerformanceDashboard.utils';

describe('buildSchoolAverageChartRows', () => {
	const ranking: SchoolRankingInterface[] = [
		{
			position: 1,
			gameSlug: 'game-slug',
			totalScore: 100,
			schoolId: '1',
			schoolName: 'Escola com nome muito longo para truncar',
			averageScore: 80,
			totalPlayers: 5,
		},
		{
			schoolId: '2',
			schoolName: 'IFPR',
			averageScore: 90,
			totalPlayers: 0,
			gameSlug: 'game-slug',
			totalScore: 100,
			position: 2,
		},
		{
			schoolId: '3',
			schoolName: 'UFPR',
			averageScore: 70,
			totalPlayers: 2,
			gameSlug: 'game-slug',
			totalScore: 100,
			position: 3,
		},
	];

	it('ordena todas as escolas com jogadores quando filtro for all', () => {
		const rows = buildSchoolAverageChartRows(
			ranking,
			ADMIN_DASHBOARD_ALL_SCHOOLS,
		);

		expect(rows).toHaveLength(2);
		expect(rows[0]?.key).toBe('1');
		expect(rows[0]?.name?.endsWith('…')).toBe(true);
		expect(rows[0]?.fullName).toBe('Escola com nome muito longo para truncar');
		expect(rows[1]?.key).toBe('3');
		expect(rows[1]?.name).toBe('UFPR');
	});

	it('retorna apenas a escola selecionada', () => {
		const rows = buildSchoolAverageChartRows(ranking, '3');

		expect(rows).toEqual([
			{
				key: '3',
				name: 'UFPR',
				fullName: 'UFPR',
				media: 70,
			},
		]);
	});

	it('retorna vazio quando escola selecionada nao tiver jogadores', () => {
		const rows = buildSchoolAverageChartRows(ranking, '2');

		expect(rows).toEqual([]);
	});
});
