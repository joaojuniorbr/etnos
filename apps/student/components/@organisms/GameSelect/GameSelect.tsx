'use client';

import { useCharacter, useGames } from '@etnos/tools';
import { CardGame } from '../../@molecules';

export const GameSelect = () => {
	const { selectedCharacter } = useCharacter();

	const { allGames } = useGames();

	if (!selectedCharacter) {
		return null;
	}

	return (
		<div className='flex flex-col md:flex-row justify-center gap-4'>
			{allGames.map((game) => (
				<CardGame
					key={game.slug}
					game={{
						...game,
						url: game.url + `?personagem=${selectedCharacter.slug}`,
					}}
					character={selectedCharacter.slug}
				/>
			))}
		</div>
	);
};
