export const normalizePhone = (value: string) => value.replaceAll(/\D/g, '');

export const formatPhoneBR = (value: string) => {
	const digits = normalizePhone(value).slice(0, 11);

	if (!digits) return '';
	if (digits.length <= 2) return `(${digits}`;

	const ddd = digits.slice(0, 2);
	const rest = digits.slice(2);

	if (digits.length <= 10) {
		if (rest.length <= 4) return `(${ddd}) ${rest}`;
		return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
	}

	return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
};
