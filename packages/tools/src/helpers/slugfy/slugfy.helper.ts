export const slugfy = (str: string) => {
	const slug = str
		.normalize('NFD')
		.replaceAll(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim()
		.replaceAll(/[^a-z0-9]+/g, '-');

	return slug;
};
