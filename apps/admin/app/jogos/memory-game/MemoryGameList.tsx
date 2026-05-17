'use client';

import { configGamesService } from '@etnos/services';
import {
	useCharacter,
	useGamesConfig,
	useMemoryGameEditorContent,
	useMemoryGameContentMutations,
} from '@etnos/tools';
import {
	type CharacterInterface,
	type ConfigGamesInterface,
	GamesEnum,
	type MemoryGameContentInterface,
} from '@etnos/types';
import { RiCloseLine } from 'react-icons/ri';
import { ImageLibrary, Title, useUser } from '@etnos/ui';
import { Button, Drawer, Modal, Spin, Table } from 'antd';
import Image from 'next/image';
import { useState } from 'react';

export const MemoryGameList = () => {
	const [characterEdit, setCharacterEdit] = useState<CharacterInterface>();
	const [openLibrary, setOpenLibrary] = useState(false);
	const [character, setCharacter] = useState<CharacterInterface>();

	const { data: characters = [], isLoading: isLoadingCharacters } =
		useCharacter();
	const { user } = useUser();

	const { data: gamesConfig, refetch: refetchGamesConfig } = useGamesConfig(
		GamesEnum.MEMORY_GAME,
	);

	const characterSlug = character?.slug ?? '';
	const { data: content = [], isLoading: isLoadingContent } =
		useMemoryGameEditorContent(characterSlug, {
			enabled: Boolean(characterSlug),
		});

	const { saveContent, deleteContent } =
		useMemoryGameContentMutations(characterSlug);

	const toggleOpenLibrary = () => setOpenLibrary((current) => !current);

	const openEdit = (item: CharacterInterface) => {
		setCharacter(item);
	};

	const onSelectContent = (url: string) => {
		if (!character) return;
		saveContent.mutate({
			url,
			slug: character.slug,
			idCharacter: character.id,
		});
	};

	const onDeleteContent = (item: MemoryGameContentInterface) => {
		deleteContent.mutate(item.id);
	};

	const openEditImageCover = (item: CharacterInterface) => {
		setCharacterEdit(item);
	};

	const onCloseImageCover = () => {
		setCharacterEdit(undefined);
		void refetchGamesConfig();
	};

	const imageCoverUrl = (slug: string) => {
		const config = gamesConfig?.find(
			(item: ConfigGamesInterface) => item.characterSlug === slug,
		);
		return config?.imageCoverUrl;
	};

	const onSelecImageCover = async (url: string) => {
		if (!characterEdit) return;
		await configGamesService.save({
			gameSlug: GamesEnum.MEMORY_GAME,
			characterSlug: characterEdit.slug,
			imageCoverUrl: url,
		});
		onCloseImageCover();
	};

	return (
		<Spin
			spinning={
				isLoadingCharacters ||
				isLoadingContent ||
				saveContent.isPending ||
				deleteContent.isPending
			}
		>
			<Title className="mb-4 mt-6">Jogo da Memória</Title>

			<div className="border border-slate-200 border-b-0">
				<Table
					rowKey="id"
					pagination={false}
					columns={[
						{
							title: 'Imagem',
							width: 100,
							render: (item: CharacterInterface) => (
								<Image
									src={imageCoverUrl(item.slug) || item.imageUrl}
									alt={item.name}
									width={100}
									height={100}
									onClick={() => openEditImageCover(item)}
									className="border border-slate-200"
								/>
							),
						},
						{
							title: 'Nome',
							dataIndex: 'name',
						},
						{
							width: 100,
							render: (item: CharacterInterface) => (
								<Button type="primary" onClick={() => openEdit(item)}>
									Editar Conteúdo
								</Button>
							),
						},
					]}
					dataSource={characters}
				/>
			</div>

			<Modal
				open={Boolean(character)}
				title={`Editar conteúdo de ${character?.name}`}
				onCancel={() => setCharacter(undefined)}
				footer={null}
				destroyOnHidden
			>
				<Button type="primary" onClick={toggleOpenLibrary}>
					Selecionar Imagens
				</Button>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-5">
					{content.map((item) => (
						<div
							key={item.id}
							className="border border-slate-200 relative rounded overflow-hidden"
						>
							<button
								type="button"
								className="absolute top-0 right-0 text-xl cursor-pointer"
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
				size="large"
				open={Boolean(characterEdit)}
				placement="bottom"
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
				size="large"
				placement="bottom"
				onClose={toggleOpenLibrary}
				destroyOnHidden
			>
				<ImageLibrary
					user={user!}
					folder={`games/${character?.slug}`}
					onSelect={onSelectContent}
					limitPage={16}
					itemsSelected={content.map((item) => item.url)}
				/>
			</Drawer>
		</Spin>
	);
};
