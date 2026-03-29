'use client';

import { useMutation } from '@tanstack/react-query';
import {
	guessGameContentService,
	useCharacter,
	useGames,
	useGameScore,
	useGuessGamePlayableContent,
} from '@etnos/tools';
import { GamesEnum } from '@etnos/types';
import { useUser } from '@etnos/ui';
import { useState } from 'react';
import { GuessGameExperience } from './GuessGameExperience';

export const GuessGame = ({ characterSlug }: { characterSlug?: string }) => {
	const { selectedCharacter } = useCharacter({ fetchList: false });
	const { user } = useUser();
	const { saveGameScore, saveGameScoreHistory, playSound } = useGames(user?.uid);
	const [round, setRound] = useState(0);

	const activeCharacterSlug = characterSlug ?? selectedCharacter?.slug ?? '';

	const { data: content, isLoading: guessGameContentIsLoading } =
		useGuessGamePlayableContent(activeCharacterSlug, round);

	const {
		data: scoreGame,
		refetch: scoreGameRefetch,
		isLoading: scoreIsLoading,
	} = useGameScore(user?.uid ?? '', GamesEnum.GUESS_GAME, activeCharacterSlug);

	const validateGuessMutation = useMutation({
		mutationFn: guessGameContentService.validateAttempt,
	});

	const handleSaveScore = async (score: number) => {
		const currentBestScore = scoreGame?.score ?? 0;

		if (!user?.uid || !activeCharacterSlug || score <= currentBestScore) {
			return;
		}

		await saveGameScore(GamesEnum.GUESS_GAME, activeCharacterSlug, score);
		await scoreGameRefetch();
	};

	const handleSaveScoreHistory = async (score: number) => {
		if (!user?.uid || !activeCharacterSlug) {
			return;
		}

		await saveGameScoreHistory(GamesEnum.GUESS_GAME, activeCharacterSlug, score);
	};

	return (
		<GuessGameExperience
			content={content}
			bestScore={scoreGame?.score ?? 0}
			isLoading={scoreIsLoading || guessGameContentIsLoading}
			isValidating={validateGuessMutation.isPending}
			selectedCharacter={selectedCharacter}
			onNextRound={() => {
				setRound((prev) => prev + 1);
			}}
			onPlaySound={playSound}
			onSaveScore={handleSaveScore}
			onSaveScoreHistory={handleSaveScoreHistory}
			onValidateAttempt={(payload) => validateGuessMutation.mutateAsync(payload)}
		/>
	);
};
