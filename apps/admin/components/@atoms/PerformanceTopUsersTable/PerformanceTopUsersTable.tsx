'use client';

import { Table } from 'antd';
import type { UserRankingInterface } from '@etnos/types';

interface PerformanceTopUsersTableProps {
	data: UserRankingInterface[];
	showSchoolColumn: boolean;
}

export const PerformanceTopUsersTable = ({
	data,
	showSchoolColumn,
}: PerformanceTopUsersTableProps) => (
	<Table<UserRankingInterface>
		rowKey={(record) => `${record.uid}-${record.position}`}
		pagination={false}
		dataSource={data}
		columns={[
			{
				title: '#',
				dataIndex: 'position',
				width: 56,
			},
			{
				title: 'Aluno',
				dataIndex: 'childName',
				render: (value: string | null | undefined) => value || '—',
			},
			{
				title: 'Responsável',
				dataIndex: 'parentName',
				render: (value: string | null | undefined) => value || '—',
			},
			...(showSchoolColumn
				? [
						{
							title: 'Escola',
							dataIndex: 'schoolName' as const,
							render: (value: string | null | undefined) => value || '—',
						},
					]
				: []),
			{
				title: 'Pontuação',
				dataIndex: 'totalScore',
				align: 'right' as const,
			},
		]}
		locale={{
			emptyText: 'Nenhum aluno com pontuação neste jogo para o filtro atual.',
		}}
	/>
);
