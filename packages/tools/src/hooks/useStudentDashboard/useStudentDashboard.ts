'use client';

import { useQuery } from '@tanstack/react-query';
import { studentDashboardService } from '@etnos/services';
import type { StudentDashboardInterface } from '@etnos/types';
import { QUERY_STALE_TIME } from '../../constants/query-cache';

export const studentDashboardKeys = {
	detail: (characterSlug?: string) =>
		['student-dashboard', characterSlug ?? 'default'] as const,
};

export const useStudentDashboard = (characterSlug?: string) =>
	useQuery<StudentDashboardInterface>({
		queryKey: studentDashboardKeys.detail(characterSlug),
		queryFn: () => studentDashboardService.getDashboard(characterSlug),
		staleTime: QUERY_STALE_TIME.default,
	});
