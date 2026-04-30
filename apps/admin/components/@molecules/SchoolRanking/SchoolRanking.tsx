'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Spin } from 'antd';
import { schoolService, useCharacter } from '@etnos/tools';
import { GameNameEnum, GamesEnum, type UserRankingInterface } from '@etnos/types';
import { UserRanking } from '../UserRanking';

interface SchoolRankingProps {
	schoolId: string;
}

export const SchoolRanking = ({ schoolId }: SchoolRankingProps) => {
	const [selectedGame, setSelectedGame] = useState('all');
	const [selectedCharacter, setSelectedCharacter] = useState('all');

	const { data: characters = [] } = useCharacter({ fetchList: true });

	const gameOptions = [
		{ value: 'all', label: 'Todos os jogos' },
		...Object.values(GamesEnum).map((gameSlug) => ({
			value: gameSlug,
			label: GameNameEnum[gameSlug],
		})),
	];

	const characterOptions = [
		{ value: 'all', label: 'Todos os personagens' },
		...characters.map((character) => ({
			value: character.slug,
			label: character.name,
		})),
	];

	const selectedGameSlug = selectedGame === 'all' ? undefined : selectedGame;
	const selectedCharacterSlug = selectedCharacter === 'all' ? undefined : selectedCharacter;

	const { data: ranking = [], isLoading } = useQuery<UserRankingInterface[]>({
		queryKey: [
			'schools',
			'users-ranking',
			schoolId,
			selectedGameSlug ?? 'all',
			selectedCharacterSlug ?? 'all',
		],
		queryFn: () =>
			schoolService.getUsersRankingBySchool(schoolId, selectedGameSlug, selectedCharacterSlug),
		enabled: Boolean(schoolId),
	});

	return (
		<Spin spinning={isLoading}>
			<UserRanking
				ranking={ranking}
				selectedGame={selectedGame}
				onGameChange={setSelectedGame}
				gameOptions={gameOptions}
				selectedCharacter={selectedCharacter}
				onCharacterChange={setSelectedCharacter}
				characterOptions={characterOptions}
			/>
		</Spin>
	);
};
