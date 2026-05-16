'use client';

import { Spin } from 'antd';
import type { UserRankingInterface } from '@etnos/types';
import { DashboardSectionTitle } from '../../@atoms/DashboardSectionTitle';
import { PerformanceTopUsersTable } from '../../@atoms/PerformanceTopUsersTable';

interface TopStudentsRankingSectionProps {
	gameLabel: string;
	isLoading: boolean;
	topUsers: UserRankingInterface[];
	showSchoolColumn: boolean;
}

export const TopStudentsRankingSection = ({
	gameLabel,
	isLoading,
	topUsers,
	showSchoolColumn,
}: TopStudentsRankingSectionProps) => (
	<div>
		<DashboardSectionTitle>Top 10 alunos — {gameLabel}</DashboardSectionTitle>
		{isLoading ? (
			<div className="flex h-40 items-center justify-center">
				<Spin />
			</div>
		) : (
			<PerformanceTopUsersTable
				data={topUsers}
				showSchoolColumn={showSchoolColumn}
			/>
		)}
	</div>
);
