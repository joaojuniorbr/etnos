'use client';

import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from 'recharts';
import type { DashboardPieSliceInterface } from '@etnos/types';
import { DASHBOARD_PIE_COLORS } from '../../types/admin-performance';

interface DashboardPieChartProps {
	slices: DashboardPieSliceInterface[];
	emptyMessage?: string;
}

export const DashboardPieChart = ({
	slices,
	emptyMessage = 'Nenhum dado disponível para o filtro atual.',
}: DashboardPieChartProps) => {
	if (!slices.length) {
		return <p className="text-sm text-slate-500">{emptyMessage}</p>;
	}

	const chartData = slices.map((slice) => ({
		name: slice.label,
		value: slice.value,
		percentage: slice.percentage,
	}));

	return (
		<section className="h-80 w-full">
			<ResponsiveContainer width="100%" height="100%">
				<PieChart>
					<Pie
						data={chartData}
						dataKey="value"
						nameKey="name"
						cx="50%"
						cy="50%"
						outerRadius={110}
						label={({ name, percent }) =>
							`${name} (${(percent * 100).toFixed(1)}%)`
						}
						labelLine={false}
					>
						{chartData.map((entry, index) => (
							<Cell
								key={entry.name}
								fill={DASHBOARD_PIE_COLORS[index % DASHBOARD_PIE_COLORS.length]}
							/>
						))}
					</Pie>
					<Tooltip
						formatter={(value: number, _name, item) => {
							const payload = item?.payload as {
								name?: string;
								percentage?: number;
							};
							return [
								`${value} (${payload?.percentage ?? 0}%)`,
								payload?.name ?? '',
							];
						}}
					/>
					<Legend />
				</PieChart>
			</ResponsiveContainer>
		</section>
	);
};
