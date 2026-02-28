import { useAuth } from '@etnos/tools';
import { Divider, Form, Input, message, Spin } from 'antd';
import { useState } from 'react';
import { Button } from '../../@atoms';

interface LoginFormProps {
	onLoginSuccess: () => void;
}

export const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
	const [form] = Form.useForm();

	const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

	const { onSignInWithEmailAndPassword, isLoading, loginWithGoogle } =
		useAuth();

	const onFinish = async (values: { login: string; password: string }) => {
		onSignInWithEmailAndPassword(values.login, values.password)
			.then((user) => {
				if (user) {
					onLoginSuccess();
				} else {
					message.error('Email ou senha inválidos');
				}
			})
			.catch(() => {
				message.error('Email ou senha inválidos');
			});
	};

	const onLoginWithGoogle = async () => {
		setIsLoadingGoogle(true);
		const user = await loginWithGoogle();
		if (user?.email) {
			onLoginSuccess();
			form.resetFields();
		} else {
			setIsLoadingGoogle(false);
		}
	};

	return (
		<Spin spinning={isLoading || isLoadingGoogle}>
			<div className='ui:flex ui:flex-col ui:justify-center ui:gap-6'>
				<h1 className='ui:text-xl ui:uppercase ui:font-bold ui:text-center ui:text-primary'>
					Acesse sua conta
				</h1>

				<Form layout='vertical' onFinish={onFinish} size='large' form={form}>
					<Form.Item name='login' rules={[{ required: true }]} label='Email'>
						<Input placeholder='Digite seu email' />
					</Form.Item>

					<Form.Item name='password' rules={[{ required: true }]} label='Senha'>
						<Input.Password placeholder='Digite sua senha' />
					</Form.Item>

					<div className='ui:pt-4'>
						<Button block type='secondary' htmlType='submit'>
							ENTRAR
						</Button>
					</div>
				</Form>

				<Divider>ou</Divider>

				<button
					onClick={onLoginWithGoogle}
					className='ui:border ui:border-gray-200 ui:rounded-full ui:py-3 ui:px-6 ui:inline-flex ui:items-center ui:gap-2 ui:justify-center ui:font-bold ui:text-black ui:mx-auto ui:text-xs ui:cursor-pointer ui:hover:bg-gray-100 ui:transition'
				>
					<img src='/images/google-icon.svg' alt='Google' className='ui:w-4' />
					ENTRAR COM GOOGLE
				</button>
			</div>
		</Spin>
	);
};
