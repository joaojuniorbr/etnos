export const notificationKeys = {
	templates: () => ['notifications', 'templates'] as const,
	history: () => ['notifications', 'history'] as const,
	recipientsCount: (
		targetType: string,
		schoolId = 'none',
		userId = 'none',
	) => ['notifications', 'recipients-count', targetType, schoolId, userId] as const,
};
