export const getEmailDomain = (email: string) => {
	const normalized = email.trim().toLowerCase();
	const atIndex = normalized.lastIndexOf('@');

	if (atIndex === -1) {
		return undefined;
	}

	return normalized.slice(atIndex + 1) || undefined;
};
