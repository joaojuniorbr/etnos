'use client';

import {
	Breadcrumb,
	Button,
	Drawer,
	FloatButton,
	Form,
	Input,
	message,
	Spin,
	Table,
	Typography,
} from 'antd';
import { SchoolInterface, schoolService } from '@etnos/tools';
import { useEffect, useState } from 'react';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

export default function EscolasPage() {
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [data, setData] = useState<SchoolInterface[]>([]);
	const [form] = Form.useForm();

	const toggleDrawer = () => {
		setOpen(!open);
	};

	const handleCreateFinish = (values: SchoolInterface) => {
		setIsLoading(true);
		schoolService
			.create(values)
			.then(() => {
				form.resetFields();
				toggleDrawer();
				getSchools();
				message.success('Escola criada com sucesso');
			})
			.catch(() => {
				message.error('Erro ao criar escola');
			})
			.finally(() => {
				setIsLoading(false);
			});
	};

	const handleDelete = (id: string) => {
		setIsLoading(true);
		schoolService
			.delete(id)
			.then(() => {
				message.success('Escola excluida com sucesso');
				getSchools();
			})
			.finally(() => setIsLoading(false));
	};

	const getSchools = () => {
		setIsLoading(true);
		schoolService
			.getAll()
			.then((res) => {
				setData(res);
			})
			.catch((err) => {
				console.log(err);
			})
			.finally(() => {
				setIsLoading(false);
			});
	};

	const handleUpdateField = (id: string, field: string, value: string) => {
		setIsLoading(true);
		schoolService
			.update(id, {
				[field]: value,
			})
			.then(() => {
				message.success('Campo atualizado com sucesso');
				getSchools();
			})
			.catch(() => {
				message.error('Erro ao atualizar campo');
			})
			.finally(() => setIsLoading(false));
	};

	useEffect(() => {
		getSchools();
	}, []);

	return (
		<Spin spinning={isLoading}>
			<div className='container mx-auto py-4 px-6 md:py-10 md:px-0'>
				<Breadcrumb
					items={[
						{ title: 'Home', href: '/' },
						{
							title: 'Área do administrador',
							href: '/admin',
						},
						{
							title: 'Escolas',
						},
					]}
				/>

				<Typography.Title level={1} className='mb-10 mt-4'>
					Escolas
				</Typography.Title>

				<Table
					columns={[
						{
							title: 'Nome',
							key: 'name',
							render: (_, record) => (
								<Typography.Text
									editable={{
										onChange(value) {
											handleUpdateField(record.id, 'name', value);
										},
									}}
								>
									{record.name}
								</Typography.Text>
							),
						},
						{
							title: 'Cidade',
							dataIndex: 'city',
							key: 'city',
						},
						{
							title: 'Estado',
							dataIndex: 'state',
							key: 'state',
						},
						{
							title: 'Ações',
							key: 'action',
							width: 40,
							dataIndex: 'id',
							render: (id: string) => (
								<Button
									danger
									icon={<DeleteOutlined />}
									onClick={() => handleDelete(id)}
								/>
							),
						},
					]}
					dataSource={data}
					pagination={false}
					rowKey='id'
				/>

				<FloatButton
					type='primary'
					icon={<PlusOutlined />}
					onClick={toggleDrawer}
				/>

				<Drawer
					open={open}
					title='Adicionar Escola'
					onClose={toggleDrawer}
					destroyOnHidden
				>
					<Form layout='vertical' form={form} onFinish={handleCreateFinish}>
						<Form.Item name='name' label='Nome'>
							<Input />
						</Form.Item>

						<Form.Item name='city' label='Cidade'>
							<Input />
						</Form.Item>

						<Form.Item name='state' label='Estado'>
							<Input />
						</Form.Item>

						<Button type='primary' htmlType='submit' block>
							Salvar
						</Button>
					</Form>
				</Drawer>
			</div>
		</Spin>
	);
}
