export const slugfy = (str: string) => {
	const slug = str
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-');

	return slug;
};
