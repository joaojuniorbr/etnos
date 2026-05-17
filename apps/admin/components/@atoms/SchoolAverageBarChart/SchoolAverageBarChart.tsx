'use client';

import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import type { SchoolAverageChartRow } from '@etnos/types';

interface SchoolAverageBarChartProps {
	data: SchoolAverageChartRow[];
}

export const SchoolAverageBarChart = ({ data }: SchoolAverageBarChartProps) => (
	<section className="h-96 w-full">
		<ResponsiveContainer width="100%" height="100%">
			<BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 64 }}>
				<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
				<XAxis
					dataKey="name"
					interval={0}
					textAnchor="end"
					height={72}
					tick={{ fontSize: 11, fill: '#475569' }}
				/>
				<YAxis
					tick={{ fontSize: 11, fill: '#475569' }}
					label={{
						value: 'Média',
						position: 'insideLeft',
						style: { fill: '#64748b', fontSize: 12 },
					}}
				/>
				<Tooltip
					formatter={(
						value: number,
						_name: string,
						item: { payload?: { fullName?: string } },
					) => {
						const full = item?.payload?.fullName;
						return [
							Number(value).toFixed(2),
							full ? `Média (${full})` : 'Média',
						];
					}}
				/>
				<Bar dataKey="media" fill="#2563eb" radius={[4, 4, 0, 0]} />
			</BarChart>
		</ResponsiveContainer>
	</section>
);
