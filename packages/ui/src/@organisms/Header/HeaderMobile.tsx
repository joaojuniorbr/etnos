'use client';

import { useState } from 'react';
import { MobileMenu } from '../../@molecules';
import { useUser } from '../../context';
import { useAuth, useCharacter } from '@etnos/tools';
import { Image, Modal } from 'antd';

export const HeaderMobile = () => {
	const [open, setOpen] = useState(false);
	const toggleDrawer = () => setOpen(!open);

	const [openCharacter, setOpenCharacter] = useState(false);

	const toggleCharacter = () => setOpenCharacter(!openCharacter);

	const { onSignOut } = useAuth();

	const { user } = useUser();

	const { selectedCharacter, characters, selectCharacter } = useCharacter();

	const handleCharacter = (slug: string) => {
		selectCharacter(slug);
	};

	return (
		<>
			<MobileMenu
				toggleDrawer={toggleDrawer}
				open={open}
				user={user}
				onLogout={onSignOut}
				selectedCharacter={selectedCharacter}
				toggleCharacter={toggleCharacter}
			/>

			<Modal
				title='Selecione um personagem'
				open={openCharacter}
				footer={null}
				onCancel={toggleCharacter}
			>
				<div className='ui:flex ui:flex-col ui:gap-2'>
					{characters.map((character) => (
						<button
							key={character.slug}
							className={`
								ui:flex ui:items-center ui:gap-2 ui:border ui:p-2 ui:rounded ui:cursor-pointer  
								${selectedCharacter?.slug === character.slug ? 'ui:border-primary' : 'ui:border-slate-200'}
							`}
							onClick={() => handleCharacter(character.slug)}
						>
							<div className='ui:w-26'>
								<Image
									src={`/images/character/md/${character.slug}.png`}
									alt={character.name}
									preview={false}
								/>
							</div>
							<div className='ui:flex ui:flex-col'>
								<div className='ui:text-sm ui:font-bold ui:text-primary ui:uppercase'>
									{character.name}
								</div>
								<div className='ui:text-xs'>{character.description}</div>
							</div>
						</button>
					))}
				</div>
			</Modal>
		</>
	);
};
