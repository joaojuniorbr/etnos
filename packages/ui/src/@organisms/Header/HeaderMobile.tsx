'use client';

import { useEffect, useState } from 'react';
import { CharacterSelect, MobileMenu } from '@ui/@molecules';
import { useUser } from '@ui/context';
import { useAuth, useCharacter, useMyGameAccess } from '@etnos/tools';
import type { CharacterInterface } from '@etnos/types';
import { Modal, Spin } from 'antd';

export const HeaderMobile = () => {
	const [open, setOpen] = useState(false);
	const toggleDrawer = () => setOpen(!open);

	const [openCharacter, setOpenCharacter] = useState(false);

	const toggleCharacter = () => setOpenCharacter(!openCharacter);

	const { onSignOut } = useAuth();

	const { user } = useUser();

	const { selectedCharacter, data, selectCharacter } = useCharacter({
		fetchList: openCharacter,
	});
	const { data: gameAccess, isLoading: isLoadingGameAccess } =
		useMyGameAccess();
	const enabledCharacters = data?.filter((character) =>
		gameAccess?.enabledCharacterSlugs?.includes(character.slug),
	);

	useEffect(() => {
		if (
			selectedCharacter?.slug &&
			gameAccess &&
			!gameAccess.enabledCharacterSlugs.includes(selectedCharacter.slug)
		) {
			selectCharacter('');
		}
	}, [gameAccess, selectCharacter, selectedCharacter?.slug]);

	const handleCharacter = (character: CharacterInterface) => {
		selectCharacter(character.slug);
	};

	const onLogout = async () => {
		await onSignOut();
		setOpen(false);
		window.open('/login', '_self');
	};

	return (
		<>
			<MobileMenu
				toggleDrawer={toggleDrawer}
				open={open}
				user={user}
				onLogout={onLogout}
				selectedCharacter={selectedCharacter}
				toggleCharacter={toggleCharacter}
			/>

			<Modal
				title="Selecione um personagem"
				open={openCharacter}
				footer={null}
				onCancel={toggleCharacter}
			>
				<Spin spinning={isLoadingGameAccess}>
					<CharacterSelect
						characters={enabledCharacters}
						selectedCharacter={selectedCharacter}
						onSelect={handleCharacter}
					/>
				</Spin>
			</Modal>
		</>
	);
};
