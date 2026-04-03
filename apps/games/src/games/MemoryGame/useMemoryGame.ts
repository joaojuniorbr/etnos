import { useCallback, useEffect, useRef, useState } from 'react';
import type {
	MemoryGameCard,
	MemoryGameCardContent,
	MemoryGameLevelConfig,
	MemoryGameSound,
} from './memory-game.types';
import {
	createMemoryGameDeck,
	getMemoryGameLevelConfig,
	resolveMemoryGameTurn,
} from './memory-game.utils';

type UseMemoryGameProps = {
	content: MemoryGameCardContent[];
	levelConfig?: MemoryGameLevelConfig;
	matchDelayMs?: number;
	onPlaySound?: (sound: MemoryGameSound) => void;
};

const DEFAULT_MATCH_DELAY_MS = 1000;

export const useMemoryGame = ({
	content,
	levelConfig = getMemoryGameLevelConfig(1),
	matchDelayMs = DEFAULT_MATCH_DELAY_MS,
	onPlaySound,
}: UseMemoryGameProps) => {
	const [cards, setCards] = useState<MemoryGameCard[]>([]);
	const [flippedCards, setFlippedCards] = useState<number[]>([]);
	const [isChecking, setIsChecking] = useState(false);
	const [score, setScore] = useState(0);
	const [moves, setMoves] = useState(0);
	const [isFinished, setIsFinished] = useState(false);
	const [consecutiveMatches, setConsecutiveMatches] = useState(0);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const initializeGame = useCallback(() => {
		if (!content.length) {
			setCards([]);
			setScore(0);
			setMoves(0);
			setIsFinished(false);
			setFlippedCards([]);
			setIsChecking(false);
			setConsecutiveMatches(0);
			return;
		}

		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		setCards(createMemoryGameDeck(content));
		setScore(0);
		setMoves(0);
		setIsFinished(false);
		setFlippedCards([]);
		setIsChecking(false);
		setConsecutiveMatches(0);
	}, [content]);

	useEffect(() => {
		initializeGame();

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [initializeGame]);

	const handleCardClick = useCallback(
		(id: number) => {
			if (isChecking || isFinished) {
				return;
			}

			const clickedCard = cards.find((card) => card.id === id);
			if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) {
				return;
			}

			onPlaySound?.('flip');

			const nextCards = cards.map((card) =>
				card.id === id ? { ...card, isFlipped: true } : card,
			);
			const nextFlippedCards = [...flippedCards, id];

			setCards(nextCards);
			setFlippedCards(nextFlippedCards);

			if (nextFlippedCards.length !== 2) {
				return;
			}

			setMoves((previousMoves) => previousMoves + 1);
			setIsChecking(true);

			timeoutRef.current = setTimeout(() => {
				const result = resolveMemoryGameTurn(
					nextCards,
					nextFlippedCards as [number, number],
					score,
					consecutiveMatches,
					levelConfig,
				);

				setCards(result.cards);
				setScore(result.score);
				setIsFinished(result.isFinished);
				setConsecutiveMatches(result.consecutiveMatches);

				if (result.isMatch) {
					onPlaySound?.('success');

					if (result.isFinished) {
						onPlaySound?.('finish');
					}
				} else {
					onPlaySound?.('error');
				}

				setFlippedCards([]);
				setIsChecking(false);
			}, matchDelayMs);
		},
		[
			cards,
			consecutiveMatches,
			flippedCards,
			isChecking,
			isFinished,
			levelConfig,
			matchDelayMs,
			onPlaySound,
			score,
		],
	);

	const totalPairs = content.length;
	const matchedPairs = cards.filter((card) => card.isMatched).length / 2;

	return {
		cards,
		handleCardClick,
		initializeGame,
		isFinished,
		matchedPairs,
		moves,
		score,
		totalPairs,
	};
};
