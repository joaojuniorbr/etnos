'use client';

import { Spin } from 'antd';
import type { AdminDashboardCharacterUsageInterface } from '@etnos/types';
import { DashboardPieChart, DashboardSectionTitle } from '../../@atoms';

interface CharacterUsageSectionProps {
	isLoading: boolean;
	data?: AdminDashboardCharacterUsageInterface;
}

export const CharacterUsageSection = ({
	isLoading,
	data,
}: CharacterUsageSectionProps) => (
	<section className="relative">
		<DashboardSectionTitle>Personagem mais utilizado</DashboardSectionTitle>
		{data?.topCharacterName ? (
			<p className="text-sm text-slate-600 mb-3">
				<strong className="text-slate-800">{data.topCharacterName}</strong>{' '}
				lidera com {data.slices[0]?.percentage ?? 0}% das {data.totalPlays}{' '}
				partidas registradas no filtro atual.
			</p>
		) : (
			<p className="text-sm text-slate-600 mb-3">
				Distribuição de partidas concluídas por personagem.
			</p>
		)}
		{isLoading ? (
			<div className="flex h-64 items-center justify-center">
				<Spin />
			</div>
		) : (
			<DashboardPieChart
				slices={data?.slices ?? []}
				emptyMessage="Nenhuma partida registrada para este filtro."
			/>
		)}
	</section>
);
