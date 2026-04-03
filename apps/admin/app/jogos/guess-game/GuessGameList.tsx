'use client';

import { guessGameContentService, useCharacter } from '@etnos/tools';
import type {
	CharacterInterface,
	GuessGameContentInterface,
} from '@etnos/types';
import { ImageLibrary, Title, useUser } from '@etnos/ui';
import { Button, Drawer, Form, Input, Modal, Spin, Table, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useMemo, useState } from 'react';

export const GuessGameList = () => {
	const [selectedCharacter, setSelectedCharacter] =
		useState<CharacterInterface | null>(null);
	const [editingItem, setEditingItem] =
		useState<GuessGameContentInterface | null>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isLibraryOpen, setIsLibraryOpen] = useState(false);
	const [form] = Form.useForm<GuessGameContentInterface>();

	const { data: characters = [], isLoading: isLoadingCharacters } =
		useCharacter();
	const { user } = useUser();
	const queryClient = useQueryClient();

	const { data: content = [], isLoading: isLoadingContent } = useQuery({
		queryKey: ['guess-game-content', selectedCharacter?.slug],
		queryFn: () =>
			guessGameContentService.getContent(selectedCharacter?.slug as string),
		enabled: !!selectedCharacter?.slug,
	});

	const saveMutation = useMutation({
		mutationFn: (payload: GuessGameContentInterface) =>
			guessGameContentService.saveContent(payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ['guess-game-content', selectedCharacter?.slug],
			});
			setIsFormOpen(false);
			setEditingItem(null);
			form.resetFields();
			message.success('Conteúdo salvo com sucesso.');
		},
		onError: () => {
			message.error('Erro ao salvar conteúdo.');
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => guessGameContentService.deleteContent(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ['guess-game-content', selectedCharacter?.slug],
			});
			message.success('Conteúdo removido com sucesso.');
		},
		onError: () => {
			message.error('Erro ao remover conteúdo.');
		},
	});

	const openCharacterEditor = (character: CharacterInterface) => {
		setSelectedCharacter(character);
	};

	const closeCharacterEditor = () => {
		setSelectedCharacter(null);
		setEditingItem(null);
		setIsFormOpen(false);
		form.resetFields();
	};

	const openCreateForm = () => {
		setEditingItem(null);
		form.setFieldsValue({
			title: '',
			word: '',
			tips: [''],
			imageUrl: null,
			description: '',
			characterSlug: selectedCharacter?.slug,
		});
		setIsFormOpen(true);
	};

	const openEditForm = (item: GuessGameContentInterface) => {
		setEditingItem(item);
		form.setFieldsValue({
			id: item.id,
			title: item.title,
			word: item.word,
			tips: item.tips.length ? item.tips : [''],
			imageUrl: item.imageUrl ?? null,
			description: item.description,
			characterSlug: item.characterSlug,
		});
		setIsFormOpen(true);
	};

	const handleSave = async (values: GuessGameContentInterface) => {
		if (!selectedCharacter) {
			return;
		}

		saveMutation.mutate({
			id: editingItem?.id,
			title: values.title.trim(),
			word: values.word.trim(),
			tips: values.tips.map((tip) => tip.trim()).filter(Boolean),
			imageUrl: values.imageUrl?.trim() || null,
			description: values.description.trim(),
			characterSlug: selectedCharacter.slug,
		});
	};

	const handleSelectImage = (url: string) => {
		form.setFieldValue('imageUrl', url);
		setIsLibraryOpen(false);
	};

	const rows = useMemo(
		() =>
			content.map((item) => ({
				...item,
				key: item.id,
			})),
		[content],
	);

	return (
		<Spin
			spinning={
				isLoadingCharacters ||
				isLoadingContent ||
				saveMutation.isPending ||
				deleteMutation.isPending
			}
		>
			<Title className="mb-4 mt-6">Jogo Adivinhe</Title>
			<p className="mb-6 text-slate-600">
				Gerencie as palavras, dicas, imagens e descrições exibidas quando o
				aluno descobre a resposta.
			</p>

			<div className="border border-slate-200 border-b-0">
				<Table
					rowKey="id"
					pagination={false}
					dataSource={characters}
					columns={[
						{
							title: 'Imagem',
							width: 96,
							render: (item: CharacterInterface) =>
								item.imageUrl ? (
									<Image
										src={item.imageUrl}
										alt={item.name}
										width={64}
										height={64}
										className="rounded border border-slate-200 object-cover"
									/>
								) : (
									<div className="flex h-16 w-16 items-center justify-center rounded border border-dashed border-slate-300 text-xs text-slate-400">
										Sem imagem
									</div>
								),
						},
						{
							title: 'Personagem',
							dataIndex: 'name',
						},
						{
							title: 'Slug',
							dataIndex: 'slug',
						},
						{
							title: 'Ações',
							width: 180,
							render: (item: CharacterInterface) => (
								<Button
									type="primary"
									onClick={() => openCharacterEditor(item)}
								>
									Editar conteúdo
								</Button>
							),
						},
					]}
				/>
			</div>

			<Modal
				open={!!selectedCharacter}
				onCancel={closeCharacterEditor}
				footer={null}
				width={1100}
				title={`Conteúdo de ${selectedCharacter?.name ?? ''}`}
				destroyOnHidden
			>
				<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
					<div>
						<p className="text-sm text-slate-500">
							Edite os itens do jogo associados ao personagem
							{selectedCharacter ? ` ${selectedCharacter.name}` : ''}.
						</p>
					</div>

					<Button
						type="primary"
						icon={<PlusOutlined />}
						onClick={openCreateForm}
					>
						Novo conteúdo
					</Button>
				</div>

				<div className="border border-slate-200 border-b-0">
					<Table
						rowKey="id"
						pagination={false}
						dataSource={rows}
						locale={{
							emptyText: 'Nenhum conteúdo cadastrado para este personagem.',
						}}
						columns={[
							{
								title: 'Imagem',
								width: 96,
								render: (item: GuessGameContentInterface) =>
									item.imageUrl ? (
										<Image
											src={item.imageUrl}
											alt={item.word}
											width={64}
											height={64}
											className="rounded border border-slate-200 object-cover"
										/>
									) : (
										<div className="flex h-16 w-16 items-center justify-center rounded border border-dashed border-slate-300 text-xs text-slate-400">
											Sem imagem
										</div>
									),
							},
							{
								title: 'Título',
								dataIndex: 'title',
							},
							{
								title: 'Palavra',
								dataIndex: 'word',
							},
							{
								title: 'Dicas',
								render: (item: GuessGameContentInterface) => item.tips.length,
							},
							{
								title: 'Descrição',
								render: (item: GuessGameContentInterface) => (
									<span className="line-clamp-2">{item.description}</span>
								),
							},
							{
								title: 'Ações',
								width: 140,
								render: (item: GuessGameContentInterface) => (
									<div className="flex gap-2">
										<Button
											icon={<EditOutlined />}
											onClick={() => openEditForm(item)}
										/>
										<Button
											danger
											icon={<DeleteOutlined />}
											onClick={() => deleteMutation.mutate(item.id as string)}
										/>
									</div>
								),
							},
						]}
					/>
				</div>
			</Modal>

			<Drawer
				open={isFormOpen}
				onClose={() => {
					setIsFormOpen(false);
					setEditingItem(null);
				}}
				title={editingItem ? 'Editar conteúdo' : 'Novo conteúdo'}
				size="large"
				destroyOnHidden
			>
				<Form layout="vertical" form={form} onFinish={handleSave}>
					<Form.Item
						name="title"
						label="Título"
						rules={[{ required: true, message: 'Informe o título.' }]}
					>
						<Input placeholder="Ex.: Chimarrão" />
					</Form.Item>

					<Form.Item
						name="word"
						label="Palavra"
						rules={[{ required: true, message: 'Informe a palavra.' }]}
					>
						<Input placeholder="Ex.: Bomba" />
					</Form.Item>

					<Form.List name="tips">
						{(fields, { add, remove }) => (
							<div className="mb-6">
								<div className="mb-2 flex items-center justify-between">
									<div className="text-sm font-medium text-slate-700">
										Dicas
									</div>
									<Button onClick={() => add('')} icon={<PlusOutlined />}>
										Adicionar dica
									</Button>
								</div>

								<div className="space-y-3">
									{fields.map((field, index) => (
										<div key={field.key} className="flex gap-2">
											<Form.Item
												className="mb-0 flex-1"
												name={field.name}
												rules={[
													{
														required: true,
														message: `Informe a dica ${index + 1}.`,
													},
												]}
											>
												<Input placeholder={`Dica ${index + 1}`} />
											</Form.Item>

											<Button
												danger
												onClick={() => remove(field.name)}
												disabled={fields.length === 1}
											>
												Remover
											</Button>
										</div>
									))}
								</div>
							</div>
						)}
					</Form.List>

					<Form.Item name="imageUrl" label="Imagem">
						<Input
							placeholder="Selecione uma imagem na biblioteca"
							readOnly
							suffix={
								<Button type="link" onClick={() => setIsLibraryOpen(true)}>
									Escolher
								</Button>
							}
						/>
					</Form.Item>

					{form.getFieldValue('imageUrl') ? (
						<div className="mb-6">
							<Image
								src={form.getFieldValue('imageUrl')}
								alt="Pré-visualização"
								width={180}
								height={180}
								className="rounded border border-slate-200 object-cover"
							/>
						</div>
					) : null}

					<Form.Item
						name="description"
						label="Descrição"
						rules={[{ required: true, message: 'Informe a descrição.' }]}
					>
						<Input.TextArea
							rows={5}
							placeholder="Explique o que é a palavra e seu significado."
						/>
					</Form.Item>

					<div className="flex justify-end gap-2">
						<Button
							onClick={() => {
								setIsFormOpen(false);
								setEditingItem(null);
							}}
						>
							Cancelar
						</Button>
						<Button type="primary" htmlType="submit">
							Salvar
						</Button>
					</div>
				</Form>
			</Drawer>

			<Drawer
				open={isLibraryOpen}
				onClose={() => setIsLibraryOpen(false)}
				title={`Selecione uma imagem para ${selectedCharacter?.name ?? ''}`}
				size="large"
				placement="bottom"
				destroyOnHidden
			>
				<ImageLibrary
					user={user!}
					folder={`games/${selectedCharacter?.slug}`}
					onSelect={handleSelectImage}
					limitPage={16}
				/>
			</Drawer>
		</Spin>
	);
};
