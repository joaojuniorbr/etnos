'use client';

import { createContext, useContext, useState } from 'react';
import { Form, message } from 'antd';
import type { FormInstance } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsService, schoolService, useAuth } from '@etnos/tools';
import type { SendNotificationPayload } from '@etnos/types';

export type NotificationTargetType = 'GLOBAL' | 'SCHOOL' | 'INDIVIDUAL';

export const targetTypeLabels: Record<NotificationTargetType, string> = {
	GLOBAL: 'Geral',
	SCHOOL: 'Escola',
	INDIVIDUAL: 'Individual',
};

export const targetTypeColors: Record<NotificationTargetType, string> = {
	GLOBAL: 'blue',
	SCHOOL: 'green',
	INDIVIDUAL: 'orange',
};

type NotificacoesContextValue = {
	sendForm: FormInstance;
	schoolOptions: { value: string; label: string }[];
	selectedTargetType: NotificationTargetType;
	setSelectedTargetType: (v: NotificationTargetType) => void;
	previewModalOpen: boolean;
	setPreviewModalOpen: (v: boolean) => void;
	isSending: boolean;
	onSend: (payload: SendNotificationPayload) => void;
};

const NotificacoesContext = createContext<NotificacoesContextValue | null>(
	null,
);

export const NotificacoesProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const { isAdmin } = useAuth();
	const queryClient = useQueryClient();

	const [sendForm] = Form.useForm();
	const [selectedTargetType, setSelectedTargetType] =
		useState<NotificationTargetType>('GLOBAL');
	const [previewModalOpen, setPreviewModalOpen] = useState(false);

	const { data: schools = [] } = useQuery({
		queryKey: ['schools', 'admin'],
		queryFn: () => schoolService.getAll(),
		enabled: isAdmin,
	});

	const { data: managedSchools = [] } = useQuery({
		queryKey: ['schools', 'me', 'managed'],
		queryFn: () => schoolService.getManagedSchools(),
		enabled: !isAdmin,
	});

	const schoolOptions = (isAdmin ? schools : managedSchools).map((school) => ({
		value: school.id,
		label: school.name,
	}));

	const sendMutation = useMutation({
		mutationFn: (payload: SendNotificationPayload) =>
			notificationsService.send(payload),
		onSuccess: (data) => {
			sendForm.resetFields();
			setSelectedTargetType('GLOBAL');
			void queryClient.invalidateQueries({
				queryKey: ['notifications', 'history'],
			});
			message.success(`Notificação enviada para ${data.sent} dispositivo(s).`);
		},
		onError: () => {
			message.error('Erro ao enviar notificação.');
		},
	});

	return (
		<NotificacoesContext.Provider
			value={{
				sendForm,
				schoolOptions,
				selectedTargetType,
				setSelectedTargetType,
				previewModalOpen,
				setPreviewModalOpen,
				isSending: sendMutation.isPending,
				onSend: sendMutation.mutate,
			}}
		>
			{children}
		</NotificacoesContext.Provider>
	);
};

export const useNotificacoes = () => {
	const context = useContext(NotificacoesContext);
	if (!context)
		throw new Error('useNotificacoes must be used inside NotificacoesProvider');
	return context;
};
