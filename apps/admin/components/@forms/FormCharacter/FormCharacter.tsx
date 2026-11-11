'use client';

import {
	Button,
	Drawer,
	Form,
	Image,
	Input,
	Popconfirm,
	Spin,
	Typography,
	message,
} from 'antd';
import { ImageLibrary, ImageMultipleUpload } from '@etnos/ui';
import { slugfy, useMidia } from '@etnos/tools';
import type { CharacterInterface, UserProfileInterface } from '@etnos/types';
import { useEffect, useState } from 'react';
import { RiDeleteBinLine } from 'react-icons/ri';

type CharacterImageField = 'imageUrl' | 'imageSuccessUrl' | 'imageErrorUrl';

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
	const [libraryField, setLibraryField] = useState<CharacterImageField | null>(
		null,
	);

	const [form] = Form.useForm();
	const imageUrl = Form.useWatch('imageUrl', form);
	const imageSuccessUrl = Form.useWatch('imageSuccessUrl', form);
	const imageErrorUrl = Form.useWatch('imageErrorUrl', form);
	const imageFields: {
		name: CharacterImageField;
		label: string;
		value?: string;
	}[] = [
		{ name: 'imageUrl', label: 'Imagem do personagem', value: imageUrl },
		{
			name: 'imageSuccessUrl',
			label: 'Imagem de sucesso',
			value: imageSuccessUrl,
		},
		{ name: 'imageErrorUrl', label: 'Imagem de erro', value: imageErrorUrl },
	];
	const slug = Form.useWatch('slug', form);
	const avatarFolder = slug ? `avatar/${slug}` : 'avatar/__pending__';

	const {
		data: avatarLibrary,
		isLoading: isLoadingAvatars,
		refetch,
		deleteMidia,
	} = useMidia(user?.uid, 24, avatarFolder);

	const onSlugfy = (str: string) => {
		const slug = slugfy(str);

		form.setFieldValue('slug', slug);
	};

	const handleSelectImage = (url: string) => {
		if (libraryField) {
			form.setFieldValue(libraryField, url);
		}
		setLibraryField(null);
	};

	const handleOnSubmit = (values: CharacterInterface) => {
		onSubmit?.(values);
	};

	const handleDeleteAvatar = async (id?: string, url?: string) => {
		if (!id || !url || !user?.uid) {
			return;
		}

		const result = await deleteMidia({
			id,
			url,
			userId: user.uid,
		});

		if (result) {
			message.success('Avatar excluído com sucesso.');
			refetch();
			return;
		}

		message.error('Não foi possível excluir o avatar.');
	};

	useEffect(() => {
		if (data) {
			form.setFieldsValue(data);
		}
	}, [data, form]);

	return (
		<Spin spinning={isLoading}>
			<Drawer
				size="large"
				open={libraryField !== null}
				placement="bottom"
				title={`Selecione: ${imageFields.find((field) => field.name === libraryField)?.label ?? 'imagem'}`}
				onClose={() => setLibraryField(null)}
			>
				<ImageLibrary user={user} onSelect={handleSelectImage} limitPage={16} />
			</Drawer>

			<Form layout="vertical" form={form} onFinish={handleOnSubmit}>
				<Typography.Paragraph>
					As imagens de sucesso e erro são usadas em todos os jogos deste
					personagem. Enquanto não forem escolhidas, serão usadas as imagens
					padrão.
				</Typography.Paragraph>
				{imageFields.map(({ name, label, value }) => (
					<Form.Item key={name} label={label} required={name === 'imageUrl'}>
						<Form.Item
							name={name}
							rules={[{ required: name === 'imageUrl' }]}
							noStyle
						>
							<Input hidden />
						</Form.Item>
						<div className="flex flex-col gap-2">
							{value && (
								<div className="w-40">
									<Image
										src={value}
										alt={label}
										className="border border-slate-200"
									/>
								</div>
							)}
							<Button
								onClick={() => setLibraryField(name)}
								size="small"
								htmlType="button"
							>
								{value ? 'Alterar imagem' : 'Selecionar imagem'}
							</Button>
							{value && name !== 'imageUrl' && (
								<Button
									onClick={() => form.setFieldValue(name, null)}
									size="small"
									htmlType="button"
								>
									Usar imagem padrão
								</Button>
							)}
						</div>
					</Form.Item>
				))}

				<Form.Item
					name="name"
					label="Nome do Personagem:"
					rules={[
						{
							required: true,
						},
					]}
				>
					<Input />
				</Form.Item>

				<Form.Item
					name="slug"
					label="Slug"
					rules={[
						{
							required: true,
						},
					]}
				>
					<Input onChange={(e) => onSlugfy(e.target.value)} />
				</Form.Item>

				<Form.Item name="region" label="Região">
					<Input />
				</Form.Item>

				<Form.Item
					name="description"
					label="Descrição"
					rules={[
						{
							required: true,
						},
					]}
				>
					<Input.TextArea rows={3} />
				</Form.Item>

				<div className="mb-6 rounded border border-slate-200 p-4">
					<Typography.Title level={5}>Avatares do Personagem</Typography.Title>
					<Typography.Paragraph className="text-slate-500">
						Os avatares serão salvos na pasta{' '}
						<strong>{slug ? `avatar/${slug}` : 'avatar/{slug}'}</strong> e
						ficarão disponíveis no perfil dos alunos.
					</Typography.Paragraph>

					{slug && user?.uid ? (
						<div className="flex flex-col gap-4">
							<ImageMultipleUpload
								userId={user.uid}
								folder={avatarFolder}
								onUpload={() => refetch()}
							/>

							<Spin spinning={isLoadingAvatars}>
								<div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
									{avatarLibrary?.pages
										.flatMap((page) => page.data)
										.map((item) => (
											<div
												key={item.id || item.url}
												className="relative overflow-hidden rounded border border-slate-200"
											>
												<Image
													src={item.url}
													alt={item.url}
													className="aspect-square object-cover"
													preview={false}
												/>
												<div className="absolute right-2 top-2">
													<Popconfirm
														title="Excluir avatar"
														description="Deseja remover este avatar?"
														onConfirm={() =>
															handleDeleteAvatar(item.id, item.url)
														}
													>
														<Button
															type="primary"
															danger
															size="small"
															icon={<RiDeleteBinLine />}
															aria-label="Excluir avatar"
														/>
													</Popconfirm>
												</div>
											</div>
										))}
								</div>
							</Spin>
						</div>
					) : (
						<Typography.Paragraph className="mb-0 text-slate-500">
							Defina o slug do personagem para habilitar o upload e a gestão dos
							avatares.
						</Typography.Paragraph>
					)}
				</div>

				<Button
					type="primary"
					htmlType="submit"
					disabled={isLoading}
					loading={isLoading}
				>
					Salvar
				</Button>
			</Form>
		</Spin>
	);
};
