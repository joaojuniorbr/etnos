'use client';

import {
	Breadcrumb,
	Button,
	Form,
	Input,
	message,
	Spin,
	Typography,
} from 'antd';
import { UploadImage } from '../../components/@Molecules';
import { useUser } from '@etnos/ui';

export default function PersonagensPage() {
	const [form] = Form.useForm();

	const { user } = useUser();

	const slugfy = (str: string) => {
		const slug = str
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-');

		form.setFieldValue('slug', slug);
	};

	const onUpload = (url: string) => {
		form.setFieldValue('imageUrl', url);
		message.success(url);
	};

	if (!user) {
		return null;
	}

	return (
		<Spin spinning={false}>
			<div className='container mx-auto py-4 px-6 md:py-10 md:px-0'>
				<Breadcrumb
					items={[
						{ title: 'Home', href: '/' },
						{
							title: 'Área do administrador',
							href: '/admin',
						},
						{
							title: 'Personagens',
						},
					]}
				/>

				<Typography.Title level={1} className='mb-10 mt-4'>
					Personagens
				</Typography.Title>

				<div className='p-10 bg-white rounded'>
					<Form layout='vertical' form={form}>
						<UploadImage userId={user.uid} onUpload={onUpload} />

						<Form.Item name='name' label='Nome do Personagem:'>
							<Input />
						</Form.Item>

						<Form.Item name='slug' label='Slug'>
							<Input onChange={(e) => slugfy(e.target.value)} />
						</Form.Item>

						<Form.Item name='region' label='Região'>
							<Input />
						</Form.Item>

						<Form.Item name='description' label='Descrição'>
							<Input />
						</Form.Item>

						<Button type='primary'>Salvar</Button>
					</Form>
				</div>
			</div>
		</Spin>
	);
}
