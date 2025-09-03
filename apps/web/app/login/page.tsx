'use client';

import { signImage } from '@etnos/common';
import { Button, Form, Input } from 'antd';
import Image from 'next/image';

export default function LoginPage() {
	return (
		<div className='p-0 pb-1 md:p-8'>
			<div className='flex flex-col w-full rounded bg-white md:flex-row'>
				<Image
					src={`${signImage?.url}`}
					alt={`${signImage?.name}`}
					width={800}
					height={800}
					className='object-cover object-center w-full md:w-1/2 md:order-2 md:rounded-tr md:rounded-br'
				/>

				<div className='p-8 flex flex-col justify-center gap-6 md:w-1/2'>
					<h1 className='text-xl uppercase font-bold text-center text-primary'>
						Acesse sua conta
					</h1>

					<Form layout='vertical'>
						<Form.Item name='login' rules={[{ required: true }]} label='Email'>
							<Input placeholder='Digite seu email' />
						</Form.Item>

						<Form.Item name='senha' rules={[{ required: true }]} label='Senha'>
							<Input.Password placeholder='Digite sua senha' />
						</Form.Item>

						<div className='pt-4'>
							<Button block type='primary'>
								ENTRAR
							</Button>
						</div>
					</Form>
				</div>
			</div>
		</div>
	);
}
