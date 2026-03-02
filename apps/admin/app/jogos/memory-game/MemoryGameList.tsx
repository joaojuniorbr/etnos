'use client';

import {
	configGamesService,
	memoryGameContentService,
	useCharacter,
	useGamesConfig,
} from '@etnos/tools';
import {
	type CharacterInterface,
	type ConfigGamesInterface,
	GamesEnum,
	type MemoryGameContentInterface,
} from '@etnos/types';
import { RiCloseLine } from 'react-icons/ri';
import { ImageLibrary, useUser } from '@etnos/ui';
import { Button, Drawer, Modal, Spin, Table, Typography } from 'antd';
import Image from 'next/image';
import { useState } from 'react';

export const MemoryGameList = () => {
	const [characterEdit, setCharacterEdit] = useState<CharacterInterface>();

	const [openLibrary, setOpenLibrary] = useState(false);
	const [character, setCharacter] = useState<CharacterInterface>();

	const [contentEdit, setContentEdit] =
		useState<MemoryGameContentInterface[]>();
	const { data, isLoading } = useCharacter();

	const { user } = useUser();

	const { data: gamesConfig, refetch: refetchGamesConfig } = useGamesConfig(
		GamesEnum.MEMORY_GAME
	);

	const { getContent, saveContent, deleteContent } = memoryGameContentService;

	const toggleOpenLibrary = () => setOpenLibrary(!openLibrary);

	const refetch = (item?: CharacterInterface) => {
		if (character || item) {
			getContent((character || item)!.slug).then((content) =>
				setContentEdit(content)
			);
		}
	};

	const openEdit = (item: CharacterInterface) => {
		setCharacter(item);
		refetch(item);
	};

	const onSelectContent = async (url: string) => {
		if (character) {
			await saveContent({
				url,
				slug: character.slug,
				idCharacter: character.id,
			});

			refetch();
		}
	};

	const onDeleteContent = async (item: MemoryGameContentInterface) => {
		await deleteContent(item.id);
		refetch();
	};

	const openEditImageCover = (item: CharacterInterface) => {
		setCharacterEdit(item);
	};

	const onCloseImageCover = () => {
		setCharacterEdit(undefined);
		refetchGamesConfig();
	};

	const imageCoverUrl = (characterSlug: string) => {
		const config = gamesConfig?.find(
			(item: ConfigGamesInterface) => item.characterSlug === characterSlug
		);
		return config?.imageCoverUrl;
	};

	const onSelecImageCover = async (url: string) => {
		if (characterEdit) {
			await configGamesService.save({
				gameSlug: GamesEnum.MEMORY_GAME,
				characterSlug: characterEdit.slug,
				imageCoverUrl: url,
			});

			onCloseImageCover();
		}
	};

	return (
		<Spin spinning={isLoading}>
			<Typography.Title level={1} className='mb-10 mt-4'>
				Jogo da Memória
			</Typography.Title>

			<Table
				rowKey='id'
				pagination={false}
				columns={[
					{
						title: 'Imagem',
						width: 100,
						render: (item) => (
							<Image
								src={imageCoverUrl(item.slug) || item.imageUrl}
								alt={item.name}
								width={100}
								height={100}
								onClick={() => openEditImageCover(item)}
								className='border border-slate-200'
							/>
						),
					},
					{
						title: 'Nome',
						dataIndex: 'name',
					},
					{
						width: 100,
						render: (item) => (
							<Button type='primary' onClick={() => openEdit(item)}>
								Editar Conteúdo
							</Button>
						),
					},
				]}
				dataSource={data}
			/>

			<Modal
				open={!!character}
				title={`Editar conteúdo de ${character?.name}`}
				onCancel={() => setCharacter(undefined)}
				footer={null}
				destroyOnHidden
			>
				<Button type='primary' onClick={toggleOpenLibrary}>
					Selecionar Imagens
				</Button>

				<div className='grid grid-cols-2 md:grid-cols-4 gap-2 mt-5'>
					{contentEdit?.map((item) => (
						<div
							key={item.id}
							className='border border-slate-200 relative rounded overflow-hidden'
						>
							<button
								className='absolute top-0 right-0 text-xl cursor-pointer'
								onClick={() => onDeleteContent(item)}
							>
								<RiCloseLine />
							</button>
							<Image src={item.url} alt={item.id} width={150} height={150} />
						</div>
					))}
				</div>
			</Modal>

			<Drawer
				size='large'
				open={!!characterEdit}
				placement='bottom'
				title={`Selecione uma imagem para ${characterEdit?.name}`}
				onClose={onCloseImageCover}
				destroyOnHidden
			>
				<ImageLibrary
					user={user!}
					folder={`games/${characterEdit?.slug}`}
					onSelect={onSelecImageCover}
				/>
			</Drawer>

			<Drawer
				open={openLibrary}
				title={`Imagens de ${character?.name}`}
				size='large'
				placement='bottom'
				onClose={toggleOpenLibrary}
				destroyOnHidden
			>
				<ImageLibrary
					user={user!}
					folder={`games/${character?.slug}`}
					onSelect={onSelectContent}
					limitPage={16}
					itemsSelected={contentEdit?.map((item) => item.url)}
				/>
			</Drawer>
		</Spin>
	);
};
