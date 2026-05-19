import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { studentDashboardService } from '@etnos/services';
import { createWrapper } from '../../test';
import {
	studentDashboardKeys,
	useStudentDashboard,
} from './useStudentDashboard';

vi.mock('@etnos/services', () => ({
	studentDashboardService: {
		getDashboard: vi.fn(),
	},
}));

const mockDashboard = {
	user: {
		name: 'Ana Silva',
		totalScore: 1250,
		gamesCompleted: 2,
		classRank: 3,
		schoolStudentsCount: 24,
	},
	culturalGuide: null,
	characters: [],
	classRanking: [],
	availableGames: [],
	recentActivity: [],
};

describe('studentDashboardKeys', () => {
	it('monta chave com slug do personagem ou default', () => {
		expect(studentDashboardKeys.detail()).toEqual(['student-dashboard', 'default']);
		expect(studentDashboardKeys.detail('iara')).toEqual([
			'student-dashboard',
			'iara',
		]);
	});
});

describe('useStudentDashboard', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('busca dashboard sem filtro de personagem', async () => {
		vi.mocked(studentDashboardService.getDashboard).mockResolvedValueOnce(
			mockDashboard,
		);

		const { result } = renderHook(() => useStudentDashboard(), {
			wrapper: createWrapper(),
		});

		expect(result.current.isLoading).toBe(true);

		await waitFor(() => {
			expect(result.current.data).toEqual(mockDashboard);
		});

		expect(studentDashboardService.getDashboard).toHaveBeenCalledWith(undefined);
	});

	it('busca dashboard filtrando por personagem', async () => {
		vi.mocked(studentDashboardService.getDashboard).mockResolvedValueOnce(
			mockDashboard,
		);

		const { result } = renderHook(() => useStudentDashboard('iara'), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(result.current.data).toEqual(mockDashboard);
		});

		expect(studentDashboardService.getDashboard).toHaveBeenCalledWith('iara');
	});
});
