export interface GuessGamePlayItemInterface {
	id: string;
	title: string;
	tips: string[];
	imageUrl?: string | null;
	characterSlug: string;
	wordLength: number;
}

export interface GuessGameValidationPayloadInterface {
	contentId: string;
	guess: string;
	type: 'letter' | 'word';
	currentGuesses?: string;
}

export interface GuessGameValidationResultInterface {
	isCorrect: boolean;
	isSolved: boolean;
	matchedIndexes: number[];
	revealedCharacters: string[];
	word?: string;
	description?: string;
}
