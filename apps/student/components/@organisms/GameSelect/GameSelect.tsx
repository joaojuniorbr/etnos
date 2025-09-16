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
		<div className='flex justify-center'>
			{allGames.map((game) => (
				<CardGame
					key={game.slug}
					game={game}
					character={selectedCharacter.slug}
				/>
			))}
		</div>
	);
};
