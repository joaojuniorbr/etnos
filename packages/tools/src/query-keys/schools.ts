export const schoolKeys = {
	all: () => ['schools', 'all'] as const,
	public: () => ['schools', 'public'] as const,
	myGameAccess: () => ['schools', 'me', 'game-access'] as const,
	managed: () => ['schools', 'me', 'managed'] as const,
	gameAccess: (schoolId: string) => ['schools', 'game-access', schoolId] as const,
	viewerUsers: (schoolId: string, search = '') =>
		['schools', 'viewer', 'users', schoolId, search] as const,
	userGameHistory: (schoolId: string, userId = '') =>
		['schools', schoolId, 'user-game-score-history', userId] as const,
	accessUsers: (schoolId: string) =>
		['schools', 'admin', 'access-users', schoolId] as const,
	ranking: (gameSlug = 'all') => ['schools', 'ranking', gameSlug] as const,
	usersRanking: (
		schoolId: string,
		gameSlug = 'all',
		characterSlug = 'all',
	) => ['schools', 'users-ranking', schoolId, gameSlug, characterSlug] as const,
};
