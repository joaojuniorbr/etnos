'use client';

import { useMemo, useState } from 'react';
import {
	Button,
	Drawer,
	Image,
	Input,
	Popconfirm,
	Select,
	Spin,
	Tag,
	message,
} from 'antd';
import {
	RiDeleteBinLine,
	RiFolderTransferLine,
	RiImageLine,
} from 'react-icons/ri';
import { useMidia } from '@etnos/tools';
import type { MidiaInterface, UserProfileInterface } from '@etnos/types';

import { ImageMultipleUpload } from '@ui/@molecules';
import {
	buildFolderFilterOptions,
	filterFolderMoveOption,
	folderFilterToQuery,
	formatMidiaFolderLabel,
	MIDIA_ALL_FILTER,
} from './midia-manager.utils';

interface MidiaManagerProps {
	user: UserProfileInterface;
	uploadFolder?: string;
	limitPage?: number;
	showAll?: boolean;
}

export const MidiaManager = ({
	user,
	uploadFolder = 'library',
	limitPage = 24,
	showAll = true,
}: MidiaManagerProps) => {
	const [folderFilter, setFolderFilter] = useState<string>(MIDIA_ALL_FILTER);
	const [openUpload, setOpenUpload] = useState(false);
	const [pendingFolder, setPendingFolder] = useState('');

	const listFolder = folderFilterToQuery(folderFilter);

	const {
		data: library,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isRefetching,
		folders,
		uncategorizedCount,
		isLoadingFolders,
		refetchFolders,
		refetch,
		fetchNextPage,
		deleteMidia,
		updateMidiaFolder,
		isUpdatingFolder,
	} = useMidia(user.uid, limitPage, listFolder, showAll);

	const folderFilterOptions = useMemo(
		() => buildFolderFilterOptions(folders, uncategorizedCount),
		[folders, uncategorizedCount],
	);

	const moveTargetOptions = useMemo(() => {
		const known = new Set(folders.map((item) => item.folder));
		const trimmedPending = pendingFolder.trim();

		if (trimmedPending) {
			known.add(trimmedPending);
		}

		return [
			{ value: '', label: 'Sem pasta' },
			...Array.from(known)
				.sort((a, b) => a.localeCompare(b, 'pt-BR'))
				.map((folder) => ({ value: folder, label: folder })),
		];
	}, [folders, pendingFolder]);

	const handleDeleteMidia = (item: MidiaInterface) => {
		deleteMidia(item).finally(() => {
			refetch();
			refetchFolders();
		});
	};

	const handleMoveMidia = async (
		item: MidiaInterface,
		targetFolder: string,
	) => {
		if (!item.id) {
			return;
		}

		const folder = targetFolder.trim() || null;

		try {
			await updateMidiaFolder({ id: item.id, folder });
			message.success('Imagem movida com sucesso');
			refetch();
			refetchFolders();
		} catch {
			message.error('Não foi possível mover a imagem');
		}
	};

	const onUpload = () => {
		refetch();
		refetchFolders();
	};

	return (
		<Spin
			spinning={
				isLoading ||
				isRefetching ||
				isFetchingNextPage ||
				isLoadingFolders ||
				isUpdatingFolder
			}
		>
			<div className="ui:mb-4 ui:flex ui:flex-col ui:gap-3">
				<div className="ui:flex ui:flex-col ui:gap-3 md:ui:flex-row md:ui:items-center md:ui:justify-between">
					<Button
						onClick={() => setOpenUpload(true)}
						type="primary"
						icon={<RiImageLine />}
					>
						Inserir imagens
					</Button>

					<Select
						className="ui:min-w-[240px] md:ui:w-80"
						value={folderFilter}
						onChange={setFolderFilter}
						options={folderFilterOptions}
						data-testid="midia-folder-filter"
					/>
				</div>

				<Input
					allowClear
					placeholder="Digite um nome de pasta para usar ao mover imagens"
					value={pendingFolder}
					onChange={(event) => setPendingFolder(event.target.value)}
					className="ui:max-w-xl"
				/>
			</div>

			<section className="ui:grid ui:grid-cols-2 ui:gap-4 ui:sm:grid-cols-4 ui:lg:grid-cols-6 ui:xl:grid-cols-8">
				{library?.pages.flatMap((page: { data: MidiaInterface[] }) =>
					page.data.map((item) => (
						<article
							key={item.id ?? item.url}
							className="ui:relative ui:overflow-hidden ui:rounded ui:border ui:border-slate-200 ui:bg-white"
						>
							<Image
								src={item.url}
								alt={formatMidiaFolderLabel(item.folder)}
								className="ui:aspect-square ui:block ui:w-full ui:cursor-pointer ui:object-cover ui:object-center"
							/>

							<div className="ui:space-y-2 ui:p-2">
								<Tag className="ui:max-w-full ui:truncate">
									{formatMidiaFolderLabel(item.folder)}
								</Tag>

								<Select
									size="small"
									className="ui:w-full"
									placeholder="Mover para pasta"
									options={moveTargetOptions}
									value={item.folder ?? ''}
									onChange={(value) => handleMoveMidia(item, value)}
									suffixIcon={<RiFolderTransferLine />}
									showSearch={{
										filterOption: filterFolderMoveOption,
									}}
									aria-label="Mover imagem para outra pasta"
								/>
							</div>

							<span className="ui:absolute ui:right-1 ui:top-1">
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
						</article>
					)),
				)}
			</section>

			{hasNextPage && (
				<div className="ui:flex ui:justify-center ui:pt-4">
					<Button
						onClick={() => fetchNextPage()}
						loading={isFetchingNextPage}
						disabled={isFetchingNextPage}
					>
						Carregar mais
					</Button>
				</div>
			)}

			<Drawer
				title="Adicionar imagens"
				open={openUpload}
				onClose={() => setOpenUpload(false)}
				placement="bottom"
				size="large"
				destroyOnHidden
			>
				<ImageMultipleUpload
					userId={user.uid}
					onUpload={onUpload}
					folder={uploadFolder}
				/>
			</Drawer>
		</Spin>
	);
};
