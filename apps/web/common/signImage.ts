const images = [
	{
		name: 'zeca',
		url: '/images/sign/zeca.jpg',
	},
	{
		name: 'iara',
		url: '/images/sign/iara.jpg',
	},
	{
		name: 'tonico',
		url: '/images/sign/tonico.jpg',
	},
	{
		name: 'dandara',
		url: '/images/sign/dandara.jpg',
	},
	{
		name: 'anita',
		url: '/images/sign/anita.jpg',
	},
];

const RANDOM_IMAGE = Math.floor(Math.random() * images.length);

export const signImage = images[RANDOM_IMAGE];
