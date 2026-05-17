'use client';

import { useState } from 'react';
import { Button, Card, Popconfirm, Table, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
	useAuth,
	useNotificationMutations,
	useNotificationTemplates,
} from '@etnos/tools';
import type { NotificationTemplateInterface } from '@etnos/types';
import { useNotificacoes } from '../../@contexts';
import { TemplateDrawer } from '../../@molecules';

export const TemplatesPanel = () => {
	const { user } = useAuth();
	const isAdmin = user?.role?.includes('admin');
	const { sendForm } = useNotificacoes();
	const { createTemplate, updateTemplate, deleteTemplate } =
		useNotificationMutations();

	const [drawerOpen, setDrawerOpen] = useState(false);
	const [editingTemplate, setEditingTemplate] =
		useState<NotificationTemplateInterface | null>(null);

	const { data: templates = [], isLoading } = useNotificationTemplates();

	const handleApply = (template: NotificationTemplateInterface) => {
		sendForm.setFieldsValue({
			title: template.title,
			message: template.message,
		});
		void message.info('Template aplicado ao formulário de envio.');
	};

	const columns = [
		{ title: 'Título', dataIndex: 'title', key: 'title' },
		{ title: 'Mensagem', dataIndex: 'message', key: 'message', ellipsis: true },
		{
			title: 'Ações',
			key: 'actions',
			width: 180,
			render: (_: unknown, record: NotificationTemplateInterface) => (
				<div className="flex flex-row gap-4">
					<Button size="small" onClick={() => handleApply(record)}>
						Usar
					</Button>

					{isAdmin && (
						<>
							<Button
								size="small"
								icon={<EditOutlined />}
								onClick={() => setEditingTemplate(record)}
							/>
							<Popconfirm
								title="Remover template?"
								onConfirm={() =>
									deleteTemplate.mutate(record.id, {
										onSuccess: () => message.success('Template removido.'),
										onError: () =>
											message.error('Erro ao remover template.'),
									})
								}
							>
								<Button
									size="small"
									danger
									icon={<DeleteOutlined />}
									loading={
										deleteTemplate.isPending &&
										deleteTemplate.variables === record.id
									}
								/>
							</Popconfirm>
						</>
					)}
				</div>
			),
		},
	];

	return (
		<>
			<Card
				title="Templates disponíveis"
				extra={
					<Button
						size="small"
						icon={<PlusOutlined />}
						onClick={() => setDrawerOpen(true)}
					>
						Novo template
					</Button>
				}
			>
				<Table
					rowKey="id"
					size="small"
					loading={isLoading}
					dataSource={templates}
					columns={columns}
					pagination={{ pageSize: 6 }}
					locale={{ emptyText: 'Nenhum template cadastrado.' }}
				/>
			</Card>

			<TemplateDrawer
				open={drawerOpen}
				title="Novo Template"
				submitLabel="Salvar template"
				onClose={() => setDrawerOpen(false)}
				loading={createTemplate.isPending}
				onFinish={(values) =>
					createTemplate.mutate(values, {
						onSuccess: () => {
							setDrawerOpen(false);
							message.success('Template criado com sucesso.');
						},
						onError: () => message.error('Erro ao criar template.'),
					})
				}
			/>

			<TemplateDrawer
				open={Boolean(editingTemplate)}
				title="Editar Template"
				submitLabel="Atualizar template"
				onClose={() => setEditingTemplate(null)}
				loading={updateTemplate.isPending}
				onFinish={(values) =>
					updateTemplate.mutate(
						{ id: editingTemplate!.id, payload: values },
						{
							onSuccess: () => {
								setEditingTemplate(null);
								message.success('Template atualizado com sucesso.');
							},
							onError: () => message.error('Erro ao atualizar template.'),
						},
					)
				}
				initialValues={{
					title: editingTemplate?.title,
					message: editingTemplate?.message,
				}}
			/>
		</>
	);
};
