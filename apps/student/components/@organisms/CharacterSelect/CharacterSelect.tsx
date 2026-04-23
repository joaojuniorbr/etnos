'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Spin } from 'antd';

import { CharacterCard } from '@etnos/ui';
import { schoolService, useCharacter } from '@etnos/tools';
import type { CharacterInterface } from '@etnos/types';
import { useRouter } from 'next/navigation';

export const CharacterSelect = () => {
	const router = useRouter();

	const { data, selectCharacter, selectedCharacter, isLoading } =
		useCharacter();
	const { data: gameAccess, isLoading: isLoadingGameAccess } = useQuery({
		queryKey: ['schools', 'me', 'game-access'],
		queryFn: () => schoolService.getMyGameAccess(),
	});

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

	return (
		<Spin spinning={isLoading || isLoadingGameAccess}>
			<div className="flex flex-col gap-10">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{enabledCharacters?.map((character: CharacterInterface) => (
						<CharacterCard
							key={character.slug}
							character={character}
							selected={selectedCharacter?.slug === character.slug}
							onClick={() => selectCharacter(character.slug)}
						/>
					))}
				</div>

				<Button
					type="primary"
					size="large"
					disabled={
						!selectedCharacter ||
						!enabledCharacters?.some(
							(character) => character.slug === selectedCharacter.slug,
						)
					}
					onClick={() => router.push('/estudante/jogos')}
				>
					Iniciar a Jornada
				</Button>
			</div>
		</Spin>
	);
};
