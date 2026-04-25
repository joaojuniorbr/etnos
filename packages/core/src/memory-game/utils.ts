import type {
	MemoryGameCard,
	MemoryGameCardContent,
	MemoryGameLevelConfig,
} from './types.js';

const MEMORY_GAME_LEVEL_PAIR_STEP = 3;
const MEMORY_GAME_LEVEL_BONUS_STEP = 50;
const MEMORY_GAME_LEVEL_SCORE_STEP = 100;

export const shuffleArray = <T>(array: T[]): T[] => {
	const shuffled = [...array];

	if (shuffled.length <= 1) {
		return shuffled;
	}

	for (let index = shuffled.length - 1; index > 0; index -= 1) {
		const randomIndex = Math.floor(Math.random() * (index + 1));

		[shuffled[index], shuffled[randomIndex]] = [
			shuffled[randomIndex]!,
			shuffled[index]!,
		];
	}

	return shuffled;
};

export const createMemoryGameDeck = (
	content: MemoryGameCardContent[],
	shuffle: <T>(items: T[]) => T[] = shuffleArray,
): MemoryGameCard[] =>
	shuffle(
		content.flatMap((card, index) => [
			{ ...card, id: index * 2, isFlipped: false, isMatched: false },
			{ ...card, id: index * 2 + 1, isFlipped: false, isMatched: false },
		]),
	);

export const getMemoryGameLevelConfig = (
	level: number,
): MemoryGameLevelConfig => ({
	level,
	label: `Nível ${level}`,
	pairs: level * MEMORY_GAME_LEVEL_PAIR_STEP,
	pointBonus: level * MEMORY_GAME_LEVEL_BONUS_STEP,
	pointPenalty: level * MEMORY_GAME_LEVEL_BONUS_STEP,
	pointAddition: level * MEMORY_GAME_LEVEL_SCORE_STEP,
});

export const getAvailableMemoryGameLevels = (contentCount: number) =>
	Array.from(
		{ length: Math.floor(contentCount / MEMORY_GAME_LEVEL_PAIR_STEP) },
		(_, index) => getMemoryGameLevelConfig(index + 1),
	);

export const getMemoryGameLevelContent = (
	content: MemoryGameCardContent[],
	level: number,
	shuffle: <T>(items: T[]) => T[] = shuffleArray,
) => shuffle(content).slice(0, getMemoryGameLevelConfig(level).pairs);

export const resolveMemoryGameTurn = (
	cards: MemoryGameCard[],
	flippedCardIds: [number, number],
	score: number,
	consecutiveMatches: number,
	levelConfig: Pick<
		MemoryGameLevelConfig,
		'pointAddition' | 'pointBonus' | 'pointPenalty'
	>,
) => {
	const [firstId, secondId] = flippedCardIds;
	const firstCard = cards.find((card) => card.id === firstId);
	const secondCard = cards.find((card) => card.id === secondId);

	if (firstCard?.name === secondCard?.name) {
		const matchedCards = cards.map((card) =>
			card.id === firstId || card.id === secondId
				? { ...card, isMatched: true }
				: card,
		);
		const nextConsecutiveMatches = consecutiveMatches + 1;
		const pointsEarned =
			levelConfig.pointAddition + consecutiveMatches * levelConfig.pointBonus;

		return {
			cards: matchedCards,
			score: score + pointsEarned,
			isFinished: matchedCards.every((card) => card.isMatched),
			isMatch: true,
			consecutiveMatches: nextConsecutiveMatches,
		};
	}

	return {
		cards: cards.map((card) =>
			card.id === firstId || card.id === secondId
				? { ...card, isFlipped: false }
				: card,
		),
		score: score - levelConfig.pointPenalty,
		isFinished: false,
		isMatch: false,
		consecutiveMatches: 0,
	};
};
