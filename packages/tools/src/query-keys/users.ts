export const userKeys = {
	admin: (
		schoolId: string,
		onlyPushEnabled: boolean,
		search = 'all',
	) => ['users', 'admin', schoolId, onlyPushEnabled, search] as const,
	searchWithPush: (search: string) => ['users', 'search', search, 'push'] as const,
};
