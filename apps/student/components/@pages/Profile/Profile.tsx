'use client';

import { Button, DatePicker, Form, Image, Input } from 'antd';
import { useAuth } from '@etnos/tools';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

export const ProfilePage = () => {
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

	const onFinish = async (values: {
		childName: string;
		childBirthDate: dayjs.Dayjs | null;
		parentName: string;
		email: string;
	}) => {
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

	const profileImage = user?.photoURL || `https://robohash.org/${user?.email}`;
	const profileName = user?.childName || (user?.email as string);

	return (
		<div className='flex w-full pt-4 md:flex-row flex-col gap-6'>
			<div className='md:w-1/3'>
				<div className='bg-white p-8 rounded shadow'>
					<div className='flex justify-center w-full'>
						<Image
							src={profileImage}
							alt={profileName}
							width={150}
							height={150}
							className='object-cover object-center w-24 h-24 rounded-full border border-slate-200 mb-4'
						/>
					</div>

					<h2 className='text-md text-center font-bold pb-6 mb-6 border-b-2 border-dotted border-slate-200'>
						{profileName}
					</h2>

					<div className='flex flex-col gap-4'>
						<div className='flex items-center justify-between gap-2 w-full'>
							<span className='text-xs text-slate-800'>Pontuação</span>
							<span className='text-xs font-bold text-black'>[WIP]</span>
						</div>

						<div className='flex items-center justify-between gap-2 w-full'>
							<span className='text-xs text-slate-800'>Nome da Escola</span>
							<span className='text-xs font-bold text-black'>
								{user.school}
							</span>
						</div>
					</div>
				</div>
			</div>
			<div className='md:w-2/3'>
				<div className='bg-white p-8 rounded shadow'>
					<h2 className='text-xl font-bold text-primary mb-6'>Editar Perfil</h2>

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
	);
};
