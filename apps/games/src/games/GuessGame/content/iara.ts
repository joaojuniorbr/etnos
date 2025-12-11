import { GuessGameCreateItem } from '../GuessGameHelper';

const iaraData = {
	acai: [
		[
			'Açaí',
			['Sou roxo.', 'Sou gostoso gelado.', 'Venho da Amazônia.'],
			'O açaí é uma frutinha roxa da Amazônia, muito nutritiva e ótima para comer geladinha.',
		],
		[
			'Fruta',
			['Sou saudável.', 'Nasço no pé.', 'Viro açaí.'],
			'A fruta é um alimento natural que nasce das plantas e é cheia de vitaminas.',
		],
	],

	aldeia: [
		[
			'Aldeia',
			[
				'Sou um lugar de moradia.',
				'Fico na floresta.',
				'Sou cheia de cultura indígena.',
			],
			'A aldeia é onde vivem os povos indígenas, com suas casas, tradições e modos de vida.',
		],
		[
			'Oca',
			['Sou uma casa.', 'Sou feita de madeira e palha.', 'Fico na aldeia.'],
			'A oca é uma casa tradicional indígena feita com materiais da floresta.',
		],
	],

	boto: [
		[
			'Boto',
			['Sou rosa.', 'Vivo nos rios.', 'Sou famoso em lendas.'],
			'O boto é um mamífero rosa dos rios amazônicos e aparece em muitas histórias da região.',
		],
		[
			'Rio',
			[
				'Sou cheio de água.',
				'O boto vive em mim.',
				'Sou muito grande na Amazônia.',
			],
			'O rio é um grande caminho de água que corre pela Amazônia e abriga muitos animais.',
		],
	],

	curipira: [
		[
			'Curupira',
			['Tenho cabelo vermelho.', 'Protejo a floresta.', 'Tenho pés virados.'],
			'O Curupira é um guardião da floresta que protege os animais e engana quem faz mal à natureza.',
		],
		[
			'Guardião',
			['Protejo a natureza.', 'Sou muito forte.', 'Apareço em lendas.'],
			'O guardião é quem cuida da floresta e dos seres que vivem nela.',
		],
	],

	guarana: [
		[
			'Guaraná',
			['Sou vermelho.', 'Tenho sementes escuras.', 'Viro bebida.'],
			'O guaraná é um fruto da Amazônia com sementes fortes, muito usado em bebidas energéticas.',
		],
		[
			'Semente',
			['Sou pequena.', 'Parece um olho.', 'Nasço no guaraná.'],
			'A semente é a parte da planta que pode virar uma nova árvore ou fruto.',
		],
	],

	jacare: [
		[
			'Jacaré',
			['Tenho dentes fortes.', 'Sou um réptil.', 'Vivo nos rios.'],
			'O jacaré é um animal da Amazônia com boca grande e dentes afiados.',
		],
		[
			'Escama',
			['Sou dura.', 'Protejo o corpo.', 'O jacaré tem várias.'],
			'A escama é a placa dura que protege o corpo de muitos répteis.',
		],
	],

	'onca-pintada': [
		[
			'Onça',
			['Sou rápida.', 'Sou pintada.', 'Sou da Amazônia.'],
			'A onça é um felino forte e ágil que vive na Amazônia e tem manchas pelo corpo.',
		],
		[
			'Mancha',
			['Sou escura.', 'Fico na pele da onça.', 'Ajudo na camuflagem.'],
			'A mancha é a marca escura na pele de alguns animais, como a onça-pintada.',
		],
	],

	'peixe-boi': [
		[
			'Peixe',
			['Vivo na água.', 'Tenho nadadeiras.', 'Sou tranquilo.'],
			'O peixe é um animal aquático que vive nos rios e lagoas da Amazônia.',
		],
		[
			'Boi',
			['Meu nome parece de fazenda.', 'Sou grandão.', 'Sou muito manso.'],
			'O peixe-boi é um animal grande e gentil que vive nos rios da Amazônia.',
		],
	],

	seringueira: [
		[
			'Seringa',
			['Sou uma árvore.', 'Dou látex.', 'Sou importante na Amazônia.'],
			'A seringueira é uma árvore da Amazônia de onde se retira o látex, usado para fazer borracha.',
		],
		[
			'Látex',
			['Sou branco.', 'Saio da árvore.', 'Viro borracha.'],
			'O látex é um líquido branco que sai da seringueira e serve para fazer borracha.',
		],
	],

	sucuri: [
		[
			'Sucuri',
			['Sou uma cobra.', 'Sou muito grande.', 'Vivo na água.'],
			'A sucuri é uma cobra enorme que vive em rios e áreas alagadas da Amazônia.',
		],
		[
			'Cobra',
			['Tenho corpo comprido.', 'Não tenho patas.', 'Posso viver na floresta.'],
			'A cobra é um réptil comprido sem patas que vive em vários lugares da floresta.',
		],
	],

	uirapuru: [
		[
			'Uirapuru',
			['Sou um pássaro.', 'Tenho canto bonito.', 'Sou raro.'],
			'O uirapuru é um pássaro amazônico famoso por seu canto muito bonito e raro.',
		],
		[
			'Canto',
			['Sou um som.', 'Vem dos pássaros.', 'Posso ser muito bonito.'],
			'O canto é o som que os pássaros fazem para se comunicar na floresta.',
		],
	],

	'vitoria-regia': [
		[
			'Vitória-régia',
			['Sou uma planta da água.', 'Sou bem grande.', 'Tenho flores bonitas.'],
			'A vitória-régia é uma planta gigante que flutua nos lagos da Amazônia e tem flores lindas.',
		],
		[
			'Folha',
			['Sou verde.', 'Flutuo na água.', 'Posso ser enorme.'],
			'A folha da vitória-régia é enorme e flutua como se fosse uma grande prancha verde.',
		],
	],
};

export const iaraRawContent = Object.fromEntries(
	Object.entries(iaraData).map(([key, items]) => [
		key,
		items.map(([word, tips, about]) =>
			GuessGameCreateItem(word as string, tips as string[], about as string)
		),
	])
);
