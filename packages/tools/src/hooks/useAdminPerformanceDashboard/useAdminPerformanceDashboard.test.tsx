import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ADMIN_DASHBOARD_ALL_SCHOOLS } from '@etnos/types';
import { useAdminPerformanceDashboard } from './useAdminPerformanceDashboard';

vi.mock('../useSchools', () => ({
	useSchools: vi.fn(() => ({
		data: [{ id: 'school-1', name: 'IFPR' }],
	})),
}));

vi.mock('../useSchoolRanking', () => ({
	useSchoolRanking: vi.fn(() => ({
		data: [
			{
				schoolId: 'school-1',
				schoolName: 'IFPR',
				averageScore: 80,
				totalPlayers: 3,
			},
		],
		isLoading: false,
	})),
}));

vi.mock('../useAdminPerformanceTopUsers', () => ({
	useAdminPerformanceTopUsers: vi.fn(() => ({
		data: [{ position: 1 }],
		isLoading: false,
	})),
}));

vi.mock('../useAdminDashboardCharacterUsage', () => ({
	useAdminDashboardCharacterUsage: vi.fn(() => ({
		data: { slices: [] },
		isLoading: false,
	})),
}));

vi.mock('../useAdminDashboardNps', () => ({
	useAdminDashboardNps: vi.fn(() => ({
		data: { totalResponses: 1, slices: [] },
		isLoading: false,
	})),
}));

describe('useAdminPerformanceDashboard', () => {
	it('monta opcoes e dados do dashboard', () => {
		const { result } = renderHook(() => useAdminPerformanceDashboard());

		expect(result.current.gameSlug).toBe('memory-game');
		expect(result.current.schoolOptions[0]).toEqual({
			value: ADMIN_DASHBOARD_ALL_SCHOOLS,
			label: 'Todas as escolas',
		});
		expect(result.current.showSchoolColumn).toBe(true);
		expect(result.current.chartRows).toHaveLength(1);
	});

	it('altera escola selecionada', () => {
		const { result } = renderHook(() => useAdminPerformanceDashboard());

		act(() => {
			result.current.setSelectedSchoolId('school-1');
		});

		expect(result.current.selectedSchoolId).toBe('school-1');
		expect(result.current.showSchoolColumn).toBe(false);
	});
});
