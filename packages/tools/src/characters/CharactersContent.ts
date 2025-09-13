export const CharactersContent = {
	iara: {
		name: 'Iara Curumim',
		region: 'Amazônia',
		description:
			'Sou filha da floresta e guardo os saberes dos rios, das plantas e dos espíritos da mata. Vamos aprender com respeito.',
		slug: 'iara',
	},
	tonico: {
		name: 'Tonico do Fogão',
		region: 'Minas Gerais',
		description:
			'Uai, bora aprender com causos e quitutes! Eu sou Tonico, e aqui tem história boa e pão de queijo quentinho.',
		slug: 'tonico',
	},
	dandara: {
		name: 'Dandara do Morro',
		region: 'Rio de Janeiro',
		description:
			'Chega mais! No batuque do samba e na força da favela, a cultura pulsa. Vem comigo nessa roda!',
		slug: 'dandara',
	},
	zeca: {
		name: 'Zeca do Sertão',
		region: 'Nordeste',
		description:
			'Oxente! Aqui tem cordel, forró e fé. Vem comigo que a festa é boa e o saber é forte.',
		slug: 'zeca',
	},
	anita: {
		name: 'Anita dos Pampas',
		region: 'Sul do Brasil',
		description:
			'Vamos juntos pelas trilhas dos pampas, com coragem, tradição e chimarrão na mão!',
		slug: 'anita',
	},
};

export const getCharacterBySlug = (slug: string) => {
	return CharactersContent[slug as keyof typeof CharactersContent];
};

export const getAllCharacters = () => {
	return Object.values(CharactersContent);
};

export interface CharacterInterface {
	name: string;
	region: string;
	description: string;
	slug: string;
}
