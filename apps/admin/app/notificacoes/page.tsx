'use client';

import { Breadcrumb, Spin, Tabs } from 'antd';
import { Title } from '@etnos/ui';
import {
	NotificacoesProvider,
	useNotificacoes,
	SendNotificationForm,
	TemplatesPanel,
	NotificationHistory,
	NotificationPreviewModal,
} from '@etnos/components';

const tabs = [
	{
		key: 'send',
		label: 'Enviar',
		children: (
			<div className="grid gap-6 md:grid-cols-2">
				<SendNotificationForm />
				<TemplatesPanel />
			</div>
		),
	},
	{
		key: 'history',
		label: 'Histórico',
		children: <NotificationHistory />,
	},
];

function NotificacoesContent() {
	const { isSending } = useNotificacoes();

	return (
		<Spin spinning={isSending}>
			<div className="container mx-auto py-4 px-6 md:py-10 md:px-0">
				<Breadcrumb
					items={[
						{ title: 'Home', href: '/' },
						{ title: 'Área do administrador', href: '/admin' },
						{ title: 'Notificações' },
					]}
				/>
				<Title className="mb-6 mt-6">Notificações</Title>
				<Tabs defaultActiveKey="send" items={tabs} />
				<NotificationPreviewModal />
			</div>
		</Spin>
	);
}

export default function NotificacoesPage() {
	return (
		<NotificacoesProvider>
			<NotificacoesContent />
		</NotificacoesProvider>
	);
}
