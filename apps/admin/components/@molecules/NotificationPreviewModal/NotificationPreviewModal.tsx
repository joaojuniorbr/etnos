'use client';

import { Button, Descriptions, Modal, Tag, Typography } from 'antd';
import {
	useNotificacoes,
	targetTypeColors,
	targetTypeLabels,
	type NotificationTargetType,
} from '../../@contexts/NotificacoesContext';

export const NotificationPreviewModal = () => {
	const { sendForm, schoolOptions, previewModalOpen, setPreviewModalOpen } =
		useNotificacoes();

	const values = sendForm.getFieldsValue() as {
		title?: string;
		message?: string;
		targetType?: NotificationTargetType;
		schoolId?: string;
		userId?: string;
	};

	const targetType = values.targetType ?? 'GLOBAL';

	return (
		<Modal
			open={previewModalOpen}
			title="Preview da notificação"
			onCancel={() => setPreviewModalOpen(false)}
			footer={
				<Button type="primary" onClick={() => setPreviewModalOpen(false)}>
					Fechar
				</Button>
			}
		>
			<div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
				<Typography.Text strong className="block text-sm text-slate-500">
					Etnos
				</Typography.Text>
				<Typography.Text strong className="block text-base">
					{values.title || '(sem título)'}
				</Typography.Text>
				<Typography.Text className="block text-sm text-slate-700">
					{values.message || '(sem mensagem)'}
				</Typography.Text>
			</div>

			<Descriptions column={1} size="small">
				<Descriptions.Item label="Público alvo">
					<Tag color={targetTypeColors[targetType]}>
						{targetTypeLabels[targetType]}
					</Tag>
				</Descriptions.Item>

				{values.schoolId && (
					<Descriptions.Item label="Escola">
						{schoolOptions.find((s) => s.value === values.schoolId)?.label ??
							values.schoolId}
					</Descriptions.Item>
				)}

				{values.userId && (
					<Descriptions.Item label="Usuário ID">
						{values.userId}
					</Descriptions.Item>
				)}
			</Descriptions>
		</Modal>
	);
};
