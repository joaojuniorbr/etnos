'use client';

import { useMidia } from '@etnos/tools';
import type { MidiaInterface, UserProfileInterface } from '@etnos/types';
import { RiDeleteBinLine, RiImageLine } from 'react-icons/ri';
import { Image, Button, Spin, Drawer, Popconfirm, Select } from 'antd';
import { useState } from 'react';

import { ImageMultipleUpload } from '../../@molecules';

interface ImageLibraryProps {
	folder?: string;
	user?: UserProfileInterface;
	limitPage?: number;
	itemsSelected?: string[];
	onSelect?: (url: string) => void;
	showAll?: boolean;
}

interface MidiaFolder {
	folder: string;
	count: number;
}

export const ImageLibrary = ({
	folder,
	user,
	limitPage = 8,
	itemsSelected,
	onSelect,
	showAll = false,
}: ImageLibraryProps) => {
	const [selectFolder, setSelectFolder] = useState<string>();
	const [openUpload, setOpenUpload] = useState<boolean>();

	const {
		data: library,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isRefetching,
		folders,
		isLoadingFolders,
		refetchFolders,
		refetch,
		fetchNextPage,
		deleteMidia,
	} = useMidia(user?.uid, limitPage, selectFolder, showAll);

	const handleDeleteMidia = (item: MidiaInterface) => {
		deleteMidia(item).finally(refetch);
	};

	const toggleUpload = () => {
		setOpenUpload(!openUpload);
	};

	const onSelectFolder = (folder: string) => {
		setSelectFolder(folder);
	};

	const isOnSelect = !!onSelect;

	const onUpload = () => {
		refetch();
		refetchFolders();
	};

	const isSelected = (url: string) => itemsSelected?.includes(url);

	return (
		<Spin
			spinning={
				isLoading || isRefetching || isFetchingNextPage || isLoadingFolders
			}
		>
			<div className="ui:mb-4 ui:flex ui:justify-between">
				<Button onClick={toggleUpload} type="primary" icon={<RiImageLine />}>
					Inserir Imagens
				</Button>

				<Select
					options={folders?.map((item: MidiaFolder) => ({
						value: item.folder,
						label: `${item.folder} (${item.count})`,
					}))}
					placeholder="Selecione uma pasta"
					onChange={onSelectFolder}
					data-testid="select-folder"
				/>
			</div>

			<section className="ui:grid ui:grid-cols-8 ui:gap-4 md:ui:grid-cols-6 lg:ui:grid-cols-8">
				{library?.pages.flatMap((page: { data: MidiaInterface[] }) =>
					page.data.map((item: MidiaInterface) => (
						<div key={item.id} className="relative">
							<Image
								src={item.url}
								alt={item.url}
								className={`ui:aspect-square ui:object-cover ui:object-center ui:rounded ui:block ui:cursor-pointer ${isSelected(item.url) ? 'ui:border-4 ui:border-green-400' : 'ui: border ui:border-slate-200'}`}
								preview={!isOnSelect}
								onClick={() => onSelect?.(item.url)}
							/>
							{!isOnSelect && (
								<span className="ui:absolute ui:top-0 ui:right-0">
									<Popconfirm
										title="Tem certeza que deseja excluir esta imagem?"
										onConfirm={() => handleDeleteMidia(item)}
									>
										<Button
											icon={<RiDeleteBinLine />}
											type="text"
											danger
											size="small"
											aria-label="Excluir imagem"
										/>
									</Popconfirm>
								</span>
							)}
						</div>
					)),
				)}
			</section>

			{hasNextPage && (
				<div className="ui:flex ui:justify-center ui:pt-4">
					<Button
						onClick={() => fetchNextPage()}
						loading={isFetchingNextPage}
						disabled={isFetchingNextPage}
						className="uppercase"
					>
						Carregar mais
					</Button>
				</div>
			)}

			<Drawer
				title="Adicionar Imagens"
				open={openUpload}
				onClose={toggleUpload}
				placement="bottom"
				size="large"
				destroyOnHidden
			>
				<div className="relative">
					{user?.uid && (
						<ImageMultipleUpload
							userId={user.uid}
							onUpload={onUpload}
							folder={folder || 'library'}
						/>
					)}
				</div>
			</Drawer>
		</Spin>
	);
};
