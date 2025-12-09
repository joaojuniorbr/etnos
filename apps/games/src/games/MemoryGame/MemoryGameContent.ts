// 💡 Mova as listas de nomes para um objeto simples
const cardNamesByCharacter = {
	iara: [
		'vitoria-regia',
		'acai',
		'curipira',
		'guarana',
		'onca-pintada',
		'peixe-boi',
		'seringueira',
		'uirapuru',
		'jacare',
		'sucuri',
		'boto',
		'aldeia',
	],
	anita: [
		'bomba',
		'bombacha',
		'cavalo',
		'chimarrao',
		'churrasco',
		'comida',
		'danca',
		'historias',
		'musica',
		'poncho',
		'prenda',
		'rodeio',
	],
	dandara: [
		'samba',
		'acai',
		'arcor-da-lapa',
		'baile-funk',
		'beija-flor',
		'bondinho',
		'cristo-redentor',
		'jardim-botanico',
		'museu-do-amanha',
		'pagode',
		'pao-de-acucar',
		'praia',
	],
	zeca: [
		'artesanato',
		'baiana',
		'boneco-de-olinda',
		'cangaco',
		'capoeira',
		'caruaru',
		'comida',
		'festa-junina',
		'olodum',
		'sertao',
		'teatro',
		'vaquejada',
	],
	tonico: [
		'cafe-da-tarde',
		'cafe',
		'doce-de-leite',
		'igreja',
		'namoradeira',
		'pao-de-queijo',
		'queijo',
		'quiabo',
		'roca',
		'romeu-e-julieta',
		'trem',
		'viola',
	],
};

type Card = {
	name: string;
	image: string;
};

const createCards = (characterSlug: string, cardNames: string[]): Card[] => {
	return cardNames.map((name) => ({
		name: name,
		image: `/games/memory-game/${characterSlug}/cards/${name}.jpg`,
	}));
};

export const cards = Object.fromEntries(
	Object.entries(cardNamesByCharacter).map(([characterSlug, cardNames]) => [
		characterSlug,
		createCards(characterSlug, cardNames),
	])
) as { [key in keyof typeof cardNamesByCharacter]: Card[] };

export const getCards = (characterSlug?: string) => {
	const slug = characterSlug as keyof typeof cards;

	if (!slug || !cards[slug]) {
		return cards.iara;
	}

	return cards[slug];
};
