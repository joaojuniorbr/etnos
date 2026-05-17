export const isSentryEnabled = (): boolean => {
	if (process.env.NODE_ENV === 'development') {
		return false;
	}

	return Boolean(process.env.SENTRY_DSN);
};
