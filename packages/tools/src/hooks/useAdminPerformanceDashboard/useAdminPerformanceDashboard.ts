'use client';

import { useMemo, useState } from 'react';
import { ADMIN_DASHBOARD_ALL_SCHOOLS } from '@etnos/types';
import { useAdminDashboardCharacterUsage } from '../useAdminDashboardCharacterUsage';
import { useAdminDashboardNps } from '../useAdminDashboardNps';
import { useAdminPerformanceTopUsers } from '../useAdminPerformanceTopUsers';
import { useSchoolRanking } from '../useSchoolRanking';
import { useSchools } from '../useSchools';
import {
	ADMIN_PERFORMANCE_GAME,
	ADMIN_PERFORMANCE_TOP_USERS_LIMIT,
} from './constants';
import { buildSchoolAverageChartRows } from './useAdminPerformanceDashboard.utils';

export const useAdminPerformanceDashboard = (options?: { enabled?: boolean }) => {
	const enabled = options?.enabled !== false;
	const [selectedSchoolId, setSelectedSchoolId] = useState<string>(
		ADMIN_DASHBOARD_ALL_SCHOOLS,
	);

	const { data: schools = [] } = useSchools({ enabled });
	const { data: schoolRanking = [], isLoading: isLoadingRanking } =
		useSchoolRanking(ADMIN_PERFORMANCE_GAME, { enabled });
	const { data: topUsers = [], isLoading: isLoadingTop } =
		useAdminPerformanceTopUsers(ADMIN_PERFORMANCE_GAME, selectedSchoolId, {
			limit: ADMIN_PERFORMANCE_TOP_USERS_LIMIT,
			enabled,
		});
	const { data: characterUsage, isLoading: isLoadingCharacterUsage } =
		useAdminDashboardCharacterUsage(ADMIN_PERFORMANCE_GAME, selectedSchoolId, {
			enabled,
		});
	const { data: npsData, isLoading: isLoadingNps } = useAdminDashboardNps(
		ADMIN_PERFORMANCE_GAME,
		selectedSchoolId,
		{ enabled },
	);

	const schoolOptions = useMemo(
		() => [
			{ value: ADMIN_DASHBOARD_ALL_SCHOOLS, label: 'Todas as escolas' },
			...schools.map((school) => ({ value: school.id, label: school.name })),
		],
		[schools],
	);

	const chartRows = useMemo(
		() =>
			buildSchoolAverageChartRows(
				schoolRanking,
				selectedSchoolId,
				ADMIN_DASHBOARD_ALL_SCHOOLS,
			),
		[schoolRanking, selectedSchoolId],
	);

	return {
		gameSlug: ADMIN_PERFORMANCE_GAME,
		selectedSchoolId,
		setSelectedSchoolId,
		schoolOptions,
		chartRows,
		topUsers,
		characterUsage,
		npsData,
		isLoadingRanking,
		isLoadingTop,
		isLoadingCharacterUsage,
		isLoadingNps,
		showSchoolColumn: selectedSchoolId === ADMIN_DASHBOARD_ALL_SCHOOLS,
	};
};
