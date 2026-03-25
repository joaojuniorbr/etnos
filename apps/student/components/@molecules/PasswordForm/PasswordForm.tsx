'use client';

import { useAuth } from '@etnos/tools';
import { Button, Form, Input } from 'antd';
import { useState } from 'react';

export const PasswordForm = () => {
	const { user, onChangePassword, onRecoveryPass } = useAuth();

	const [passwordForm] = Form.useForm();
	const [isPasswordLoading, setIsPasswordLoading] = useState(false);

	const onFinishPassword = async (values: {
		currentPassword: string;
		newPassword: string;
		confirmPassword: string;
	}) => {
		setIsPasswordLoading(true);
		const wasChanged = await onChangePassword(
			values.currentPassword,
			values.newPassword
		);

		if (wasChanged) {
			passwordForm.resetFields();
		}

		setIsPasswordLoading(false);
	};

	const onForgotPassword = async () => {
		if (!user?.email) {
			return;
		}

		await onRecoveryPass(user.email);
	};

	return (
		<Form
			layout='vertical'
			form={passwordForm}
			onFinish={onFinishPassword}
			disabled={isPasswordLoading}
		>
			<div className='md:w-1/2'>
				<Form.Item
					name='currentPassword'
					label='Senha Atual'
					rules={[{ required: true, message: 'Informe sua senha atual' }]}
				>
					<Input.Password />
				</Form.Item>
			</div>

			<div className='w-full grid grid-cols-1 md:grid-cols-2 md:gap-x-8'>
				<Form.Item
					name='newPassword'
					label='Nova Senha'
					rules={[
						{ required: true, message: 'Informe a nova senha' },
						{
							min: 6,
							message: 'A nova senha deve ter pelo menos 6 caracteres',
						},
					]}
				>
					<Input.Password />
				</Form.Item>

				<Form.Item
					name='confirmPassword'
					label='Confirmar Nova Senha'
					dependencies={['newPassword']}
					rules={[
						{ required: true, message: 'Confirme a nova senha' },
						({ getFieldValue }) => ({
							validator(_, value) {
								if (!value || getFieldValue('newPassword') === value) {
									return Promise.resolve();
								}

								return Promise.reject(
									new Error('As senhas informadas não coincidem')
								);
							},
						}),
					]}
				>
					<Input.Password />
				</Form.Item>
			</div>

			<div className='flex flex-col md:flex-row md:items-center gap-3 pt-2'>
				<Button type='primary' htmlType='submit' loading={isPasswordLoading}>
					Atualizar Senha
				</Button>

				<Button
					type='default'
					htmlType='button'
					onClick={onForgotPassword}
					disabled={!user?.email}
				>
					Esqueci Minha Senha
				</Button>
			</div>
		</Form>
	);
};
