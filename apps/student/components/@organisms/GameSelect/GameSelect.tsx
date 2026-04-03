'use client';

import { useCharacter, useGames } from '@etnos/tools';
import { CardGame } from '@/components/@molecules';

export const GameSelect = () => {
	const { selectedCharacter } = useCharacter({ fetchList: false });

	const { allGames } = useGames();

	if (!selectedCharacter) {
		return null;
	}

	return (
		<div className="flex flex-col md:flex-row justify-center gap-4">
			{allGames.map((game, index) => (
				<CardGame
					key={game.slug}
					game={{
						...game,
						url: game.url + `?personagem=${selectedCharacter.slug}`,
					}}
					character={selectedCharacter.slug}
					isAboveTheFold={index === 0}
				/>
			))}
		</div>
	);
};
