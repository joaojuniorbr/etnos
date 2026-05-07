'use client';

import { Button, Form, Input } from 'antd';
import type { FormInstance } from 'antd';

type FormTemplateNotificationProps = {
	form?: FormInstance;
	initialValues?: { title?: string; message?: string };
	loading: boolean;
	submitLabel?: string;
	onFinish: (values: { title: string; message: string }) => void;
};

export const FormTemplateNotification = ({
	form,
	initialValues,
	loading,
	submitLabel = 'Salvar',
	onFinish,
}: FormTemplateNotificationProps) => (
	<Form
		form={form}
		layout="vertical"
		initialValues={initialValues}
		onFinish={onFinish}
	>
		<Form.Item
			name="title"
			label="Título"
			rules={[{ required: true, message: 'Informe o título.' }]}
		>
			<Input />
		</Form.Item>

		<Form.Item
			name="message"
			label="Mensagem"
			rules={[{ required: true, message: 'Informe a mensagem.' }]}
		>
			<Input.TextArea rows={4} showCount maxLength={500} />
		</Form.Item>

		<Button type="primary" htmlType="submit" block loading={loading}>
			{submitLabel}
		</Button>
	</Form>
);
