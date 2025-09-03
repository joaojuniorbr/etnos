const images = [
	{
		name: 'zeca',
		url: '/images/sign/zeca.png',
	},
	{
		name: 'iara',
		url: '/images/sign/iara.png',
	},
	{
		name: 'tonico',
		url: '/images/sign/tonico.png',
	},
	{
		name: 'dandara',
		url: '/images/sign/dandara.png',
	},
	{
		name: 'anita',
		url: '/images/sign/anita.png',
	},
];

const RANDOM_IMAGE = Math.floor(Math.random() * images.length);

export const signImage = images[RANDOM_IMAGE];
