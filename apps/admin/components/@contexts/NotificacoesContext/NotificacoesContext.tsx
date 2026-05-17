'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Form, message } from 'antd';
import type { FormInstance } from 'antd';
import type { NotificationTargetType, SendNotificationPayload } from '@etnos/types';
import {
	useManagedSchools,
	useNotificationMutations,
	useSchools,
	useAuth,
} from '@etnos/tools';

type NotificacoesContextValue = {
	sendForm: FormInstance;
	schoolOptions: { value: string; label: string }[];
	selectedTargetType: NotificationTargetType;
	setSelectedTargetType: (value: NotificationTargetType) => void;
	previewModalOpen: boolean;
	setPreviewModalOpen: (value: boolean) => void;
	isSending: boolean;
	onSend: (payload: SendNotificationPayload) => void;
};

const NotificacoesContext = createContext<NotificacoesContextValue | null>(null);

export const NotificacoesProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const { isAdmin } = useAuth();
	const { sendNotification } = useNotificationMutations();

	const [sendForm] = Form.useForm();
	const [selectedTargetType, setSelectedTargetType] =
		useState<NotificationTargetType>('GLOBAL');
	const [previewModalOpen, setPreviewModalOpen] = useState(false);

	const { data: schools = [] } = useSchools({ enabled: isAdmin });
	const { data: managedSchools = [] } = useManagedSchools({
		enabled: !isAdmin,
	});

	const schoolOptions = (isAdmin ? schools : managedSchools).map((school) => ({
		value: school.id,
		label: school.name,
	}));

	const handleSend = useCallback(
		(payload: SendNotificationPayload) => {
			sendNotification.mutate(payload, {
				onSuccess: (data) => {
					sendForm.resetFields();
					const nextTargetType: NotificationTargetType = isAdmin
						? 'GLOBAL'
						: 'SCHOOL';
					setSelectedTargetType(nextTargetType);
					sendForm.setFieldValue('targetType', nextTargetType);
					message.success(
						`Notificação enviada para ${data.sent} dispositivo(s).`,
					);
				},
				onError: () => {
					message.error('Erro ao enviar notificação.');
				},
			});
		},
		[isAdmin, sendForm, sendNotification],
	);

	const value = useMemo(
		() => ({
			sendForm,
			schoolOptions,
			selectedTargetType,
			setSelectedTargetType,
			previewModalOpen,
			setPreviewModalOpen,
			isSending: sendNotification.isPending,
			onSend: handleSend,
		}),
		[
			sendForm,
			schoolOptions,
			selectedTargetType,
			previewModalOpen,
			sendNotification.isPending,
			handleSend,
		],
	);

	return (
		<NotificacoesContext.Provider value={value}>
			{children}
		</NotificacoesContext.Provider>
	);
};

export const useNotificacoes = () => {
	const context = useContext(NotificacoesContext);
	if (!context) {
		throw new Error(
			'useNotificacoes deve ser usado dentro de um NotificacoesProvider',
		);
	}
	return context;
};
