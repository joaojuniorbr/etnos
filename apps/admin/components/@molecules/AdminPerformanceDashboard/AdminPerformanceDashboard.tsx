'use client';

import { useMemo, useState } from 'react';
import { Card } from '@etnos/ui';
import {
	useAdminDashboardCharacterUsage,
	useAdminDashboardNps,
	useAdminPerformanceTopUsers,
	useAuth,
	useSchoolRanking,
	useSchools,
} from '@etnos/tools';
import { GameNameEnum } from '@etnos/types';
import {
	ADMIN_PERFORMANCE_GAME,
	ALL_SCHOOLS_VALUE,
	TOP_USERS_LIMIT,
} from './constants';
import { AdminPerformanceDashboardHeader } from './AdminPerformanceDashboardHeader';
import { CharacterUsageSection } from './CharacterUsageSection';
import { NpsDistributionSection } from './NpsDistributionSection';
import { SchoolAverageScoreSection } from './SchoolAverageScoreSection';
import { TopStudentsRankingSection } from './TopStudentsRankingSection';
import { buildSchoolAverageChartRows } from './utils';

export const AdminPerformanceDashboard = () => {
	const { user } = useAuth();
	const isAdmin = user?.role?.includes('admin');
	const [selectedSchoolId, setSelectedSchoolId] =
		useState<string>(ALL_SCHOOLS_VALUE);

	const { data: schools = [] } = useSchools({ enabled: isAdmin });
	const { data: schoolRanking = [], isLoading: isLoadingRanking } =
		useSchoolRanking(ADMIN_PERFORMANCE_GAME, { enabled: isAdmin });
	const { data: topUsers = [], isLoading: isLoadingTop } =
		useAdminPerformanceTopUsers(ADMIN_PERFORMANCE_GAME, selectedSchoolId, {
			limit: TOP_USERS_LIMIT,
			enabled: isAdmin,
		});
	const { data: characterUsage, isLoading: isLoadingCharacterUsage } =
		useAdminDashboardCharacterUsage(ADMIN_PERFORMANCE_GAME, selectedSchoolId, {
			enabled: isAdmin,
		});
	const { data: npsData, isLoading: isLoadingNps } = useAdminDashboardNps(
		ADMIN_PERFORMANCE_GAME,
		selectedSchoolId,
		{ enabled: isAdmin },
	);

	const schoolOptions = useMemo(
		() => [
			{ value: ALL_SCHOOLS_VALUE, label: 'Todas as escolas' },
			...schools.map((school) => ({ value: school.id, label: school.name })),
		],
		[schools],
	);

	const chartRows = useMemo(
		() =>
			buildSchoolAverageChartRows(
				schoolRanking,
				selectedSchoolId,
				ALL_SCHOOLS_VALUE,
			),
		[schoolRanking, selectedSchoolId],
	);

	if (!isAdmin) {
		return null;
	}

	const gameLabel = GameNameEnum[ADMIN_PERFORMANCE_GAME];

	console.log({ characterUsage });

	return (
		<Card>
			<AdminPerformanceDashboardHeader
				gameLabel={gameLabel}
				schoolOptions={schoolOptions}
				selectedSchoolId={selectedSchoolId}
				onSchoolChange={setSelectedSchoolId}
			/>
			<SchoolAverageScoreSection
				isLoading={isLoadingRanking}
				chartRows={chartRows}
			/>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
				<CharacterUsageSection
					isLoading={isLoadingCharacterUsage}
					data={characterUsage}
				/>
				<NpsDistributionSection isLoading={isLoadingNps} data={npsData} />
			</div>
			<TopStudentsRankingSection
				gameLabel={gameLabel}
				isLoading={isLoadingTop}
				topUsers={topUsers}
				showSchoolColumn={selectedSchoolId === ALL_SCHOOLS_VALUE}
			/>
		</Card>
	);
};
