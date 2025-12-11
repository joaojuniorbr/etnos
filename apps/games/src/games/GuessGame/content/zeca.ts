import { GuessGameCreateItem } from '../GuessGameHelper';

const zecaData = {
	artesanato: [
		[
			'Arte',
			['Sou criativa.', 'Sou feita à mão.', 'Sou muito colorida.'],
			'A arte é feita com criatividade e pode usar materiais simples, como madeira e barro.',
		],
		[
			'Barro',
			['Sou mole.', 'Viro objetos.', 'Sou usado no artesanato.'],
			'O barro é usado por artesãos para criar potes, bonecos e esculturas.',
		],
	],

	baiana: [
		[
			'Baiana',
			['Uso vestido grande.', 'Tenho turbante.', 'Sou símbolo da Bahia.'],
			'A baiana usa roupas coloridas e é símbolo da cultura e da culinária da Bahia.',
		],
		[
			'Vestido',
			['Sou rodado.', 'Sou colorido.', 'Sou usado pela baiana.'],
			'O vestido da baiana é largo e cheio de cores, muito tradicional.',
		],
	],

	'boneco-de-olinda': [
		[
			'Boneco',
			['Sou gigante.', 'Desfilo no carnaval.', 'Sou muito colorido.'],
			'O boneco gigante é um personagem alto e divertido que aparece no carnaval de Olinda.',
		],
		[
			'Olinda',
			['Sou uma cidade.', 'Fico em Pernambuco.', 'Sou famosa pelo carnaval.'],
			'Olinda é uma cidade histórica de Pernambuco conhecida por seu carnaval e bonecos gigantes.',
		],
	],

	cangaco: [
		[
			'Cangaço',
			['Sou parte da história.', 'Uso chapéu de couro.', 'Vivo no sertão.'],
			'O cangaço foi um movimento do sertão com roupas marcantes e muita história.',
		],
		[
			'Couro',
			['Sou resistente.', 'Viro chapéu.', 'Sou usado no cangaço.'],
			'O couro é um material forte usado para fazer roupas e acessórios do sertão.',
		],
	],

	capoeira: [
		[
			'Capoeira',
			['Sou uma luta.', 'Tenho música.', 'Sou cheia de movimentos.'],
			'A capoeira mistura luta, dança e música, criada por povos africanos no Brasil.',
		],
		[
			'Roda',
			[
				'Sou em círculo.',
				'A capoeira acontece em mim.',
				'Tenho música e palmas.',
			],
			'A roda é o círculo onde os capoeiristas se apresentam ao som de instrumentos.',
		],
	],

	caruaru: [
		[
			'Feira',
			['Sou movimentada.', 'Vendo muitas coisas.', 'Sou famosa em Caruaru.'],
			'A feira de Caruaru é uma das mais tradicionais do Nordeste, cheia de cores e sabores.',
		],
		[
			'Caruaru',
			['Sou uma cidade.', 'Fico em Pernambuco.', 'Sou famosa por festas.'],
			'Caruaru é uma cidade histórica de Pernambuco conhecida pelo forró, festas juninas e artesanato.',
		],
	],

	comida: [
		[
			'Prato',
			['Seguro comida.', 'Fico na mesa.', 'Sou redondo.'],
			'O prato é onde a comida é servida, podendo ter sabores típicos do Nordeste.',
		],
		[
			'Sabor',
			[
				'Sou gostoso.',
				'Mudo conforme o prato.',
				'Sou importante na culinária.',
			],
			'O sabor é o gosto dos alimentos, que pode ser doce, salgado ou apimentado.',
		],
	],

	'festa-junina': [
		[
			'Fogueira',
			['Sou de madeira.', 'Sou acesa na festa.', 'Sou bem quentinha.'],
			'A fogueira é acesa nas festas juninas para iluminar e animar a celebração.',
		],
		[
			'Bandeira',
			['Sou colorida.', 'Sou triangular.', 'Decoro festas.'],
			'As bandeirinhas são usadas para enfeitar as festas juninas com muitas cores.',
		],
	],

	olodum: [
		[
			'Olodum',
			['Sou um grupo musical.', 'Uso tambores.', 'Sou da Bahia.'],
			'O Olodum é um grupo musical baiano que usa tambores e ritmos africanos.',
		],
		[
			'Tambor',
			['Sou tocado com a mão.', 'Faço tum-tum.', 'Sou muito usado no Olodum.'],
			'O tambor é um instrumento de percussão que marca o ritmo das músicas baianas.',
		],
	],

	sertao: [
		[
			'Sertão',
			['Sou quente.', 'Sou do Nordeste.', 'Tenho paisagens secas.'],
			'O sertão é uma região quente e seca do Nordeste, cheia de cultura e histórias.',
		],
		[
			'Mandacaru',
			['Sou um cacto.', 'Tenho espinhos.', 'Vivo no sertão.'],
			'O mandacaru é um cacto alto que cresce no sertão e resiste ao calor.',
		],
	],

	teatro: [
		[
			'Teatro',
			['Tenho atores.', 'Conto histórias.', 'Sou apresentado no palco.'],
			'O teatro é onde artistas interpretam histórias para o público.',
		],
		[
			'Palco',
			['Fico na frente.', 'Atores sobem em mim.', 'Mostro a apresentação.'],
			'O palco é o espaço onde acontecem as apresentações do teatro.',
		],
	],

	vaquejada: [
		[
			'Vaquejada',
			['Sou um esporte.', 'Tenho cavalos.', 'Sou do Nordeste.'],
			'A vaquejada é uma tradição nordestina com cavalos e habilidade dos vaqueiros.',
		],
		[
			'Vaqueiro',
			['Ando a cavalo.', 'Uso chapéu.', 'Sou do sertão.'],
			'O vaqueiro é quem cuida do gado e participa das vaquejadas.',
		],
	],
};

export const zecaRawContent = Object.fromEntries(
	Object.entries(zecaData).map(([key, items]) => [
		key,
		items.map(([word, tips, about]) =>
			GuessGameCreateItem(word as string, tips as string[], about as string)
		),
	])
);
