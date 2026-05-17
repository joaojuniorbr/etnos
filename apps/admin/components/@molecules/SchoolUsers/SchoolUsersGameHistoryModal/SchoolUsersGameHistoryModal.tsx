'use client';

import { Modal, Table } from 'antd';
import { useUserGameScoreHistory } from '@etnos/tools';
import type { SchoolUserInterface, ScoreHistory } from '@etnos/types';
import { formatDateTimePtBr, gameDisplayName, sessionStatusLabel } from '../utils';

interface SchoolUsersGameHistoryModalProps {
	schoolId: string;
	user: SchoolUserInterface | null;
	onClose: () => void;
}

const historyColumns = [
	{
		title: 'Jogo',
		dataIndex: 'gameName',
		key: 'gameName',
		render: (slug: string) => gameDisplayName(slug),
	},
	{
		title: 'Personagem',
		dataIndex: 'characterName',
		key: 'characterName',
		render: (value: string | undefined) => value || '—',
	},
	{
		title: 'Início',
		key: 'startedAt',
		render: (_: unknown, row: ScoreHistory) =>
			formatDateTimePtBr(row.startedAt ?? row.timestamp),
	},
	{
		title: 'Fim',
		key: 'endedAt',
		render: (_: unknown, row: ScoreHistory) => formatDateTimePtBr(row.endedAt),
	},
	{
		title: 'Pontos',
		dataIndex: 'score',
		key: 'score',
		align: 'right' as const,
	},
	{
		title: 'Situação',
		key: 'status',
		render: (_: unknown, row: ScoreHistory) => sessionStatusLabel(row.status),
	},
];

export const SchoolUsersGameHistoryModal = ({
	schoolId,
	user,
	onClose,
}: SchoolUsersGameHistoryModalProps) => {
	const { data: gameHistory = [], isLoading } = useUserGameScoreHistory(
		schoolId,
		user?.uid,
		{ enabled: Boolean(schoolId && user?.uid) },
	);

	return (
		<Modal
			title={
				user
					? `Partidas — ${user.childName ?? user.parentName ?? 'Usuário'}`
					: 'Histórico de partidas'
			}
			open={Boolean(user)}
			onCancel={onClose}
			footer={null}
			width={960}
			destroyOnHidden
		>
			<Table<ScoreHistory>
				rowKey={(row) =>
					row.id ?? `${row.timestamp}-${row.gameName}-${row.characterName}`
				}
				loading={isLoading}
				dataSource={gameHistory}
				columns={historyColumns}
				pagination={{ pageSize: 10, showSizeChanger: true }}
				locale={{
					emptyText: 'Nenhuma partida registrada para este usuário.',
				}}
			/>
		</Modal>
	);
};
