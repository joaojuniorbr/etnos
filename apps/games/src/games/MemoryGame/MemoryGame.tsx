'use client';

import {
	RiArrowLeftRightFill,
	RiCheckDoubleLine,
	RiStarFill,
	RiTrophyLine,
} from 'react-icons/ri';
import { GamesEnum, useCharacter, useGames, useGameScore } from '@etnos/tools';
import { useUser } from '@etnos/ui';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Spin } from 'antd';
import { getCards } from './MemoryGameContent';
import { FinishGame, ScoreHighlight } from '../../components';

type CardData = {
	name: string;
	image: string;
};

type MemoryCard = CardData & {
	id: number;
	isFlipped: boolean;
	isMatched: boolean;
};

const shuffleArray = <T,>(array: T[]): T[] => {
	return [...array].sort(() => Math.random() - 0.5);
};

const GAME_SLUG = GamesEnum.MEMORY_GAME;

export const MemoryGame = ({ characterSlug }: { characterSlug?: string }) => {
	const [cards, setCards] = useState<MemoryCard[]>([]);
	const [flippedCards, setFlippedCards] = useState<number[]>([]);
	const [isChecking, setIsChecking] = useState(false);
	const [score, setScore] = useState(0);
	const [moves, setMoves] = useState(0);
	const [isFinished, setIsFinished] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const { selectedCharacter } = useCharacter();
	const { user } = useUser();
	const { saveGameScore } = useGames(user?.uid);

	const {
		data: scoreGame,
		refetch: scoreGameRefetch,
		isLoading: scoreIsLoading,
	} = useGameScore(
		user?.uid ?? '',
		GamesEnum.MEMORY_GAME,
		characterSlug ?? selectedCharacter?.slug ?? ''
	);

	const sounds = {
		flip: {
			source: `/games/sounds/flap.mp3`,
			ref: useRef<HTMLAudioElement | null>(null),
		},
		success: {
			source: `/games/sounds/success.mp3`,
			ref: useRef<HTMLAudioElement | null>(null),
		},
		error: {
			source: `/games/sounds/error.mp3`,
			ref: useRef<HTMLAudioElement | null>(null),
		},
		finish: {
			source: `/games/sounds/finish.mp3`,
			ref: useRef<HTMLAudioElement | null>(null),
		},
	};

	const cardsData = getCards(characterSlug);

	const totalPairs = cardsData.length;
	const matchedPairs = cards.filter((card) => card.isMatched).length / 2;

	const initializeGame = useCallback(() => {
		const duplicated = cardsData.flatMap((card, index) => [
			{ ...card, id: index * 2, isFlipped: false, isMatched: false },
			{ ...card, id: index * 2 + 1, isFlipped: false, isMatched: false },
		]);
		setCards(shuffleArray(duplicated));
		setScore(0);
		setIsFinished(false);
		setFlippedCards([]);
		setIsChecking(false);
		setMoves(0);
	}, [cardsData]);

	useEffect(() => {
		initializeGame();
	}, [initializeGame, cardsData]);

	useEffect(() => {
		scoreGameRefetch();
	}, [selectedCharacter, scoreGameRefetch]);

	const handleCardClick = (id: number) => {
		if (isChecking || isFinished) return;

		const clickedCard = cards.find((card) => card.id === id);
		if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

		if (sounds.flip.ref.current) {
			sounds.flip.ref.current.currentTime = 0;
			sounds.flip.ref.current.play();
		}

		const newCards = cards.map((card) =>
			card.id === id ? { ...card, isFlipped: true } : card
		);
		const newFlipped = [...flippedCards, id];

		setCards(newCards);
		setFlippedCards(newFlipped);

		if (newFlipped.length === 2) {
			setMoves((prev) => prev + 1);

			setIsChecking(true);
			setTimeout(() => {
				const [firstId, secondId] = newFlipped;
				const firstCard = newCards.find((card) => card.id === firstId);
				const secondCard = newCards.find((card) => card.id === secondId);

				let updatedCards = newCards;
				if (firstCard?.name === secondCard?.name) {
					updatedCards = newCards.map((card) =>
						card.id === firstId || card.id === secondId
							? { ...card, isMatched: true }
							: card
					);
					if (sounds.success.ref.current) {
						sounds.success.ref.current.currentTime = 0;
						sounds.success.ref.current.play();
					}
					setScore((prev) => prev + 100);
				} else {
					if (sounds.error.ref.current) {
						sounds.error.ref.current.currentTime = 0;
						sounds.error.ref.current.play();
					}
					updatedCards = newCards.map((card) =>
						card.id === firstId || card.id === secondId
							? { ...card, isFlipped: false }
							: card
					);
					setScore((prev) => Math.max(0, prev - 10));
				}

				setCards(updatedCards);
				setFlippedCards([]);
				setIsChecking(false);

				const allMatched = updatedCards.every((card) => card.isMatched);
				if (allMatched) {
					setIsFinished(true);
					if (sounds.finish.ref.current) {
						sounds.finish.ref.current.currentTime = 0;
						sounds.finish.ref.current.play();
					}
				}
			}, 1000);
		}
	};

	const handleRestart = () => {
		scoreGameRefetch();
		initializeGame();
	};

	const handleSaveScore = async () => {
		setIsLoading(true);

		if (!user?.uid || !selectedCharacter?.slug) return;

		await saveGameScore(GamesEnum.MEMORY_GAME, selectedCharacter.slug, score);

		setIsLoading(false);

		scoreGameRefetch();
	};

	return (
		<Spin spinning={isLoading || scoreIsLoading}>
			<h1 className='text-center text-2xl font-bold uppercase mb-8'>
				Jogo da Memória
			</h1>
			<div className='flex flex-col items-center gap-6'>
				{Object.values(sounds).map((sound) => (
					<audio
						key={sound.source}
						ref={sound.ref}
						src={sound.source}
						preload='auto'
					/>
				))}

				<div className='grid grid-cols-2 gap-2 md:grid-cols-4 sm:gap-4 w-full'>
					<ScoreHighlight
						icon={<RiTrophyLine />}
						label='Pontuação'
						score={score}
						className='border-primary text-primary  bg-white'
					/>
					<ScoreHighlight
						icon={<RiArrowLeftRightFill />}
						label='Movimentos'
						score={moves}
						className='border-indigo-800 text-indigo-800 bg-white'
					/>
					<ScoreHighlight
						icon={<RiCheckDoubleLine />}
						label='Acertos'
						score={`${matchedPairs}/${totalPairs}`}
						className='border-green-800 text-green-800 bg-white'
					/>
					<ScoreHighlight
						icon={<RiStarFill />}
						label='Recorde'
						score={scoreGame?.score || 0}
						className='bg-primary text-white'
					/>
				</div>

				{isFinished ? (
					<FinishGame
						selectedCharacter={selectedCharacter}
						isLoading={isLoading}
						isLoser={!isFinished}
						handleRestart={handleRestart}
						handleSaveScore={handleSaveScore}
					/>
				) : (
					<div className='grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 sm:gap-4 w-full'>
						{cards.map((card) => (
							<div
								key={card.id}
								onClick={() => handleCardClick(card.id)}
								className={`
              relative rounded-lg shadow-md aspect-square w-full
              cursor-pointer transform transition-transform duration-500
              ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}
              ${card.isMatched ? 'opacity-50 pointer-events-none' : ''}
            `}
								style={{ perspective: '1000px' }}
							>
								<div
									className={`absolute inset-0 rounded-lg flex items-center justify-center transform transition-transform duration-500 backface-hidden ${card.isFlipped || card.isMatched ? 'rotate-y-180' : 'rotate-y-0'}`}
								>
									<Image
										src={`/games/${GAME_SLUG}/cover/${selectedCharacter?.slug}.jpg`}
										alt={selectedCharacter?.name as string}
										width={500}
										height={500}
										className='object-cover aspect-square'
									/>
								</div>

								<div
									className={`absolute inset-0 backface-hidden rounded-lg overflow-hidden transform transition-transform duration-500 ${card.isFlipped || card.isMatched ? 'rotate-y-0' : 'rotate-y-180'}`}
								>
									<Image
										src={card.image}
										alt={card.name}
										width={500}
										height={500}
										className='object-cover aspect-square'
									/>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</Spin>
	);
};
