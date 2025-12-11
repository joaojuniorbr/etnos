import { GuessGameCreateItem } from '../GuessGameHelper';

const tonicoData = {
	'cafe-da-tarde': [
		[
			'Lanche',
			['Como no fim da tarde.', 'Pode ter pão e bolo.', 'É bem gostoso.'],
			'O lanche da tarde é uma refeição leve com pães, frutas ou bolos.',
		],
		[
			'Mesa',
			['Fico na cozinha.', 'Seguro pratos e xícaras.', 'Uso para comer.'],
			'A mesa é onde colocamos a comida para fazer as refeições com conforto.',
		],
	],

	cafe: [
		[
			'Café',
			['Sou quentinho.', 'Sou escurinho.', 'Adultos gostam de mim.'],
			'O café é uma bebida quente muito apreciada pelos adultos, comum em Minas.',
		],
		[
			'Xícara',
			['Sou pequena.', 'Seguro café.', 'Tenho uma alça.'],
			'A xícara é usada para servir bebidas quentes, como o café.',
		],
	],

	'doce-de-leite': [
		[
			'Doce',
			[
				'Sou muito açucarado.',
				'As crianças adoram.',
				'Sou presente em festas.',
			],
			'O doce é uma comida açucarada que pode ser feita de frutas, leite ou chocolate.',
		],
		[
			'Leite',
			['Sou branco.', 'Venho da vaca.', 'Viro doce de leite.'],
			'O leite é um alimento importante e serve de base para muitos doces e receitas.',
		],
	],

	igreja: [
		[
			'Igreja',
			[
				'Sou um prédio antigo.',
				'Tenho sino.',
				'As pessoas visitam aos domingos.',
			],
			'A igreja é um lugar de encontro, oração e tradição em muitas cidades mineiras.',
		],
		[
			'Sino',
			['Faço barulho.', 'Fico no alto.', 'Sou tocado em festas.'],
			'O sino é um instrumento que toca para avisar eventos ou marcar horários.',
		],
	],

	namoradeira: [
		[
			'Boneca',
			['Fico na janela.', 'Tenho rosto pintado.', 'Sou decoração.'],
			'A boneca namoradeira é uma peça decorativa típica das janelas mineiras.',
		],
		[
			'Janela',
			[
				'Sou aberta para o ar entrar.',
				'Sou parte da casa.',
				'Posso ter uma namoradeira.',
			],
			'A janela deixa a luz entrar e em Minas pode ter bonecas decorativas.',
		],
	],

	'pao-de-queijo': [
		[
			'Pão',
			['Sou macio.', 'Sou redondinho.', 'Sou muito famoso em Minas.'],
			'O pão de queijo é um pãozinho macio feito com polvilho e queijo.',
		],
		[
			'Queijo',
			['Sou amarelinho.', 'Sou saboroso.', 'Sou usado no pão de queijo.'],
			'O queijo é um alimento feito do leite, muito tradicional em Minas Gerais.',
		],
	],

	queijo: [
		[
			'Queijo',
			['Sou feito de leite.', 'Sou salgado.', 'Sou muito famoso em Minas.'],
			'O queijo mineiro é conhecido em todo o Brasil pelo sabor marcante.',
		],
		[
			'Fatia',
			['Sou fina.', 'Sou cortada do queijo.', 'Sou fácil de comer.'],
			'A fatia é um pedaço fininho de queijo ou outro alimento.',
		],
	],

	quiabo: [
		[
			'Quiabo',
			['Sou um legume verde.', 'Sou compridinho.', 'Vou muito bem com frango.'],
			'O quiabo é um legume comum na culinária mineira, usado em pratos caseiros.',
		],
		[
			'Legume',
			['Sou saudável.', 'Venho da horta.', 'Posso ser verde.'],
			'Um legume é um alimento da horta cheio de nutrientes.',
		],
	],

	roca: [
		[
			'Roca',
			['Sou de madeira.', 'Sirvo para fiar lã.', 'Sou antigo.'],
			'A roca é um instrumento usado para fiar lã e fazer linhas.',
		],
		[
			'Lã',
			['Sou quentinha.', 'Venho da ovelha.', 'Viro roupa.'],
			'A lã é retirada da ovelha e usada para fazer roupas e fios.',
		],
	],

	'romeu-e-julieta': [
		[
			'Romeu',
			['Sou parte de um doce.', 'Meu par é Julieta.', 'Sou feito com queijo.'],
			'Romeu representa o queijo no doce tradicional mineiro Romeu e Julieta.',
		],
		[
			'Julieta',
			['Sou doce.', 'Sou feita de goiaba.', 'Combino com queijo.'],
			'Julieta representa a goiabada que combina com queijo no doce mineiro.',
		],
	],

	trem: [
		[
			'Trem',
			['Ando nos trilhos.', 'Sou comprido.', 'Carrego passageiros.'],
			'O trem é um transporte comum em Minas e atravessa belas paisagens.',
		],
		[
			'Trilho',
			['Sou de metal.', 'O trem anda sobre mim.', 'Sou comprido.'],
			'O trilho é a estrutura de metal onde o trem passa.',
		],
		[
			'Viola',
			['Sou um instrumento.', 'Tenho cordas.', 'Sou comum em Minas.'],
			'A viola é um instrumento de cordas muito usado na música caipira e mineira.',
		],
		[
			'Corda',
			['Faço som na viola.', 'Sou esticada.', 'Sou afinada.'],
			'A corda é a parte da viola que vibra e produz o som.',
		],
	],
};

export const tonicoRawContent = Object.fromEntries(
	Object.entries(tonicoData).map(([key, items]) => [
		key,
		items.map(([word, tips, about]) =>
			GuessGameCreateItem(word as string, tips as string[], about as string)
		),
	])
);
