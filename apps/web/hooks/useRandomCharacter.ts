import { useEffect, useState } from 'react';

const DATA_CHARACTERS = [
	{ name: 'zeca', featureImageUrl: '/images/sign/zeca.jpg' },
	{ name: 'iara', featureImageUrl: '/images/sign/iara.jpg' },
	{ name: 'tonico', featureImageUrl: '/images/sign/tonico.jpg' },
	{ name: 'dandara', featureImageUrl: '/images/sign/dandara.jpg' },
	{ name: 'anita', featureImageUrl: '/images/sign/anita.jpg' },
];

export const useRandomCharacter = () => {
	const [character, setCharacter] = useState(DATA_CHARACTERS[0]);

	useEffect(() => {
		const randomCharacter = Math.floor(Math.random() * DATA_CHARACTERS.length);
		setCharacter(DATA_CHARACTERS[randomCharacter]);
	}, []);

	return {
		character,
		setCharacter,
	};
};
