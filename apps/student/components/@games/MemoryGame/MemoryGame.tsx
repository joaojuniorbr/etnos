'use client';

import { useCharacter } from '@etnos/tools';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type CardData = {
	name: string;
	image: string;
};

type MemoryCard = CardData & {
	id: number;
	isFlipped: boolean;
	isMatched: boolean;
};

type MemoryGameProps = {
	cardsData: CardData[];
};

const shuffleArray = <T,>(array: T[]): T[] => {
	return [...array].sort(() => Math.random() - 0.5);
};

export const MemoryGame = ({ cardsData }: MemoryGameProps) => {
	const [cards, setCards] = useState<MemoryCard[]>([]);
	const [flippedCards, setFlippedCards] = useState<number[]>([]);
	const [isChecking, setIsChecking] = useState(false);
	const [score, setScore] = useState(0);

	const { selectedCharacter } = useCharacter();

	useEffect(() => {
		const duplicated = cardsData.flatMap((card, index) => [
			{ ...card, id: index * 2, isFlipped: false, isMatched: false },
			{ ...card, id: index * 2 + 1, isFlipped: false, isMatched: false },
		]);
		setCards(shuffleArray(duplicated));
		setScore(0);
	}, [cardsData]);

	const handleCardClick = (id: number) => {
		if (isChecking) return;

		const clickedCard = cards.find((card) => card.id === id);
		if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

		const newCards = cards.map((card) =>
			card.id === id ? { ...card, isFlipped: true } : card
		);
		const newFlipped = [...flippedCards, id];

		setCards(newCards);
		setFlippedCards(newFlipped);

		if (newFlipped.length === 2) {
			setIsChecking(true);
			setTimeout(() => {
				const [firstId, secondId] = newFlipped;
				const firstCard = newCards.find((card) => card.id === firstId);
				const secondCard = newCards.find((card) => card.id === secondId);

				if (firstCard?.name === secondCard?.name) {
					setCards((prev) =>
						prev.map((card) =>
							card.id === firstId || card.id === secondId
								? { ...card, isMatched: true }
								: card
						)
					);
					setScore((prev) => prev + 100);
				} else {
					setCards((prev) =>
						prev.map((card) =>
							card.id === firstId || card.id === secondId
								? { ...card, isFlipped: false }
								: card
						)
					);
					setScore((prev) => Math.max(0, prev - 10));
				}

				setFlippedCards([]);
				setIsChecking(false);
			}, 1000);
		}
	};

	return (
		<div className='flex flex-col items-center '>
			<p className='text-xl flex gap-2 items-center mb-6'>
				Pontuação:
				<span className='font-semibold text-white bg-primary py-2 px-4 rounded'>
					{score}
				</span>
			</p>

			<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mx-auto'>
				{cards.map((card) => (
					<div
						key={card.id}
						onClick={() => handleCardClick(card.id)}
						className={`
              relative w-40 h-40 sm:w-32 sm:h-32 rounded-lg shadow-md
              cursor-pointer transform transition-transform duration-500
              ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}
              ${card.isMatched ? 'opacity-50 pointer-events-none' : ''}
            `}
						style={{ perspective: '1000px' }}
					>
						<div
							className={`
                absolute inset-0 bg-blue-500 rounded-lg flex items-center justify-center
                transform transition-transform duration-500 backface-hidden
                ${card.isFlipped || card.isMatched ? 'rotate-y-180' : 'rotate-y-0'}
              `}
						>
							<Image
								src={`/games/memory-game/${selectedCharacter?.slug}/cover.jpg`}
								alt={selectedCharacter?.name as string}
								layout='fill'
								objectFit='cover'
							/>
						</div>

						<div
							className={`
                absolute inset-0 backface-hidden rounded-lg overflow-hidden
                transform transition-transform duration-500
                ${card.isFlipped || card.isMatched ? 'rotate-y-0' : 'rotate-y-180'}
              `}
						>
							<Image
								src={card.image}
								alt={card.name}
								layout='fill'
								objectFit='cover'
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
