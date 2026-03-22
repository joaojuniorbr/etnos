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
