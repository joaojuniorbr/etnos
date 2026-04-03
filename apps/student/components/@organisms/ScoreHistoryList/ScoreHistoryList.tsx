'use client';

import { Table, Spin, Alert, Empty, Tag } from 'antd';
import dayjs from 'dayjs';
import { GameNameEnum, ScoreHistory } from '@etnos/types';

interface ScoreHistoryListProps {
	history?: ScoreHistory[];
	isLoading: boolean;
	isError: boolean;
}

export const ScoreHistoryList = ({
	history,
	isLoading,
	isError,
}: ScoreHistoryListProps) => {
	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-20">
				<Spin size="large" description="Carregando..." />
			</div>
		);
	}

	if (isError) {
		return (
			<Alert
				description="Não foi possível carregar o seu histórico de pontuação. Tente novamente em instantes."
				type="error"
				showIcon
			/>
		);
	}

	if (!history || history.length === 0) {
		return (
			<Empty
				description="Nenhum registro encontrado"
				image={Empty.PRESENTED_IMAGE_SIMPLE}
			/>
		);
	}

	const columns = [
		{
			title: 'Jogo',
			dataIndex: 'gameName',
			key: 'gameName',
			render: (text: string) => (
				<div className="flex flex-col">
					<span className="font-bold text-primary capitalize text-sm md:text-base">
						{GameNameEnum[text as keyof typeof GameNameEnum] || text}
					</span>
				</div>
			),
		},
		{
			title: 'Personagem',
			dataIndex: 'characterName',
			key: 'characterName',
			render: (text: string) => (
				<span className="text-sm md:text-base text-slate-600">{text}</span>
			),
		},
		{
			title: 'Data e Hora',
			dataIndex: 'timestamp',
			key: 'timestamp',
			render: (timestamp: string) => (
				<span className="text-xs md:text-sm text-slate-500">
					{dayjs(timestamp).format('DD/MM/YYYY - HH:mm')}
				</span>
			),
		},
		{
			title: 'Pontuação',
			dataIndex: 'score',
			key: 'score',
			align: 'right' as const,
			render: (score: number) => (
				<Tag color="blue" className="m-0 font-bold">
					{score} pts
				</Tag>
			),
		},
	];

	return (
		<div className="bg-white shadow rounded overflow-hidden">
			<Table
				dataSource={history}
				columns={columns}
				rowKey={(record) => record.timestamp + record.gameName}
				pagination={false}
				className="w-full"
				scroll={{ x: true }}
			/>
		</div>
	);
};
