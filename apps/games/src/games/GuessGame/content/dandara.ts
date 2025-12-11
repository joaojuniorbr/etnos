import { GuessGameCreateItem } from '../GuessGameHelper';

const dandaraData = {
	acai: [
		[
			'Açaí',
			['Sou roxo.', 'Sou geladinho.', 'Sou muito popular no verão.'],
			'O açaí é uma fruta roxa servida gelada. Ele é muito querido no Rio de Janeiro, principalmente nos dias quentes.',
		],
		[
			'Tigela',
			['Guardo comida.', 'Sou redonda.', 'Seguro o açaí.'],
			'A tigela é o potinho onde o açaí é servido, junto com frutas ou granola.',
		],
	],

	'arcor-da-lapa': [
		[
			'Arco',
			['Sou muito grande.', 'Sou branco.', 'Sou famoso no Rio.'],
			'O Arco é parte dos Arcos da Lapa, um monumento histórico muito conhecido no Rio de Janeiro.',
		],
		[
			'Lapa',
			['Sou um bairro.', 'Tenho muitos shows.', 'Sou cheio de alegria.'],
			'A Lapa é um bairro famoso por música, história e diversão no Rio de Janeiro.',
		],
	],

	'baile-funk': [
		[
			'Baile',
			['Sou uma festa.', 'Tenho música alta.', 'Sou muito animado.'],
			'O baile é uma festa onde as pessoas dançam e se divertem, muito comum nas comunidades do Rio.',
		],
		[
			'Funk',
			['Sou um ritmo.', 'Sou dançante.', 'Nasci nas favelas.'],
			'O funk é um ritmo musical cheio de energia, criado nas comunidades cariocas.',
		],
	],

	'beija-flor': [
		[
			'Beija-flor',
			['Sou pequeno.', 'Bato as asas rápido.', 'Gosto de flores.'],
			'O beija-flor é um pássaro pequeno que bate as asas muito rápido e adora o néctar das flores.',
		],
		[
			'Flor',
			['Sou colorida.', 'Tenho pétalas.', 'Atraio beija-flores.'],
			'A flor é a parte colorida das plantas e serve para atrair animais que ajudam na natureza.',
		],
	],

	bondinho: [
		[
			'Bondinho',
			['Sou um transporte.', 'Ando pelo ar.', 'Levo turistas.'],
			'O bondinho é um teleférico que leva pessoas até o alto do Pão de Açúcar, sendo um passeio famoso no Rio.',
		],
		[
			'Cabine',
			['Sou fechada.', 'Levo passageiros.', 'Fico pendurada no cabo.'],
			'A cabine é a parte onde as pessoas ficam durante o passeio de bondinho.',
		],
	],

	'cristo-redentor': [
		[
			'Cristo',
			['Sou gigante.', 'Fico no alto do morro.', 'Sou símbolo do Rio.'],
			'O Cristo é uma enorme estátua de braços abertos que fica no topo do Corcovado.',
		],
		[
			'Morro',
			['Sou bem alto.', 'Tenho vista bonita.', 'Carrego o Cristo.'],
			'O morro é uma montanha alta onde o Cristo Redentor foi construído.',
		],
	],

	'jardim-botanico': [
		[
			'Jardim',
			['Tenho muitas plantas.', 'Sou verde.', 'Sou tranquilo.'],
			'O jardim é um espaço cheio de plantas e flores, ótimo para passeios e descobertas.',
		],
		[
			'Palmeira',
			['Sou alta.', 'Tenho folhas grandes.', 'Sou famosa no Jardim Botânico.'],
			'A palmeira é uma árvore alta muito comum no Rio, especialmente no Jardim Botânico.',
		],
	],

	'museu-do-amanha': [
		[
			'Museu',
			['Guardo conhecimento.', 'Tenho exposições.', 'Sou muito moderno.'],
			'O museu é um espaço cheio de descobertas e curiosidades para aprender.',
		],
		[
			'Amanhã',
			['Sou o futuro.', 'Sou tema do museu.', 'Faço pensar na vida.'],
			'O Museu do Amanhã fala sobre o futuro do planeta e como podemos cuidar dele.',
		],
	],

	pagode: [
		[
			'Pagode',
			['Sou um ritmo.', 'Tenho muita alegria.', 'Sou primo do samba.'],
			'O pagode é um estilo musical alegre, cheio de instrumentos e muito cantado no Rio.',
		],
		[
			'Pandeiro',
			[
				'Sou um instrumento.',
				'Sou tocado com a mão.',
				'Sou muito usado no pagode.',
			],
			'O pandeiro é um instrumento de percussão que marca o ritmo no pagode e no samba.',
		],
	],

	'pao-de-acucar': [
		[
			'Açúcar',
			['Sou doce.', 'Meu nome lembra uma montanha.', 'Estou no Pão de Açúcar.'],
			'O nome Pão de Açúcar vem do formato da montanha, que parece um bloco antigo de açúcar.',
		],
		[
			'Pão',
			[
				'Meu nome está na montanha.',
				'Sou comum no café.',
				'Não sou comida aqui!',
			],
			'O nome da montanha lembra um pão, mas neste caso é só uma comparação com o formato.',
		],
	],

	praia: [
		[
			'Praia',
			['Tenho areia.', 'Tenho mar.', 'Sou muito divertida.'],
			'A praia é um lugar com areia e mar, perfeito para brincar, nadar e tomar sol.',
		],
		[
			'Areia',
			['Sou macia.', 'Sou clarinha.', 'Fico na praia.'],
			'A areia é o tapete natural da praia, usada para brincar, correr e construir castelos.',
		],
	],

	samba: [
		[
			'Samba',
			['Sou um ritmo famoso.', 'Tenho muito gingado.', 'Sou do Rio.'],
			'O samba é um ritmo cheio de alegria e movimento, símbolo da cultura carioca.',
		],
		[
			'Tambor',
			['Sou um instrumento.', 'Faço tum-tum.', 'Marco o ritmo do samba.'],
			'O tambor é um instrumento de percussão muito usado nas rodas de samba para marcar o ritmo.',
		],
	],
};

export const dandaraRawContent = Object.fromEntries(
	Object.entries(dandaraData).map(([key, items]) => [
		key,
		items.map(([word, tips, about]) =>
			GuessGameCreateItem(word as string, tips as string[], about as string)
		),
	])
);
