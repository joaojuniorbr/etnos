export interface GuessGameContentInterface {
	id?: string;
	title: string;
	word: string;
	tips: string[];
	imageUrl?: string | null;
	description: string;
	characterSlug: string;
	createdAt?: unknown;
	updatedAt?: unknown;
}
