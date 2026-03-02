'use client';

import {
	RiArrowLeftRightFill,
	RiCheckDoubleLine,
	RiStarFill,
	RiTrophyLine,
} from 'react-icons/ri';
import {
	useCharacter,
	useGames,
	useGamesConfig,
	useGameScore,
	useMemoryGameContent,
} from '@etnos/tools';
import { ConfigGamesInterface, GamesEnum } from '@etnos/types';
import { useUser } from '@etnos/ui';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { Spin } from 'antd';
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
	const shuffled = [...array];
	const randomValues = new Uint32Array(shuffled.length);
	crypto.getRandomValues(randomValues);

	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor((randomValues[i]! / (0xffffffff + 1)) * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
	}

	return shuffled;
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
	const { saveGameScore, playSound } = useGames(user?.uid);

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

	const totalPairs = cardsData?.length;
	const matchedPairs = cards.filter((card) => card.isMatched).length / 2;

	const initializeGame = useCallback(() => {
		if (cardsData) {
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
		}
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

		playSound('flip');

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

				let updatedCards;

				if (firstCard?.name === secondCard?.name) {
					updatedCards = newCards.map((card) =>
						card.id === firstId || card.id === secondId
							? { ...card, isMatched: true }
							: card
					);
					playSound('success');
					setScore((prev) => prev + 100);
				} else {
					playSound('error');

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
					playSound('finish');
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
		<Spin spinning={isLoading || scoreIsLoading}>
			<h1 className='text-center text-2xl font-bold uppercase mb-8'>
				Jogo da Memória
			</h1>
			<div className='flex flex-col items-center gap-6'>
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
							<button
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
										src={imageCover() as string}
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
							</button>
						))}
					</div>
				)}
			</div>
		</Spin>
	);
};
