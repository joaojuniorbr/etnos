'use client';

import { Card } from '@etnos/ui';
import { useAdminPerformanceDashboard, useAuth } from '@etnos/tools';
import { GameNameEnum } from '@etnos/types';
import { AdminPerformanceDashboardHeader } from './AdminPerformanceDashboardHeader';
import { CharacterUsageSection } from './CharacterUsageSection';
import { NpsDistributionSection } from './NpsDistributionSection';
import { SchoolAverageScoreSection } from './SchoolAverageScoreSection';
import { TopStudentsRankingSection } from './TopStudentsRankingSection';

export const AdminPerformanceDashboard = () => {
	const { user } = useAuth();
	const isAdmin = user?.role?.includes('admin');

	const {
		gameSlug,
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
		showSchoolColumn,
	} = useAdminPerformanceDashboard({ enabled: isAdmin });

	if (!isAdmin) {
		return null;
	}

	const gameLabel = GameNameEnum[gameSlug];

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
				showSchoolColumn={showSchoolColumn}
			/>
		</Card>
	);
};
