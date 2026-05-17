'use client';

import { useMutation } from '@tanstack/react-query';
import { guessGameContentService } from '@etnos/services';
import {
	useCharacter,
	useGames,
	useGameScore,
	useGuessGamePlayableContent,
} from '@etnos/tools';
import { GamesEnum } from '@etnos/types';
import { useUser } from '@etnos/ui';
import { useEffect, useRef, useState } from 'react';
import { GuessGameExperience } from './GuessGameExperience';

export const GuessGame = ({ characterSlug }: { characterSlug?: string }) => {
	const { selectedCharacter } = useCharacter({ fetchList: false });
	const { user } = useUser();
	const games = useGames(user?.uid);
	const {
		saveGameScore,
		saveGameScoreHistory,
		startGameSession,
		playSound,
		submitGameNps,
	} = games;
	const getGameNps = games.getGameNps ?? (() => Promise.resolve(null));
	const [round, setRound] = useState(0);
	const gameSessionIdRef = useRef<string | null>(null);
	const [hasSubmittedGameNps, setHasSubmittedGameNps] = useState(false);

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

	useEffect(() => {
		if (!user?.uid) {
			setHasSubmittedGameNps(false);
			return;
		}

		void getGameNps(GamesEnum.GUESS_GAME).then((nps) => {
			setHasSubmittedGameNps(Boolean(nps));
		});
	}, [getGameNps, user?.uid]);

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

		await saveGameScoreHistory(
			GamesEnum.GUESS_GAME,
			activeCharacterSlug,
			score,
			gameSessionIdRef.current,
		);
		gameSessionIdRef.current = null;
	};

	const handleRoundSessionStart = async () => {
		if (!user?.uid || !activeCharacterSlug) {
			return;
		}

		const row = await startGameSession(
			GamesEnum.GUESS_GAME,
			activeCharacterSlug,
		);

		if (row && typeof row === 'object' && row !== null && 'id' in row) {
			gameSessionIdRef.current = (row as { id: string }).id;
		}
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
			onRoundSessionStart={handleRoundSessionStart}
			onSessionReset={() => {
				gameSessionIdRef.current = null;
			}}
			onValidateAttempt={(payload) =>
				validateGuessMutation.mutateAsync(payload)
			}
			npsEnabled={Boolean(
				user?.uid && activeCharacterSlug && !hasSubmittedGameNps,
			)}
			npsGameSlug={GamesEnum.GUESS_GAME}
			npsCharacterSlug={activeCharacterSlug}
			onSubmitGameNps={async (...args) => {
				await submitGameNps(...args);
				setHasSubmittedGameNps(true);
			}}
		/>
	);
};
