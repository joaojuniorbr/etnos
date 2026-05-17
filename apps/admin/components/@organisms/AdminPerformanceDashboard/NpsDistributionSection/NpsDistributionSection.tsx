'use client';

import { Spin } from 'antd';
import type { AdminDashboardNpsInterface } from '@etnos/types';
import { DashboardPieChart, DashboardSectionTitle } from '../../../@atoms';

interface NpsDistributionSectionProps {
	isLoading: boolean;
	data?: AdminDashboardNpsInterface;
}

const getNpsDescription = (data?: AdminDashboardNpsInterface) => {
	if (!data?.totalResponses) {
		return 'Avaliações de 1 a 5 enviadas pelos estudantes após jogar.';
	}

	if (data.viewMode === 'by_rating') {
		return (
			<>
				{data.totalResponses} resposta(s) nesta escola
				{data.averageRating
					? ` · média ${data.averageRating.toFixed(2)}`
					: null}
				. Distribuição por nota.
			</>
		);
	}

	return (
		<>
			{data.totalResponses} resposta(s) no total
			{data.averageRating
				? ` · média geral ${data.averageRating.toFixed(2)}`
				: null}
			. Participação por escola.
		</>
	);
};

export const NpsDistributionSection = ({
	isLoading,
	data,
}: NpsDistributionSectionProps) => (
	<section className="relative">
		<DashboardSectionTitle>NPS por escola</DashboardSectionTitle>
		<p className="text-sm text-slate-600 mb-3">{getNpsDescription(data)}</p>
		{isLoading ? (
			<div className="flex h-64 items-center justify-center">
				<Spin />
			</div>
		) : (
			<DashboardPieChart
				slices={data?.slices ?? []}
				emptyMessage="Nenhuma avaliação NPS registrada para este filtro."
			/>
		)}
	</section>
);
