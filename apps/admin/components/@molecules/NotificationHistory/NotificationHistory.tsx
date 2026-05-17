'use client';

import { Card, Table, Tag } from 'antd';
import { useNotificationHistory } from '@etnos/tools';
import type { NotificationTargetType } from '@etnos/types';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { targetTypeColors, targetTypeLabels } from '../../@contexts';

dayjs.locale('pt-br');

const columns = [
	{
		title: 'Data/Hora',
		dataIndex: 'sentAt',
		key: 'sentAt',
		width: 160,
		render: (value: string) => dayjs(value).format('DD/MM/YYYY HH:mm'),
	},
	{ title: 'Título', dataIndex: 'title', key: 'title' },
	{ title: 'Mensagem', dataIndex: 'message', key: 'message', ellipsis: true },
	{
		title: 'Alvo',
		dataIndex: 'targetType',
		key: 'targetType',
		width: 120,
		render: (value: NotificationTargetType) => (
			<Tag color={targetTypeColors[value]}>{targetTypeLabels[value]}</Tag>
		),
	},
	{
		title: 'Escola',
		dataIndex: 'schoolName',
		key: 'schoolName',
		render: (value: string | null) => value ?? '-',
	},
	{
		title: 'Enviado por',
		dataIndex: 'sentByEmail',
		key: 'sentByEmail',
		render: (value: string | null) => value ?? '-',
	},
	{
		title: 'Dispositivos',
		dataIndex: 'tokenCount',
		key: 'tokenCount',
		width: 100,
		align: 'center' as const,
	},
];

export const NotificationHistory = () => {
	const { data: history = [], isLoading } = useNotificationHistory();

	return (
		<Card>
			<Table
				rowKey="id"
				loading={isLoading}
				dataSource={history}
				columns={columns}
				pagination={{ pageSize: 10 }}
				locale={{ emptyText: 'Nenhuma notificação enviada ainda.' }}
				scroll={{ x: 900 }}
			/>
		</Card>
	);
};
