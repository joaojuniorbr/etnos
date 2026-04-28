'use client';

import { useState } from 'react';
import { Button, Card, Popconfirm, Table, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsService, useAuth } from '@etnos/tools';
import type { NotificationTemplateInterface } from '@etnos/types';
import { useNotificacoes } from '../../@contexts/NotificacoesContext';
import { TemplateDrawer } from '../../@molecules/TemplateDrawer';

export const TemplatesPanel = () => {
	const { user } = useAuth();
	const isAdmin = user?.role?.includes('admin');
	const { sendForm } = useNotificacoes();
	const queryClient = useQueryClient();

	const [drawerOpen, setDrawerOpen] = useState(false);
	const [editingTemplate, setEditingTemplate] =
		useState<NotificationTemplateInterface | null>(null);

	const { data: templates = [], isLoading } = useQuery<
		NotificationTemplateInterface[]
	>({
		queryKey: ['notifications', 'templates'],
		queryFn: () => notificationsService.getTemplates(),
	});

	const createMutation = useMutation({
		mutationFn: (values: { title: string; message: string }) =>
			notificationsService.createTemplate(values),
		onSuccess: () => {
			setDrawerOpen(false);
			void queryClient.invalidateQueries({
				queryKey: ['notifications', 'templates'],
			});
			void message.success('Template criado com sucesso.');
		},
		onError: () => void message.error('Erro ao criar template.'),
	});

	const updateMutation = useMutation({
		mutationFn: (values: { title: string; message: string }) =>
			notificationsService.updateTemplate(editingTemplate!.id, values),
		onSuccess: () => {
			setEditingTemplate(null);
			void queryClient.invalidateQueries({
				queryKey: ['notifications', 'templates'],
			});
			void message.success('Template atualizado com sucesso.');
		},
		onError: () => void message.error('Erro ao atualizar template.'),
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => notificationsService.deleteTemplate(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ['notifications', 'templates'],
			});
			void message.success('Template removido.');
		},
		onError: () => void message.error('Erro ao remover template.'),
	});

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
								onConfirm={() => deleteMutation.mutate(record.id)}
							>
								<Button
									size="small"
									danger
									icon={<DeleteOutlined />}
									loading={
										deleteMutation.isPending &&
										deleteMutation.variables === record.id
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
				loading={createMutation.isPending}
				onFinish={(values: { title: string; message: string }) =>
					createMutation.mutate(values)
				}
			/>

			<TemplateDrawer
				open={Boolean(editingTemplate)}
				title="Editar Template"
				submitLabel="Atualizar template"
				onClose={() => setEditingTemplate(null)}
				loading={updateMutation.isPending}
				onFinish={(values: { title: string; message: string }) =>
					updateMutation.mutate(values)
				}
				initialValues={{
					title: editingTemplate?.title,
					message: editingTemplate?.message,
				}}
			/>
		</>
	);
};
