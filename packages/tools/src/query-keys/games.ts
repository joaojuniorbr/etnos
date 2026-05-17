export const gameConfigKeys = {
	byGame: (gameSlug: string) => ['config-games', gameSlug] as const,
	config: (gameSlug: string, characterSlug: string) =>
		['config-games', gameSlug, characterSlug] as const,
	score: (slug: string, userId: string, characterSlug: string) =>
		['games', 'score', slug, userId, characterSlug] as const,
	memoryContent: (characterSlug: string) =>
		['game', 'memory-game', characterSlug] as const,
	guessContent: (characterSlug: string) =>
		['game', 'guess-game', characterSlug] as const,
};
