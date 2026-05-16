'use client';

import { Spin } from 'antd';
import { DashboardSectionTitle, SchoolAverageBarChart } from '../../@atoms';
import type { SchoolAverageChartRow } from '../../types';

interface SchoolAverageScoreSectionProps {
	isLoading: boolean;
	chartRows: SchoolAverageChartRow[];
}

export const SchoolAverageScoreSection = ({
	isLoading,
	chartRows,
}: SchoolAverageScoreSectionProps) => (
	<div className="mb-10">
		<DashboardSectionTitle>Pontuação média por escola</DashboardSectionTitle>

		{isLoading && (
			<div className="flex h-64 items-center justify-center">
				<Spin />
			</div>
		)}

		{chartRows.length === 0 ? (
			<p className="text-sm text-slate-500">
				Nenhuma escola com partidas registradas neste jogo para o filtro atual.
			</p>
		) : (
			<SchoolAverageBarChart data={chartRows} />
		)}
	</div>
);
