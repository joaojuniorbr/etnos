import {
	anitaRawContent,
	dandaraRawContent,
	iaraRawContent,
	tonicoRawContent,
	zecaRawContent,
} from './content';
import { GuessGameContentInterface } from './GuessGameHelper';

interface WordContent {
	word: string;
	tips: string[];
	about: string;
}

type RawGuessGameContent = Record<string, Record<string, WordContent[]>>;

const rawGuessGameContent: RawGuessGameContent = {
	anita: anitaRawContent,
	dandara: dandaraRawContent,
	iara: iaraRawContent,
	tonico: tonicoRawContent,
	zeca: zecaRawContent,
};

const generateGuessContent = (
	characterSlug: string,
	rawContent: RawGuessGameContent[keyof RawGuessGameContent]
): GuessGameContentInterface[] => {
	return Object.entries(rawContent).flatMap(([imageSlug, pair]) => {
		const imagePath = `/games/memory-game/${characterSlug}/cards/${imageSlug}.jpg`;

		return pair.map((p) => ({
			word: p.word,
			image: imagePath,
			tips: p.tips,
			about: p.about,
		}));
	});
};

export const GuessGameContent: Record<string, GuessGameContentInterface[]> =
	Object.fromEntries(
		Object.entries(rawGuessGameContent).map(([characterSlug, rawItems]) => [
			characterSlug,
			generateGuessContent(characterSlug, rawItems),
		])
	);
