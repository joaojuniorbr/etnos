'use client';

import { Select } from 'antd';
import { Title } from '@etnos/ui';

interface SchoolFilterOption {
	value: string;
	label: string;
}

interface AdminPerformanceDashboardHeaderProps {
	gameLabel: string;
	schoolOptions: SchoolFilterOption[];
	selectedSchoolId: string;
	onSchoolChange: (schoolId: string) => void;
}

export const AdminPerformanceDashboardHeader = ({
	gameLabel,
	schoolOptions,
	selectedSchoolId,
	onSchoolChange,
}: AdminPerformanceDashboardHeaderProps) => (
	<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-6">
		<div>
			<Title className="mb-1">Desempenho pedagógico</Title>
			<p className="text-slate-600 text-sm">
				Pontuação média por escola e top 10 de alunos no {gameLabel}. Filtre por
				escola para focar a análise.
			</p>
		</div>
		<Select
			value={selectedSchoolId}
			onChange={onSchoolChange}
			options={schoolOptions}
			className="w-full md:max-w-sm"
			showSearch={{
				filterOption: (input, option) =>
					String(option?.label ?? '')
						.toLowerCase()
						.includes(input.toLowerCase()),
			}}
			placeholder="Escola"
		/>
	</div>
);
