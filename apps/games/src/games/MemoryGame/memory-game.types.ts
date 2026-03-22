export type MemoryGameCardContent = {
	name: string;
	image: string;
};

export type MemoryGameCard = MemoryGameCardContent & {
	id: number;
	isFlipped: boolean;
	isMatched: boolean;
};

export type MemoryGameSound = 'flip' | 'success' | 'error' | 'finish';

export type MemoryGameLevel = number;

export type MemoryGameLevelConfig = {
	level: MemoryGameLevel;
	label: string;
	pairs: number;
	pointBonus: number;
	pointPenalty: number;
	pointAddition: number;
};
