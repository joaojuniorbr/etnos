export const getRandomIndex = (max: number = 1): number => {
	const array = new Uint32Array(1);
	crypto.getRandomValues(array);
	return Math.floor((array[0]! / (0xffffffff + 1)) * max);
};
