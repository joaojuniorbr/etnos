'use client';

import { MidiaInterface, useMidia, UserProfileInterface } from '@etnos/tools';
import { ImageMultiUpload } from '@etnos/ui';
import { RiDeleteBinLine, RiImageLine } from 'react-icons/ri';
import { Image, Button, Spin, Drawer, Typography, Popconfirm } from 'antd';
import { useState } from 'react';

interface ImageLibraryProps {
	folder?: string;
	user?: UserProfileInterface;
	limitPage?: number;
	onSelect?: (url: string) => void;
}

export const ImageLibrary = ({
	folder,
	user,
	limitPage = 8,
	onSelect,
}: ImageLibraryProps) => {
	const [openUpload, setOpenUpload] = useState<boolean>();

	const {
		data: library,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isRefetching,
		refetch,
		fetchNextPage,
		deleteMidia,
	} = useMidia(user?.uid, limitPage);

	const handleDeleteMidia = (item: MidiaInterface) => {
		deleteMidia(item).finally(refetch);
	};

	const toggleUpload = () => {
		setOpenUpload(!openUpload);
	};

	const isOnSelect = !!onSelect;

	if (!user) {
		return null;
	}

	const onUpload = () => {
		refetch();
	};

	return (
		<Spin spinning={isLoading || isRefetching || isFetchingNextPage}>
			<Typography.Title level={1} className='mb-10 mt-4'>
				Biblioteca de Mídia
			</Typography.Title>

			<div className='bg-white p-6 shadow-md rounded border border-slate-200'>
				<div className='mb-4'>
					<Button onClick={toggleUpload} type='primary' icon={<RiImageLine />}>
						Inserir Imagens
					</Button>
				</div>

				<section className='grid grid-cols-2 gap-4 md:grid-cols-6 lg:grid-cols-8'>
					{library?.pages.flatMap((page) =>
						page.data.map((item) => (
							<div key={item.id} className='relative'>
								<Image
									src={item.url}
									className='aspect-square object-cover object-center rounded block cursor-pointer border border-slate-200'
									preview={!isOnSelect}
									onClick={() => onSelect?.(item.url)}
								/>
								{!isOnSelect && (
									<span className='absolute top-0 right-0'>
										<Popconfirm
											title='Tem certeza que deseja excluir esta imagem?'
											onConfirm={() =>
												handleDeleteMidia(item as MidiaInterface)
											}
										>
											<Button
												icon={<RiDeleteBinLine />}
												type='text'
												danger
												size='small'
											/>
										</Popconfirm>
									</span>
								)}
							</div>
						))
					)}
				</section>

				{hasNextPage && (
					<div className='flex justify-center pt-4'>
						<Button
							onClick={() => fetchNextPage()}
							loading={isFetchingNextPage}
							disabled={isFetchingNextPage}
							className='uppercase'
						>
							{isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
						</Button>
					</div>
				)}
			</div>

			<Drawer
				title='Adicionar Imagens'
				open={openUpload}
				onClose={toggleUpload}
				placement='bottom'
				height='90%'
				destroyOnHidden
			>
				<div className='relative'>
					<ImageMultiUpload
						userId={user.uid}
						onUpload={onUpload}
						folder={folder || 'library'}
					/>
				</div>
			</Drawer>
		</Spin>
	);
};
