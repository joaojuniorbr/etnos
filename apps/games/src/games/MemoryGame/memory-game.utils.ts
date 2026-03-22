import type { MemoryGameCard, MemoryGameCardContent } from './memory-game.types';

export const shuffleArray = <T,>(array: T[]): T[] => {
	const shuffled = [...array];

	if (shuffled.length <= 1) {
		return shuffled;
	}

	const randomValues = new Uint32Array(shuffled.length);
	crypto.getRandomValues(randomValues);

	for (let index = shuffled.length - 1; index > 0; index -= 1) {
		const randomIndex = Math.floor(
			(randomValues[index]! / (0xffffffff + 1)) * (index + 1)
		);
		[shuffled[index], shuffled[randomIndex]] = [
			shuffled[randomIndex]!,
			shuffled[index]!,
		];
	}

	return shuffled;
};

export const createMemoryGameDeck = (
	content: MemoryGameCardContent[],
	shuffle: <T,>(items: T[]) => T[] = shuffleArray
): MemoryGameCard[] =>
	shuffle(
		content.flatMap((card, index) => [
			{ ...card, id: index * 2, isFlipped: false, isMatched: false },
			{ ...card, id: index * 2 + 1, isFlipped: false, isMatched: false },
		])
	);

export const resolveMemoryGameTurn = (
	cards: MemoryGameCard[],
	flippedCardIds: [number, number],
	score: number
) => {
	const [firstId, secondId] = flippedCardIds;
	const firstCard = cards.find((card) => card.id === firstId);
	const secondCard = cards.find((card) => card.id === secondId);

	if (firstCard?.name === secondCard?.name) {
		const matchedCards = cards.map((card) =>
			card.id === firstId || card.id === secondId
				? { ...card, isMatched: true }
				: card
		);

		return {
			cards: matchedCards,
			score: score + 100,
			isFinished: matchedCards.every((card) => card.isMatched),
			isMatch: true,
		};
	}

	return {
		cards: cards.map((card) =>
			card.id === firstId || card.id === secondId
				? { ...card, isFlipped: false }
				: card
		),
		score: Math.max(0, score - 10),
		isFinished: false,
		isMatch: false,
	};
};
