'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Form, Input, Select, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import {
	useAuth,
	useNotificationRecipientsCount,
	useNotificationUserSearch,
} from '@etnos/tools';
import type {
	NotificationTargetType,
	SendNotificationPayload,
} from '@etnos/types';
import { useNotificacoes } from '../../@contexts';

export const SendNotificationForm = () => {
	const { user } = useAuth();
	const isAdmin = user?.role?.includes('admin');
	const [userSearch, setUserSearch] = useState('');

	const {
		sendForm,
		schoolOptions,
		selectedTargetType,
		setSelectedTargetType,
		setPreviewModalOpen,
		isSending,
		onSend,
	} = useNotificacoes();

	const schoolId = Form.useWatch('schoolId', sendForm);
	const userId = Form.useWatch('userId', sendForm);

	const { data: users = [], isFetching: isFetchingUsers } =
		useNotificationUserSearch(userSearch, {
			enabled: selectedTargetType === 'INDIVIDUAL',
		});

	const recipientsPayload = useMemo(() => {
		if (selectedTargetType === 'GLOBAL') {
			return { targetType: selectedTargetType as NotificationTargetType };
		}
		if (selectedTargetType === 'SCHOOL' && schoolId) {
			return {
				targetType: selectedTargetType as NotificationTargetType,
				schoolId,
			};
		}
		if (selectedTargetType === 'INDIVIDUAL' && userId) {
			return {
				targetType: selectedTargetType as NotificationTargetType,
				userId,
			};
		}
		return null;
	}, [selectedTargetType, schoolId, userId]);

	const { data: recipientsCount, isFetching: isFetchingRecipientsCount } =
		useNotificationRecipientsCount(recipientsPayload, {
			enabled: Boolean(recipientsPayload),
		});

	const userOptions = users.map((entry) => ({
		value: entry.id,
		label: `${entry.childName || entry.email || entry.id} · apto para push`,
	}));

	const targetTypeOptions = [
		...(isAdmin
			? [{ value: 'GLOBAL', label: 'Todos os usuários (Global)' }]
			: []),
		{ value: 'SCHOOL', label: 'Escola específica' },
		...(isAdmin ? [{ value: 'INDIVIDUAL', label: 'Usuário individual' }] : []),
	];

	useEffect(() => {
		const targetType: NotificationTargetType = isAdmin ? 'GLOBAL' : 'SCHOOL';
		setSelectedTargetType(targetType);
		sendForm.setFieldValue('targetType', targetType);
	}, [isAdmin, sendForm, setSelectedTargetType]);

	const handleFinish = (values: {
		title: string;
		message: string;
		targetType: NotificationTargetType;
		schoolId?: string;
		userId?: string;
	}) => {
		if (isSending) return;

		const payload: SendNotificationPayload = {
			title: values.title,
			message: values.message,
			targetType: values.targetType,
			...(values.schoolId ? { schoolId: values.schoolId } : {}),
			...(values.userId ? { userId: values.userId } : {}),
		};

		onSend(payload);
	};

	const handlePreview = () => {
		const values = sendForm.getFieldsValue() as {
			title?: string;
			message?: string;
		};
		if (!values.title || !values.message) {
			void message.warning('Preencha o título e a mensagem antes do preview.');
			return;
		}
		setPreviewModalOpen(true);
	};

	let userSelectNotFoundContent: string;
	if (userSearch.length < 2) {
		userSelectNotFoundContent = 'Digite pelo menos 2 caracteres';
	} else if (isFetchingUsers) {
		userSelectNotFoundContent = 'Buscando...';
	} else {
		userSelectNotFoundContent = 'Nenhum usuário encontrado';
	}

	let recipientsAlertDescription: string;
	if (!recipientsPayload) {
		recipientsAlertDescription =
			'Selecione o público para calcular quantas pessoas podem receber a notificação.';
	} else if (isFetchingRecipientsCount) {
		recipientsAlertDescription =
			'Calculando... pessoa(s) habilitada(s) para receber esta notificação.';
	} else {
		recipientsAlertDescription = `${recipientsCount?.count ?? 0} pessoa(s) habilitada(s) para receber esta notificação.`;
	}

	return (
		<Card title="Compor notificação">
			<Form
				form={sendForm}
				layout="vertical"
				onFinish={handleFinish}
				initialValues={{ targetType: isAdmin ? 'GLOBAL' : 'SCHOOL' }}
			>
				<Form.Item
					name="title"
					label="Título"
					rules={[
						{ required: true, message: 'Informe o título.' },
						{ max: 255, message: 'Máximo 255 caracteres.' },
					]}
				>
					<Input placeholder="Ex.: Novo desafio disponível!" />
				</Form.Item>

				<Form.Item
					name="message"
					label="Mensagem"
					rules={[{ required: true, message: 'Informe a mensagem.' }]}
				>
					<Input.TextArea
						rows={4}
						placeholder="Ex.: Entre no app e confira o novo desafio."
						showCount
						maxLength={500}
					/>
				</Form.Item>

				<Form.Item
					name="targetType"
					label="Público alvo"
					rules={[{ required: true }]}
				>
					<Select
						options={targetTypeOptions}
						onChange={(value) =>
							setSelectedTargetType(value as NotificationTargetType)
						}
					/>
				</Form.Item>

				{selectedTargetType === 'SCHOOL' && (
					<Form.Item
						name="schoolId"
						label="Escola"
						rules={[{ required: true, message: 'Selecione uma escola.' }]}
					>
						<Select
							placeholder="Selecione a escola"
							options={schoolOptions}
							showSearch={{
								filterOption: (input, option) =>
									String(option?.label ?? '')
										.toLowerCase()
										.includes(input.toLowerCase()),
							}}
						/>
					</Form.Item>
				)}

				{selectedTargetType === 'INDIVIDUAL' && (
					<Form.Item
						name="userId"
						label="Usuário"
						rules={[{ required: true, message: 'Selecione um usuário.' }]}
					>
						<Select
							placeholder="Digite o nome ou e-mail para buscar"
							options={userOptions}
							showSearch={{
								filterOption: false,
								onSearch: setUserSearch,
							}}
							loading={isFetchingUsers}
							notFoundContent={userSelectNotFoundContent}
						/>
					</Form.Item>
				)}

				<div className="mb-4">
					<Alert
						showIcon
						type={recipientsPayload ? 'info' : 'warning'}
						description={recipientsAlertDescription}
					/>
				</div>

				<div className="flex gap-2">
					<Button onClick={handlePreview} icon={<SendOutlined />}>
						Preview
					</Button>
					<Button
						type="primary"
						htmlType="submit"
						icon={<SendOutlined />}
						loading={isSending}
						block
					>
						Enviar notificação
					</Button>
				</div>
			</Form>
		</Card>
	);
};
