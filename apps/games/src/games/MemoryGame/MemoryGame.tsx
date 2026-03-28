'use client';

import {
	useCharacter,
	useGames,
	useGamesConfig,
	useGameScore,
	useMemoryGameContent,
} from '@etnos/tools';
import { ConfigGamesInterface, GamesEnum } from '@etnos/types';
import { useUser } from '@etnos/ui';
import { useEffect, useState } from 'react';
import { MemoryGameExperience } from './MemoryGameExperience';

const GAME_SLUG = GamesEnum.MEMORY_GAME;

export const MemoryGame = ({ characterSlug }: { characterSlug?: string }) => {
	const [isLoading, setIsLoading] = useState(false);

	const { selectedCharacter } = useCharacter({ fetchList: false });
	const { user } = useUser();
	const { saveGameScore, saveGameScoreHistory, playSound } = useGames(user?.uid);

	const {
		data: scoreGame,
		refetch: scoreGameRefetch,
		isLoading: scoreIsLoading,
	} = useGameScore(
		user?.uid ?? '',
		GamesEnum.MEMORY_GAME,
		characterSlug ?? selectedCharacter?.slug ?? ''
	);

	const { data: cardsData } = useMemoryGameContent(
		characterSlug ?? selectedCharacter?.slug ?? ''
	);

	const { data: gamesConfig } = useGamesConfig(GamesEnum.MEMORY_GAME);

	useEffect(() => {
		scoreGameRefetch();
	}, [selectedCharacter, scoreGameRefetch]);

	const handleSaveScore = async (score: number) => {
		const activeCharacterSlug = characterSlug ?? selectedCharacter?.slug;
		const currentBestScore = scoreGame?.score ?? 0;

		if (!user?.uid || !activeCharacterSlug || score <= currentBestScore) {
			return;
		}

		setIsLoading(true);

		try {
			await saveGameScore(GamesEnum.MEMORY_GAME, activeCharacterSlug, score);
			await scoreGameRefetch();
		} finally {
			setIsLoading(false);
		}
	};

	const handleSaveScoreHistory = async (score: number) => {
		const activeCharacterSlug = characterSlug ?? selectedCharacter?.slug;

		if (!user?.uid || !activeCharacterSlug) {
			return;
		}

		await saveGameScoreHistory(
			GamesEnum.MEMORY_GAME,
			activeCharacterSlug,
			score
		);
	};

	const imageCover = () => {
		if (gamesConfig && selectedCharacter) {
			return gamesConfig.find(
				(game: ConfigGamesInterface) =>
					game.characterSlug === selectedCharacter.slug
			)?.imageCoverUrl;
		}

		return `/games/${GAME_SLUG}/cover/${selectedCharacter?.slug}.jpg`;
	};

	return (
		<MemoryGameExperience
			content={cardsData ?? []}
			bestScore={scoreGame?.score ?? 0}
			coverImage={imageCover()}
			isLoading={isLoading || scoreIsLoading}
			onPlaySound={playSound}
			onSaveScoreHistory={handleSaveScoreHistory}
			onSaveScore={handleSaveScore}
			selectedCharacter={selectedCharacter}
		/>
	);
};
