export const GuessGameCreateItem = (
	word: string,
	tips: string[],
	about: string
) => ({ word, tips, about });

export interface GuessGameContentInterface {
	word: string;
	image: string;
	tips: string[];
	about: string;
}
