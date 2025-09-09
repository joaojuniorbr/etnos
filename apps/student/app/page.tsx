'use client';

import { Breadcrumb, Button, DatePicker, Form, Input } from 'antd';
import { useAuth } from '@etnos/tools';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

export default function Page() {
	const [form] = Form.useForm();
	const [isLoading, setIsLoading] = useState(false);
	const { user, updateUserProfile } = useAuth();

	useEffect(() => {
		if (!user) {
			return;
		}

		form.setFieldsValue({
			childName: user.childName,
			childBirthDate: user.childBirthDate ? dayjs(user.childBirthDate) : null,
			parentName: user.parentName,
			email: user.email,
		});
	}, [user, form]);

	const onFinish = async (values: any) => {
		setIsLoading(true);
		await updateUserProfile({
			...values,
			childBirthDate: values.childBirthDate
				? dayjs(values.childBirthDate).format('YYYY-MM-DD')
				: null,
		});
		setIsLoading(false);
	};

	if (!user) {
		return null;
	}

	return (
		<div className='container mx-auto py-4 px-6 md:py-10 md:px-0'>
			<Breadcrumb
				items={[
					{ title: 'Home', href: '/' },
					{
						title: 'Área do estudante',
					},
				]}
			/>

			<div className='flex w-full pt-4 md:flex-row flex-col gap-6'>
				<div className='md:w-1/3'>
					<div className='bg-white p-8 rounded shadow'>
						<img
							src={user?.photoURL || `https://robohash.org/${user?.email}`}
							alt={(user?.displayName as string) || (user?.email as string)}
							width={150}
							height={150}
							className='object-cover object-center w-32 h-32 rounded-full border border-slate-200 mx-auto mb-4'
						/>

						<h2 className='text-md text-center font-bold pb-6 mb-6 border-b-2 border-dotted border-slate-200'>
							{user?.childName || user?.email}
						</h2>

						<div className='flex flex-col gap-4'>
							<div className='flex items-center justify-between gap-2 w-full'>
								<span className='text-xs text-slate-800'>Pontuação</span>
								<span className='text-xs font-bold text-black'>[WIP]</span>
							</div>

							<div className='flex items-center justify-between gap-2 w-full'>
								<span className='text-xs text-slate-800'>Nome da Escola</span>
								<span className='text-xs font-bold text-black'>[WIP]</span>
							</div>
						</div>
					</div>
				</div>
				<div className='md:w-2/3'>
					<div className='bg-white p-8 rounded shadow'>
						<h2 className='text-xl font-bold text-primary mb-6'>
							Editar Perfil
						</h2>

						<Form
							layout='vertical'
							form={form}
							onFinish={onFinish}
							disabled={isLoading}
						>
							<div className='grid grid-cols-1 md:grid-cols-2 md:gap-x-8 w-full'>
								<Form.Item name='childName' label='Nome da Criança'>
									<Input />
								</Form.Item>

								<Form.Item name='childBirthDate' label='Data de Nascimento'>
									<DatePicker className='w-full' format='DD/MM/YYYY' />
								</Form.Item>

								<Form.Item name='parentName' label='Nome Pai/Mãe'>
									<Input />
								</Form.Item>

								<Form.Item name='email' label='Email'>
									<Input disabled />
								</Form.Item>
							</div>

							<div className='text-center pt-4 md:text-left'>
								<Button type='primary' htmlType='submit' loading={isLoading}>
									Salvar Alterações
								</Button>
							</div>
						</Form>
					</div>
				</div>
			</div>
		</div>
	);
}
