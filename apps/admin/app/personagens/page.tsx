'use client';

import {
	Breadcrumb,
	Spin,
	FloatButton,
	message,
	Table,
	Image,
	Button,
	Drawer,
} from 'antd';
import { Title, useUser } from '@etnos/ui';
import { FormCharacter } from '@etnos/components';
import { useState } from 'react';

import { RiAddLine, RiEditLine } from 'react-icons/ri';
import { charactersService, useCharacter } from '@etnos/tools';
import type { CharacterInterface } from '@etnos/types';

export default function PersonagensPage() {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [openCharacter, setOpenCharacter] = useState<boolean>(false);
	const [characterData, setCharacterData] = useState<CharacterInterface>();

	const { user } = useUser();

	const { data, refetch } = useCharacter();

	const toggleCharacter = () => setOpenCharacter(!openCharacter);

	const onCloseModal = () => {
		setOpenCharacter(false);
		setCharacterData(undefined);
	};

	const onSubmitAddCharacter = (character: CharacterInterface) => {
		setIsLoading(true);
		charactersService
			.save(character)
			.then(() => {
				setOpenCharacter(false);
				message.success('Personagem adicionado com sucesso');
			})
			.catch((err) => {
				console.log(err);
				message.error('Erro ao adicionar personagem');
			})
			.finally(() => {
				setIsLoading(false);
				refetch();
			});
	};

	const onSubmitEditCharacter = (character: CharacterInterface) => {
		setIsLoading(true);
		charactersService
			.update(character)
			.catch(() => {
				message.error('Erro ao atualizar personagem');
			})
			.finally(() => {
				setIsLoading(false);
				refetch();
			});
	};

	const onSubmit = (character: CharacterInterface) => {
		if (characterData) {
			onSubmitEditCharacter({ ...characterData, ...character });
		} else {
			onSubmitAddCharacter(character);
		}
	};

	const onEditCharacter = (character: CharacterInterface) => {
		setOpenCharacter(true);
		setCharacterData(character);
	};

	if (!user) {
		return null;
	}

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
							title: 'Personagens',
						},
					]}
				/>

				<Title className='mb-4 mt-6'>Personagens</Title>

				<FloatButton
					icon={<RiAddLine className='text-2xl' />}
					onClick={toggleCharacter}
					type='primary'
				/>

				<Drawer
					open={openCharacter}
					title='Novo Personagem'
					footer={null}
					destroyOnHidden
					onClose={onCloseModal}
					size='large'
				>
					<FormCharacter
						data={characterData}
						user={user}
						onSubmit={onSubmit}
						isLoading={isLoading}
					/>
				</Drawer>

				<div className='bg-white rounded shadow'>
					<Table
						rowKey='slug'
						dataSource={data}
						pagination={false}
						columns={[
							{
								title: 'Imagem',
								render: (item) => (
									<div className='w-20 md:w-32 border border-slate-200 rounded flex overflow-hidden'>
										<Image src={item.imageUrl} />
									</div>
								),
							},
							{
								dataIndex: 'name',
								title: 'Nome',
							},
							{
								dataIndex: 'region',
								title: 'Região',
							},
							{
								dataIndex: 'description',
								title: 'Descrição',
							},
							{
								title: 'Editar',
								render: (item) => (
									<Button
										onClick={() => onEditCharacter(item)}
										icon={<RiEditLine />}
									/>
								),
							},
						]}
					/>
				</div>
			</div>
		</Spin>
	);
}
