import { GuessGameCreateItem } from '../GuessGameHelper';

const anitaData = {
	bomba: [
		[
			'Bomba',
			[
				'Uso para beber chimarrão.',
				'Tenho furinhos na ponta.',
				'Sou feita de metal.',
			],
			'A bomba é o canudo de metal usado para beber o chimarrão, filtrando a erva para o líquido ficar limpinho.',
		],
		[
			'Filtro',
			[
				'Fico na ponta da bomba.',
				'Tenho vários furinhos.',
				'Seguro a erva-mate.',
			],
			'O filtro fica na ponta da bomba e impede que a erva-mate suba, deixando o chimarrão gostoso de beber.',
		],
	],

	bombacha: [
		[
			'Bombacha',
			[
				'Sou uma calça larga.',
				'Sou usada por gaúchos.',
				'Sou muito confortável.',
			],
			'A bombacha é uma calça larga e confortável usada pelos gaúchos para trabalhar, montar e festejar.',
		],
		[
			'Lenço',
			['Uso no pescoço.', 'Sou colorido.', 'Faço parte do traje gaúcho.'],
			'O lenço é um acessório colorido usado no pescoço pelos gaúchos como parte do traje tradicional.',
		],
	],

	cavalo: [
		[
			'Cavalo',
			['Sou forte e rápido.', 'Ajudo no campo.', 'Sou amigo dos gaúchos.'],
			'O cavalo é muito importante no campo, ajudando os gaúchos a trabalhar, viajar e participar de rodeios.',
		],
		[
			'Sela',
			[
				'Fico no lombo do cavalo.',
				'Sou de couro.',
				'Ajudo a montar com segurança.',
			],
			'A sela é colocada no cavalo para que o cavaleiro possa montar com conforto e segurança.',
		],
	],

	chimarrao: [
		[
			'Chimarrão',
			['Sou quente.', 'Sou amargo.', 'Sou tradição gaúcha.'],
			'O chimarrão é uma bebida quente e amarga feita com erva-mate. É muito popular no Sul do Brasil.',
		],
		[
			'Cuia',
			['Sou redonda.', 'Sou feita de porongo.', 'Seguro o chimarrão.'],
			'A cuia é o recipiente feito de porongo usado para servir o chimarrão.',
		],
	],

	churrasco: [
		[
			'Churrasco',
			['Sou assado na brasa.', 'Sou especial no Sul.', 'Sou comida de festa.'],
			'O churrasco é uma carne assada na brasa, muito famosa no Sul e presente em encontros e comemorações.',
		],
		[
			'Espeto',
			['Sou de metal.', 'Seguro a carne.', 'Vou para a churrasqueira.'],
			'O espeto é uma haste de metal usada para colocar e assar carnes no churrasco.',
		],
	],

	comida: [
		[
			'Pinhão',
			[
				'Sou cozido para comer.',
				'Sou semente de araucária.',
				'Sou comum no Sul.',
			],
			'O pinhão é a semente da araucária, muito apreciada cozida e comum em festas de inverno no Sul.',
		],
		[
			'Carreteiro',
			[
				'Sou feito com arroz.',
				'Uso carne-seca.',
				'Sou tradicional dos gaúchos.',
			],
			'O carreteiro é um prato de arroz com carne-seca muito tradicional no Sul, simples e cheio de sabor.',
		],
	],

	danca: [
		[
			'Dança',
			[
				'Uso o corpo para me mover.',
				'Posso ser em par.',
				'Sou comum em festas gaúchas.',
			],
			'A dança gaúcha mistura passos marcados, alegria e tradição, sendo muito presente em festas e eventos.',
		],
		[
			'Vaneira',
			['Sou um ritmo do Sul.', 'Sou animada.', 'Gosto de pares dançando.'],
			'A vaneira é um ritmo musical gaúcho muito animado, dançado em pares e famoso em bailes.',
		],
	],

	historias: [
		[
			'Lenda',
			[
				'Sou antiga.',
				'Sou cheia de imaginação.',
				'Passo de geração em geração.',
			],
			'A lenda é uma história antiga que mistura fantasia e cultura, ensinando valores e tradições.',
		],
		[
			'Conto',
			[
				'Sou uma narrativa curta.',
				'Tenho personagens.',
				'Sou divertido de ouvir.',
			],
			'O conto é uma história curtinha, fácil de entender e muito comum em rodas de conversa.',
		],
	],

	musica: [
		[
			'Música',
			['Tenho ritmo.', 'Posso ser cantada.', 'Acompanho festas.'],
			'A música gaúcha usa instrumentos e ritmos típicos, contando histórias sobre o campo e a vida no Sul.',
		],
		[
			'Gaita',
			['Sou um instrumento.', 'Tenho botões ou teclas.', 'Sou comum no Sul.'],
			'A gaita é um instrumento muito usado na música gaúcha, produzindo sons alegres e tradicionais.',
		],
	],

	poncho: [
		[
			'Poncho',
			['Uso no frio.', 'Sou de tecido grosso.', 'Sou comum no campo.'],
			'O poncho é uma capa de tecido grosso usada para proteger do frio e da chuva no campo.',
		],
		[
			'Lã',
			['Venho das ovelhas.', 'Sou quentinha.', 'Viro roupas de inverno.'],
			'A lã é obtida das ovelhas e usada para fazer roupas quentinhas, como ponchos.',
		],
	],

	prenda: [
		[
			'Prenda',
			['Sou uma moça gaúcha.', 'Uso vestido bonito.', 'Participo de danças.'],
			'A prenda é a moça que representa a cultura gaúcha, usando vestidos tradicionais e participando de festas e danças.',
		],
		[
			'Vestido',
			['Sou longo.', 'Sou colorido.', 'Sou usado por prendas.'],
			'O vestido de prenda é colorido, longo e cheio de detalhes, sendo usado nas danças e festas gaúchas.',
		],
	],

	rodeio: [
		[
			'Rodeio',
			['Sou uma festa.', 'Tenho cavalos.', 'Sou tradição gaúcha.'],
			'O rodeio é um evento tradicional com provas de cavalo, danças e músicas típicas do Sul.',
		],
		[
			'Laço',
			['Sou feito de corda.', 'Sou usado a cavalo.', 'Sou prova de rodeio.'],
			'O laço é usado nas provas de rodeio, onde o cavaleiro tenta acertar um alvo com habilidade e rapidez.',
		],
	],
};

export const anitaRawContent = Object.fromEntries(
	Object.entries(anitaData).map(([key, items]) => [
		key,
		items.map(([word, tips, about]) =>
			GuessGameCreateItem(word as string, tips as string[], about as string)
		),
	])
);
