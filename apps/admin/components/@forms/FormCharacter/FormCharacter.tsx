'use client';

import { Button, Drawer, Form, Image, Input, Spin } from 'antd';
import { ImageLibrary } from '@etnos/ui';
import { slugfy } from '@etnos/tools';
import type { CharacterInterface, UserProfileInterface } from '@etnos/types';
import { useEffect, useState } from 'react';

interface FormCharacterProps {
	user?: UserProfileInterface;
	data?: CharacterInterface;
	isLoading?: boolean;
	onSubmit?: (character: CharacterInterface) => void;
}

export const FormCharacter = ({
	user,
	data,
	isLoading,
	onSubmit,
}: FormCharacterProps) => {
	const [openLibrary, setOpenLibrary] = useState<boolean>(false);

	const [form] = Form.useForm();
	const imageUrl = Form.useWatch('imageUrl', form);

	const onSlugfy = (str: string) => {
		const slug = slugfy(str);

		form.setFieldValue('slug', slug);
	};

	const handleSelectImage = (url: string) => {
		form.setFieldValue('imageUrl', url);
		setOpenLibrary(false);
	};

	const handleOnSubmit = (values: CharacterInterface) => {
		onSubmit?.(values);
	};

	const toggleLibrary = () => setOpenLibrary(!openLibrary);

	useEffect(() => {
		if (data) {
			form.setFieldsValue(data);
		}
	}, [data, form]);

	return (
		<Spin spinning={isLoading}>
			<Drawer
				size='large'
				open={openLibrary}
				placement='bottom'
				title='Selecione uma imagem'
				onClose={() => toggleLibrary()}
			>
				<ImageLibrary user={user} onSelect={handleSelectImage} limitPage={16} />
			</Drawer>

			<Form layout='vertical' form={form} onFinish={handleOnSubmit}>
				<Form.Item name='imageUrl' label='Imagem:' rules={[{ required: true }]}>
					<div className='flex flex-col gap-2'>
						{imageUrl && (
							<div className='w-40'>
								<Image src={imageUrl} className='border border-slate-200' />
							</div>
						)}

						<Button onClick={toggleLibrary} size='small' htmlType='button'>
							{imageUrl ? 'Alterar Imagem' : 'Selecionar Imagem'}
						</Button>
					</div>
				</Form.Item>

				<Form.Item
					name='name'
					label='Nome do Personagem:'
					rules={[
						{
							required: true,
						},
					]}
				>
					<Input />
				</Form.Item>

				<Form.Item
					name='slug'
					label='Slug'
					rules={[
						{
							required: true,
						},
					]}
				>
					<Input onChange={(e) => onSlugfy(e.target.value)} />
				</Form.Item>

				<Form.Item name='region' label='Região'>
					<Input />
				</Form.Item>

				<Form.Item
					name='description'
					label='Descrição'
					rules={[
						{
							required: true,
						},
					]}
				>
					<Input.TextArea rows={3} />
				</Form.Item>

				<Button
					type='primary'
					htmlType='submit'
					disabled={isLoading}
					loading={isLoading}
				>
					Salvar
				</Button>
			</Form>
		</Spin>
	);
};
