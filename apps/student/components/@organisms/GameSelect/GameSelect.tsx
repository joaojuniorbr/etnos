'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Empty, Spin } from 'antd';
import { schoolService, useCharacter, useGames } from '@etnos/tools';
import { CardGame } from '@/components/@molecules';

export const GameSelect = () => {
	const { selectedCharacter, selectCharacter } = useCharacter({
		fetchList: false,
	});
	const { data: gameAccess, isLoading } = useQuery({
		queryKey: ['schools', 'me', 'game-access'],
		queryFn: () => schoolService.getMyGameAccess(),
	});

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
				/>
			))}
		</div>
	);
};
