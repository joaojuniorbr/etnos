'use client';

import { Button, Form, Input, message, Spin } from 'antd';
import Image from 'next/image';
import { useAuth } from '@etnos/tools';

import { useRandomCharacter } from '@etnos/hooks';

export default function LoginPage() {
	const { character } = useRandomCharacter();

	const { onSignInWithEmailAndPassword, isLoading } = useAuth();

	const onFinish = async (values: { login: string; password: string }) => {
		const user = await onSignInWithEmailAndPassword(
			values.login,
			values.password
		);
		if (user) {
			window.open('/estudante', '_self');
		} else {
			message.error('Email ou senha inválidos');
		}
	};

	return (
		<Spin spinning={isLoading}>
			<div className='p-0 pb-1 md:p-8'>
				<div className='container mx-auto'>
					<div className='flex flex-col w-full rounded bg-white md:flex-row'>
						<Image
							src={`${character?.featureImageUrl}`}
							alt={`${character?.name}`}
							width={800}
							height={800}
							className='object-cover object-center w-full md:w-1/2 md:order-2 md:rounded-tr md:rounded-br'
						/>

						<div className='p-8 flex flex-col justify-center gap-6 md:w-1/2'>
							<h1 className='text-xl uppercase font-bold text-center text-primary'>
								Acesse sua conta
							</h1>

							<Form layout='vertical' onFinish={onFinish}>
								<Form.Item
									name='login'
									rules={[{ required: true }]}
									label='Email'
								>
									<Input placeholder='Digite seu email' />
								</Form.Item>

								<Form.Item
									name='password'
									rules={[{ required: true }]}
									label='Senha'
								>
									<Input.Password placeholder='Digite sua senha' />
								</Form.Item>

								<div className='pt-4'>
									<Button block type='primary' htmlType='submit'>
										ENTRAR
									</Button>
								</div>
							</Form>
						</div>
					</div>
				</div>
			</div>
		</Spin>
	);
}
