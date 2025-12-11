'use client';

import { MidiaInterface, useMidia } from '@etnos/tools';
import { useUser } from '@etnos/ui';
import { RiDeleteBinLine, RiImageLine } from 'react-icons/ri';
import { Image, Button, Spin, Drawer, Typography } from 'antd';
import { MultiUploadImages } from '../../components/@Molecules';
import { useState } from 'react';

export const MidiaSelector = () => {
	const [openUpload, setOpenUpload] = useState<boolean>();

	const { user } = useUser();
	const {
		data: library,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch,
		isLoading,
		isRefetching,
		deleteMidia,
	} = useMidia(user?.uid, 8);

	const handleDeleteMidia = (item: MidiaInterface) => {
		deleteMidia(item).finally(refetch);
	};

	const toggleUpload = () => {
		setOpenUpload(!openUpload);
	};

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
									className='aspect-square object-cover object-center rounded block'
								/>
								<span className='absolute top-0 right-0'>
									<Button
										icon={<RiDeleteBinLine />}
										type='text'
										danger
										size='small'
										onClick={() => handleDeleteMidia(item as MidiaInterface)}
									/>
								</span>
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
					<MultiUploadImages
						userId={user.uid}
						onUpload={onUpload}
						folder='library'
					/>
				</div>
			</Drawer>
		</Spin>
	);
};
