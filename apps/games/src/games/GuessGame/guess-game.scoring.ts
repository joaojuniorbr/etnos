const TIP_PENALTY = 50;
const LETTER_HIT_POINTS = 100;
const DIRECT_WORD_MULTIPLIER = 200;
const REMAINING_LETTER_MULTIPLIER = 120;
const CHARACTER_DEFAULT = '•';

export const getGuessGameTipPenalty = () => TIP_PENALTY;

export const getGuessGameLetterHitPoints = () => LETTER_HIT_POINTS;

export const getGuessGameRevealedLettersCount = (currentGuesses: string) =>
	currentGuesses
		.split('')
		.filter((character) => character !== CHARACTER_DEFAULT).length;

export const getGuessGameWordSolvePoints = (
	wordLength: number,
	revealedLettersCount: number
) => {
	if (wordLength <= 0) {
		return 0;
	}

	if (revealedLettersCount <= 0) {
		return wordLength * DIRECT_WORD_MULTIPLIER;
	}

	const remainingLetters = Math.max(wordLength - revealedLettersCount, 0);

	return remainingLetters * REMAINING_LETTER_MULTIPLIER;
};
