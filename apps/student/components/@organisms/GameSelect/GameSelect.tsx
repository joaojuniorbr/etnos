'use client';

import { useEffect } from 'react';
import { Empty, Spin } from 'antd';
import { trackGameSelected } from '@etnos/analytics/web';
import { useCharacter, useGames, useMyGameAccess } from '@etnos/tools';
import { CardGame } from '@/components/@molecules';

export const GameSelect = () => {
	const { selectedCharacter, selectCharacter } = useCharacter({
		fetchList: false,
	});
	const { data: gameAccess, isLoading } = useMyGameAccess();

	const { allGames } = useGames();
	const enabledGames = allGames.filter((game) =>
		gameAccess?.enabledGameSlugs?.includes(game.slug),
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

	if (isLoading) {
		return <Spin />;
	}

	if (!selectedCharacter) {
		return null;
	}

	if (!enabledGames.length) {
		return (
			<Empty description="Sua escola ainda não possui jogos habilitados." />
		);
	}

	return (
		<div className="flex flex-col md:flex-row justify-center gap-4">
			{enabledGames.map((game, index) => (
				<CardGame
					key={game.slug}
					game={{
						...game,
						url: game.url + `?personagem=${selectedCharacter.slug}`,
					}}
					character={selectedCharacter.slug}
					isAboveTheFold={index === 0}
					onSelect={() =>
						trackGameSelected({
							game_slug: game.slug,
							character_slug: selectedCharacter.slug,
							game_name: game.name,
						})
					}
				/>
			))}
		</div>
	);
};
