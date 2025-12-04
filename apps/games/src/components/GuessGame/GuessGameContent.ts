export interface GuessGameContentInterface {
	word: string;
	image: string;
	tips: string[];
	about: string;
}

export const GuessGameContent: Record<string, GuessGameContentInterface[]> = {
	anita: [
		{
			word: 'Bomba',
			image: '/games/memory-game/anita/cards/bomba.jpg',
			tips: [
				'Uso para beber chimarrão.',
				'Tenho furinhos na ponta.',
				'Sou feita de metal.',
			],
			about:
				'A bomba é o canudo de metal usado para beber o chimarrão, filtrando a erva para o líquido ficar limpinho.',
		},
		{
			word: 'Filtro',
			image: '/games/memory-game/anita/cards/bomba.jpg',
			tips: [
				'Fico na ponta da bomba.',
				'Tenho vários furinhos.',
				'Seguro a erva-mate.',
			],
			about:
				'O filtro fica na ponta da bomba e impede que a erva-mate suba, deixando o chimarrão gostoso de beber.',
		},

		{
			word: 'Bombacha',
			image: '/games/memory-game/anita/cards/bombacha.jpg',
			tips: [
				'Sou uma calça larga.',
				'Sou usada por gaúchos.',
				'Sou muito confortável.',
			],
			about:
				'A bombacha é uma calça larga e confortável usada pelos gaúchos para trabalhar, montar e festejar.',
		},
		{
			word: 'Lenço',
			image: '/games/memory-game/anita/cards/bombacha.jpg',
			tips: ['Uso no pescoço.', 'Sou colorido.', 'Faço parte do traje gaúcho.'],
			about:
				'O lenço é um acessório colorido usado no pescoço pelos gaúchos como parte do traje tradicional.',
		},

		{
			word: 'Cavalo',
			image: '/games/memory-game/anita/cards/cavalo.jpg',
			tips: [
				'Sou forte e rápido.',
				'Ajudo no campo.',
				'Sou amigo dos gaúchos.',
			],
			about:
				'O cavalo é muito importante no campo, ajudando os gaúchos a trabalhar, viajar e participar de rodeios.',
		},
		{
			word: 'Sela',
			image: '/games/memory-game/anita/cards/cavalo.jpg',
			tips: [
				'Fico no lombo do cavalo.',
				'Sou de couro.',
				'Ajudo a montar com segurança.',
			],
			about:
				'A sela é colocada no cavalo para que o cavaleiro possa montar com conforto e segurança.',
		},

		{
			word: 'Chimarrão',
			image: '/games/memory-game/anita/cards/chimarrao.jpg',
			tips: ['Sou quente.', 'Sou amargo.', 'Sou tradição gaúcha.'],
			about:
				'O chimarrão é uma bebida quente e amarga feita com erva-mate. É muito popular no Sul do Brasil.',
		},
		{
			word: 'Cuia',
			image: '/games/memory-game/anita/cards/chimarrao.jpg',
			tips: ['Sou redonda.', 'Sou feita de porongo.', 'Seguro o chimarrão.'],
			about:
				'A cuia é o recipiente feito de porongo usado para servir o chimarrão.',
		},

		{
			word: 'Churrasco',
			image: '/games/memory-game/anita/cards/churrasco.jpg',
			tips: [
				'Sou assado na brasa.',
				'Sou especial no Sul.',
				'Sou comida de festa.',
			],
			about:
				'O churrasco é uma carne assada na brasa, muito famosa no Sul e presente em encontros e comemorações.',
		},
		{
			word: 'Espeto',
			image: '/games/memory-game/anita/cards/churrasco.jpg',
			tips: ['Sou de metal.', 'Seguro a carne.', 'Vou para a churrasqueira.'],
			about:
				'O espeto é uma haste de metal usada para colocar e assar carnes no churrasco.',
		},

		{
			word: 'Pinhão',
			image: '/games/memory-game/anita/cards/comida.jpg',
			tips: [
				'Sou cozido para comer.',
				'Sou semente de araucária.',
				'Sou comum no Sul.',
			],
			about:
				'O pinhão é a semente da araucária, muito apreciada cozida e comum em festas de inverno no Sul.',
		},
		{
			word: 'Carreteiro',
			image: '/games/memory-game/anita/cards/comida.jpg',
			tips: [
				'Sou feito com arroz.',
				'Uso carne-seca.',
				'Sou tradicional dos gaúchos.',
			],
			about:
				'O carreteiro é um prato de arroz com carne-seca muito tradicional no Sul, simples e cheio de sabor.',
		},

		{
			word: 'Dança',
			image: '/games/memory-game/anita/cards/danca.jpg',
			tips: [
				'Uso o corpo para me mover.',
				'Posso ser em par.',
				'Sou comum em festas gaúchas.',
			],
			about:
				'A dança gaúcha mistura passos marcados, alegria e tradição, sendo muito presente em festas e eventos.',
		},
		{
			word: 'Vaneira',
			image: '/games/memory-game/anita/cards/danca.jpg',
			tips: [
				'Sou um ritmo do Sul.',
				'Sou animada.',
				'Gosto de pares dançando.',
			],
			about:
				'A vaneira é um ritmo musical gaúcho muito animado, dançado em pares e famoso em bailes.',
		},

		{
			word: 'Lenda',
			image: '/games/memory-game/anita/cards/historias.jpg',
			tips: [
				'Sou antiga.',
				'Sou cheia de imaginação.',
				'Passo de geração em geração.',
			],
			about:
				'A lenda é uma história antiga que mistura fantasia e cultura, ensinando valores e tradições.',
		},
		{
			word: 'Conto',
			image: '/games/memory-game/anita/cards/historias.jpg',
			tips: [
				'Sou uma narrativa curta.',
				'Tenho personagens.',
				'Sou divertido de ouvir.',
			],
			about:
				'O conto é uma história curtinha, fácil de entender e muito comum em rodas de conversa.',
		},

		{
			word: 'Música',
			image: '/games/memory-game/anita/cards/musica.jpg',
			tips: ['Tenho ritmo.', 'Posso ser cantada.', 'Acompanho festas.'],
			about:
				'A música gaúcha usa instrumentos e ritmos típicos, contando histórias sobre o campo e a vida no Sul.',
		},
		{
			word: 'Gaita',
			image: '/games/memory-game/anita/cards/musica.jpg',
			tips: [
				'Sou um instrumento.',
				'Tenho botões ou teclas.',
				'Sou comum no Sul.',
			],
			about:
				'A gaita é um instrumento muito usado na música gaúcha, produzindo sons alegres e tradicionais.',
		},

		{
			word: 'Poncho',
			image: '/games/memory-game/anita/cards/poncho.jpg',
			tips: ['Uso no frio.', 'Sou de tecido grosso.', 'Sou comum no campo.'],
			about:
				'O poncho é uma capa de tecido grosso usada para proteger do frio e da chuva no campo.',
		},
		{
			word: 'Lã',
			image: '/games/memory-game/anita/cards/poncho.jpg',
			tips: ['Venho das ovelhas.', 'Sou quentinha.', 'Viro roupas de inverno.'],
			about:
				'A lã é obtida das ovelhas e usada para fazer roupas quentinhas, como ponchos.',
		},

		{
			word: 'Prenda',
			image: '/games/memory-game/anita/cards/prenda.jpg',
			tips: [
				'Sou uma moça gaúcha.',
				'Uso vestido bonito.',
				'Participo de danças.',
			],
			about:
				'A prenda é a moça que representa a cultura gaúcha, usando vestidos tradicionais e participando de festas e danças.',
		},
		{
			word: 'Vestido',
			image: '/games/memory-game/anita/cards/prenda.jpg',
			tips: ['Sou longo.', 'Sou colorido.', 'Sou usado por prendas.'],
			about:
				'O vestido de prenda é colorido, longo e cheio de detalhes, sendo usado nas danças e festas gaúchas.',
		},

		{
			word: 'Rodeio',
			image: '/games/memory-game/anita/cards/rodeio.jpg',
			tips: ['Sou uma festa.', 'Tenho cavalos.', 'Sou tradição gaúcha.'],
			about:
				'O rodeio é um evento tradicional com provas de cavalo, danças e músicas típicas do Sul.',
		},
		{
			word: 'Laço',
			image: '/games/memory-game/anita/cards/rodeio.jpg',
			tips: [
				'Sou feito de corda.',
				'Sou usado a cavalo.',
				'Sou prova de rodeio.',
			],
			about:
				'O laço é usado nas provas de rodeio, onde o cavaleiro tenta acertar um alvo com habilidade e rapidez.',
		},
	],
	dandara: [
		{
			word: 'Açaí',
			image: '/games/memory-game/dandara/cards/acai.jpg',
			tips: ['Sou roxo.', 'Sou geladinho.', 'Sou muito popular no verão.'],
			about:
				'O açaí é uma fruta roxa servida gelada. Ele é muito querido no Rio de Janeiro, principalmente nos dias quentes.',
		},
		{
			word: 'Tigela',
			image: '/games/memory-game/dandara/cards/acai.jpg',
			tips: ['Guardo comida.', 'Sou redonda.', 'Seguro o açaí.'],
			about:
				'A tigela é o potinho onde o açaí é servido, junto com frutas ou granola.',
		},

		{
			word: 'Arco',
			image: '/games/memory-game/dandara/cards/arcor-da-lapa.jpg',
			tips: ['Sou muito grande.', 'Sou branco.', 'Sou famoso no Rio.'],
			about:
				'O Arco é parte dos Arcos da Lapa, um monumento histórico muito conhecido no Rio de Janeiro.',
		},
		{
			word: 'Lapa',
			image: '/games/memory-game/dandara/cards/arcor-da-lapa.jpg',
			tips: ['Sou um bairro.', 'Tenho muitos shows.', 'Sou cheio de alegria.'],
			about:
				'A Lapa é um bairro famoso por música, história e diversão no Rio de Janeiro.',
		},

		{
			word: 'Baile',
			image: '/games/memory-game/dandara/cards/baile-funk.jpg',
			tips: ['Sou uma festa.', 'Tenho música alta.', 'Sou muito animado.'],
			about:
				'O baile é uma festa onde as pessoas dançam e se divertem, muito comum nas comunidades do Rio.',
		},
		{
			word: 'Funk',
			image: '/games/memory-game/dandara/cards/baile-funk.jpg',
			tips: ['Sou um ritmo.', 'Sou dançante.', 'Nasci nas favelas.'],
			about:
				'O funk é um ritmo musical cheio de energia, criado nas comunidades cariocas.',
		},

		{
			word: 'Beija-flor',
			image: '/games/memory-game/dandara/cards/beija-flor.jpg',
			tips: ['Sou pequeno.', 'Bato as asas rápido.', 'Gosto de flores.'],
			about:
				'O beija-flor é um pássaro pequeno que bate as asas muito rápido e adora o néctar das flores.',
		},
		{
			word: 'Flor',
			image: '/games/memory-game/dandara/cards/beija-flor.jpg',
			tips: ['Sou colorida.', 'Tenho pétalas.', 'Atraio beija-flores.'],
			about:
				'A flor é a parte colorida das plantas e serve para atrair animais que ajudam na natureza.',
		},

		{
			word: 'Bondinho',
			image: '/games/memory-game/dandara/cards/bondinho.jpg',
			tips: ['Sou um transporte.', 'Ando pelo ar.', 'Levo turistas.'],
			about:
				'O bondinho é um teleférico que leva pessoas até o alto do Pão de Açúcar, sendo um passeio famoso no Rio.',
		},
		{
			word: 'Cabine',
			image: '/games/memory-game/dandara/cards/bondinho.jpg',
			tips: ['Sou fechada.', 'Levo passageiros.', 'Fico pendurada no cabo.'],
			about:
				'A cabine é a parte onde as pessoas ficam durante o passeio de bondinho.',
		},

		{
			word: 'Cristo',
			image: '/games/memory-game/dandara/cards/cristo-redentor.jpg',
			tips: ['Sou gigante.', 'Fico no alto do morro.', 'Sou símbolo do Rio.'],
			about:
				'O Cristo é uma enorme estátua de braços abertos que fica no topo do Corcovado.',
		},
		{
			word: 'Morro',
			image: '/games/memory-game/dandara/cards/cristo-redentor.jpg',
			tips: ['Sou bem alto.', 'Tenho vista bonita.', 'Carrego o Cristo.'],
			about:
				'O morro é uma montanha alta onde o Cristo Redentor foi construído.',
		},

		{
			word: 'Jardim',
			image: '/games/memory-game/dandara/cards/jardim-botanico.jpg',
			tips: ['Tenho muitas plantas.', 'Sou verde.', 'Sou tranquilo.'],
			about:
				'O jardim é um espaço cheio de plantas e flores, ótimo para passeios e descobertas.',
		},
		{
			word: 'Palmeira',
			image: '/games/memory-game/dandara/cards/jardim-botanico.jpg',
			tips: [
				'Sou alta.',
				'Tenho folhas grandes.',
				'Sou famosa no Jardim Botânico.',
			],
			about:
				'A palmeira é uma árvore alta muito comum no Rio, especialmente no Jardim Botânico.',
		},

		{
			word: 'Museu',
			image: '/games/memory-game/dandara/cards/museu-do-amanha.jpg',
			tips: ['Guardo conhecimento.', 'Tenho exposições.', 'Sou muito moderno.'],
			about:
				'O museu é um espaço cheio de descobertas e curiosidades para aprender.',
		},
		{
			word: 'Amanhã',
			image: '/games/memory-game/dandara/cards/museu-do-amanha.jpg',
			tips: ['Sou o futuro.', 'Sou tema do museu.', 'Faço pensar na vida.'],
			about:
				'O Museu do Amanhã fala sobre o futuro do planeta e como podemos cuidar dele.',
		},

		{
			word: 'Pagode',
			image: '/games/memory-game/dandara/cards/pagode.jpg',
			tips: ['Sou um ritmo.', 'Tenho muita alegria.', 'Sou primo do samba.'],
			about:
				'O pagode é um estilo musical alegre, cheio de instrumentos e muito cantado no Rio.',
		},
		{
			word: 'Pandeiro',
			image: '/games/memory-game/dandara/cards/pagode.jpg',
			tips: [
				'Sou um instrumento.',
				'Sou tocado com a mão.',
				'Sou muito usado no pagode.',
			],
			about:
				'O pandeiro é um instrumento de percussão que marca o ritmo no pagode e no samba.',
		},

		{
			word: 'Açúcar',
			image: '/games/memory-game/dandara/cards/pao-de-acucar.jpg',
			tips: [
				'Sou doce.',
				'Meu nome lembra uma montanha.',
				'Estou no Pão de Açúcar.',
			],
			about:
				'O nome Pão de Açúcar vem do formato da montanha, que parece um bloco antigo de açúcar.',
		},
		{
			word: 'Pão',
			image: '/games/memory-game/dandara/cards/pao-de-acucar.jpg',
			tips: [
				'Meu nome está na montanha.',
				'Sou comum no café.',
				'Não sou comida aqui!',
			],
			about:
				'O nome da montanha lembra um pão, mas neste caso é só uma comparação com o formato.',
		},

		{
			word: 'Praia',
			image: '/games/memory-game/dandara/cards/praia.jpg',
			tips: ['Tenho areia.', 'Tenho mar.', 'Sou muito divertida.'],
			about:
				'A praia é um lugar com areia e mar, perfeito para brincar, nadar e tomar sol.',
		},
		{
			word: 'Areia',
			image: '/games/memory-game/dandara/cards/praia.jpg',
			tips: ['Sou macia.', 'Sou clarinha.', 'Fico na praia.'],
			about:
				'A areia é o tapete natural da praia, usada para brincar, correr e construir castelos.',
		},

		{
			word: 'Samba',
			image: '/games/memory-game/dandara/cards/samba.jpg',
			tips: ['Sou um ritmo famoso.', 'Tenho muito gingado.', 'Sou do Rio.'],
			about:
				'O samba é um ritmo cheio de alegria e movimento, símbolo da cultura carioca.',
		},
		{
			word: 'Tambor',
			image: '/games/memory-game/dandara/cards/samba.jpg',
			tips: ['Sou um instrumento.', 'Faço tum-tum.', 'Março o ritmo do samba.'],
			about:
				'O tambor é um instrumento de percussão muito usado nas rodas de samba para marcar o ritmo.',
		},
	],
	iara: [
		{
			word: 'Açaí',
			image: '/games/memory-game/iara/cards/acai.jpg',
			tips: ['Sou roxo.', 'Sou gostoso gelado.', 'Venho da Amazônia.'],
			about:
				'O açaí é uma frutinha roxa da Amazônia, muito nutritiva e ótima para comer geladinha.',
		},
		{
			word: 'Fruta',
			image: '/games/memory-game/iara/cards/acai.jpg',
			tips: ['Sou saudável.', 'Nasço no pé.', 'Viro açaí.'],
			about:
				'A fruta é um alimento natural que nasce das plantas e é cheia de vitaminas.',
		},

		{
			word: 'Aldeia',
			image: '/games/memory-game/iara/cards/aldeia.jpg',
			tips: [
				'Sou um lugar de moradia.',
				'Fico na floresta.',
				'Sou cheia de cultura indígena.',
			],
			about:
				'A aldeia é onde vivem os povos indígenas, com suas casas, tradições e modos de vida.',
		},
		{
			word: 'Oca',
			image: '/games/memory-game/iara/cards/aldeia.jpg',
			tips: [
				'Sou uma casa.',
				'Sou feita de madeira e palha.',
				'Fico na aldeia.',
			],
			about:
				'A oca é uma casa tradicional indígena feita com materiais da floresta.',
		},

		{
			word: 'Boto',
			image: '/games/memory-game/iara/cards/boto.jpg',
			tips: ['Sou rosa.', 'Vivo nos rios.', 'Sou famoso em lendas.'],
			about:
				'O boto é um mamífero rosa dos rios amazônicos e aparece em muitas histórias da região.',
		},
		{
			word: 'Rio',
			image: '/games/memory-game/iara/cards/boto.jpg',
			tips: [
				'Sou cheio de água.',
				'O boto vive em mim.',
				'Sou muito grande na Amazônia.',
			],
			about:
				'O rio é um grande caminho de água que corre pela Amazônia e abriga muitos animais.',
		},

		{
			word: 'Curupira',
			image: '/games/memory-game/iara/cards/curipira.jpg',
			tips: [
				'Tenho cabelo vermelho.',
				'Protejo a floresta.',
				'Tenho pés virados.',
			],
			about:
				'O Curupira é um guardião da floresta que protege os animais e engana quem faz mal à natureza.',
		},
		{
			word: 'Guardião',
			image: '/games/memory-game/iara/cards/curipira.jpg',
			tips: ['Protejo a natureza.', 'Sou muito forte.', 'Apareço em lendas.'],
			about: 'O guardião é quem cuida da floresta e dos seres que vivem nela.',
		},

		{
			word: 'Guaraná',
			image: '/games/memory-game/iara/cards/guarana.jpg',
			tips: ['Sou vermelho.', 'Tenho sementes escuras.', 'Viro bebida.'],
			about:
				'O guaraná é um fruto da Amazônia com sementes fortes, muito usado em bebidas energéticas.',
		},
		{
			word: 'Semente',
			image: '/games/memory-game/iara/cards/guarana.jpg',
			tips: ['Sou pequena.', 'Parece um olho.', 'Nasço no guaraná.'],
			about:
				'A semente é a parte da planta que pode virar uma nova árvore ou fruto.',
		},

		{
			word: 'Jacaré',
			image: '/games/memory-game/iara/cards/jacare.jpg',
			tips: ['Tenho dentes fortes.', 'Sou um réptil.', 'Vivo nos rios.'],
			about:
				'O jacaré é um animal da Amazônia com boca grande e dentes afiados.',
		},
		{
			word: 'Escama',
			image: '/games/memory-game/iara/cards/jacare.jpg',
			tips: ['Sou dura.', 'Protejo o corpo.', 'O jacaré tem várias.'],
			about: 'A escama é a placa dura que protege o corpo de muitos répteis.',
		},

		{
			word: 'Onça',
			image: '/games/memory-game/iara/cards/onca-pintada.jpg',
			tips: ['Sou rápida.', 'Sou pintada.', 'Sou da Amazônia.'],
			about:
				'A onça é um felino forte e ágil que vive na Amazônia e tem manchas pelo corpo.',
		},
		{
			word: 'Mancha',
			image: '/games/memory-game/iara/cards/onca-pintada.jpg',
			tips: ['Sou escura.', 'Fico na pele da onça.', 'Ajudo na camuflagem.'],
			about:
				'A mancha é a marca escura na pele de alguns animais, como a onça-pintada.',
		},

		{
			word: 'Peixe',
			image: '/games/memory-game/iara/cards/peixe-boi.jpg',
			tips: ['Vivo na água.', 'Tenho nadadeiras.', 'Sou tranquilo.'],
			about:
				'O peixe é um animal aquático que vive nos rios e lagoas da Amazônia.',
		},
		{
			word: 'Boi',
			image: '/games/memory-game/iara/cards/peixe-boi.jpg',
			tips: ['Meu nome parece de fazenda.', 'Sou grandão.', 'Sou muito manso.'],
			about:
				'O peixe-boi é um animal grande e gentil que vive nos rios da Amazônia.',
		},

		{
			word: 'Seringa',
			image: '/games/memory-game/iara/cards/seringueira.jpg',
			tips: ['Sou uma árvore.', 'Dou látex.', 'Sou importante na Amazônia.'],
			about:
				'A seringueira é uma árvore da Amazônia de onde se retira o látex, usado para fazer borracha.',
		},
		{
			word: 'Látex',
			image: '/games/memory-game/iara/cards/seringueira.jpg',
			tips: ['Sou branco.', 'Saio da árvore.', 'Viro borracha.'],
			about:
				'O látex é um líquido branco que sai da seringueira e serve para fazer borracha.',
		},

		{
			word: 'Sucuri',
			image: '/games/memory-game/iara/cards/sucuri.jpg',
			tips: ['Sou uma cobra.', 'Sou muito grande.', 'Vivo na água.'],
			about:
				'A sucuri é uma cobra enorme que vive em rios e áreas alagadas da Amazônia.',
		},
		{
			word: 'Cobra',
			image: '/games/memory-game/iara/cards/sucuri.jpg',
			tips: [
				'Tenho corpo comprido.',
				'Não tenho patas.',
				'Posso viver na floresta.',
			],
			about:
				'A cobra é um réptil comprido sem patas que vive em vários lugares da floresta.',
		},

		{
			word: 'Uirapuru',
			image: '/games/memory-game/iara/cards/uirapuru.jpg',
			tips: ['Sou um pássaro.', 'Tenho canto bonito.', 'Sou raro.'],
			about:
				'O uirapuru é um pássaro amazônico famoso por seu canto muito bonito e raro.',
		},
		{
			word: 'Canto',
			image: '/games/memory-game/iara/cards/uirapuru.jpg',
			tips: ['Sou um som.', 'Vem dos pássaros.', 'Posso ser muito bonito.'],
			about:
				'O canto é o som que os pássaros fazem para se comunicar na floresta.',
		},

		{
			word: 'Vitória-régia',
			image: '/games/memory-game/iara/cards/vitoria-regia.jpg',
			tips: [
				'Sou uma planta da água.',
				'Sou bem grande.',
				'Tenho flores bonitas.',
			],
			about:
				'A vitória-régia é uma planta gigante que flutua nos lagos da Amazônia e tem flores lindas.',
		},
		{
			word: 'Folha',
			image: '/games/memory-game/iara/cards/vitoria-regia.jpg',
			tips: ['Sou verde.', 'Flutuo na água.', 'Posso ser enorme.'],
			about:
				'A folha da vitória-régia é enorme e flutua como se fosse uma grande prancha verde.',
		},
	],
	tonico: [
		{
			word: 'Lanche',
			image: '/games/memory-game/tonico/cards/cafe-da-tarde.jpg',
			tips: ['Como no fim da tarde.', 'Pode ter pão e bolo.', 'É bem gostoso.'],
			about: 'O lanche da tarde é uma refeição leve com pães, frutas ou bolos.',
		},
		{
			word: 'Mesa',
			image: '/games/memory-game/tonico/cards/cafe-da-tarde.jpg',
			tips: ['Fico na cozinha.', 'Seguro pratos e xícaras.', 'Uso para comer.'],
			about:
				'A mesa é onde colocamos a comida para fazer as refeições com conforto.',
		},

		{
			word: 'Café',
			image: '/games/memory-game/tonico/cards/cafe.jpg',
			tips: ['Sou quentinho.', 'Sou escurinho.', 'Adultos gostam de mim.'],
			about:
				'O café é uma bebida quente muito apreciada pelos adultos, comum em Minas.',
		},
		{
			word: 'Xícara',
			image: '/games/memory-game/tonico/cards/cafe.jpg',
			tips: ['Sou pequena.', 'Seguro café.', 'Tenho uma alça.'],
			about: 'A xícara é usada para servir bebidas quentes, como o café.',
		},

		{
			word: 'Doce',
			image: '/games/memory-game/tonico/cards/doce-de-leite.jpg',
			tips: [
				'Sou muito açucarado.',
				'As crianças adoram.',
				'Sou presente em festas.',
			],
			about:
				'O doce é uma comida açucarada que pode ser feita de frutas, leite ou chocolate.',
		},
		{
			word: 'Leite',
			image: '/games/memory-game/tonico/cards/doce-de-leite.jpg',
			tips: ['Sou branco.', 'Venho da vaca.', 'Viro doce de leite.'],
			about:
				'O leite é um alimento importante e serve de base para muitos doces e receitas.',
		},

		{
			word: 'Igreja',
			image: '/games/memory-game/tonico/cards/igreja.jpg',
			tips: [
				'Sou um prédio antigo.',
				'Tenho sino.',
				'As pessoas visitam aos domingos.',
			],
			about:
				'A igreja é um lugar de encontro, oração e tradição em muitas cidades mineiras.',
		},
		{
			word: 'Sino',
			image: '/games/memory-game/tonico/cards/igreja.jpg',
			tips: ['Faço barulho.', 'Fico no alto.', 'Sou tocado em festas.'],
			about:
				'O sino é um instrumento que toca para avisar eventos ou marcar horários.',
		},

		{
			word: 'Boneca',
			image: '/games/memory-game/tonico/cards/namoradeira.jpg',
			tips: ['Fico na janela.', 'Tenho rosto pintado.', 'Sou decoração.'],
			about:
				'A boneca namoradeira é uma peça decorativa típica das janelas mineiras.',
		},
		{
			word: 'Janela',
			image: '/games/memory-game/tonico/cards/namoradeira.jpg',
			tips: [
				'Sou aberta para o ar entrar.',
				'Sou parte da casa.',
				'Posso ter uma namoradeira.',
			],
			about:
				'A janela deixa a luz entrar e em Minas pode ter bonecas decorativas.',
		},

		{
			word: 'Pão',
			image: '/games/memory-game/tonico/cards/pao-de-queijo.jpg',
			tips: ['Sou macio.', 'Sou redondinho.', 'Sou muito famoso em Minas.'],
			about: 'O pão de queijo é um pãozinho macio feito com polvilho e queijo.',
		},
		{
			word: 'Queijo',
			image: '/games/memory-game/tonico/cards/pao-de-queijo.jpg',
			tips: ['Sou amarelinho.', 'Sou saboroso.', 'Sou usado no pão de queijo.'],
			about:
				'O queijo é um alimento feito do leite, muito tradicional em Minas Gerais.',
		},

		{
			word: 'Queijo',
			image: '/games/memory-game/tonico/cards/queijo.jpg',
			tips: [
				'Sou feito de leite.',
				'Sou salgado.',
				'Sou muito famoso em Minas.',
			],
			about:
				'O queijo mineiro é conhecido em todo o Brasil pelo sabor marcante.',
		},
		{
			word: 'Fatia',
			image: '/games/memory-game/tonico/cards/queijo.jpg',
			tips: ['Sou fina.', 'Sou cortada do queijo.', 'Sou fácil de comer.'],
			about: 'A fatia é um pedaço fininho de queijo ou outro alimento.',
		},

		{
			word: 'Quiabo',
			image: '/games/memory-game/tonico/cards/quiabo.jpg',
			tips: [
				'Sou um legume verde.',
				'Sou compridinho.',
				'Vou muito bem com frango.',
			],
			about:
				'O quiabo é um legume comum na culinária mineira, usado em pratos caseiros.',
		},
		{
			word: 'Legume',
			image: '/games/memory-game/tonico/cards/quiabo.jpg',
			tips: ['Sou saudável.', 'Venho da horta.', 'Posso ser verde.'],
			about: 'Um legume é um alimento da horta cheio de nutrientes.',
		},

		{
			word: 'Roca',
			image: '/games/memory-game/tonico/cards/roca.jpg',
			tips: ['Sou de madeira.', 'Sirvo para fiar lã.', 'Sou antigo.'],
			about: 'A roca é um instrumento usado para fiar lã e fazer linhas.',
		},
		{
			word: 'Lã',
			image: '/games/memory-game/tonico/cards/roca.jpg',
			tips: ['Sou quentinha.', 'Venho da ovelha.', 'Viro roupa.'],
			about: 'A lã é retirada da ovelha e usada para fazer roupas e fios.',
		},

		{
			word: 'Romeu',
			image: '/games/memory-game/tonico/cards/romeu-e-julieta.jpg',
			tips: [
				'Sou parte de um doce.',
				'Meu par é Julieta.',
				'Sou feito com queijo.',
			],
			about:
				'Romeu representa o queijo no doce tradicional mineiro Romeu e Julieta.',
		},
		{
			word: 'Julieta',
			image: '/games/memory-game/tonico/cards/romeu-e-julieta.jpg',
			tips: ['Sou doce.', 'Sou feita de goiaba.', 'Combino com queijo.'],
			about:
				'Julieta representa a goiabada que combina com queijo no doce mineiro.',
		},

		{
			word: 'Trem',
			image: '/games/memory-game/tonico/cards/trem.jpg',
			tips: ['Ando nos trilhos.', 'Sou comprido.', 'Carrego passageiros.'],
			about:
				'O trem é um transporte comum em Minas e atravessa belas paisagens.',
		},
		{
			word: 'Trilho',
			image: '/games/memory-game/tonico/cards/trem.jpg',
			tips: ['Sou de metal.', 'O trem anda sobre mim.', 'Sou comprido.'],
			about: 'O trilho é a estrutura de metal onde o trem passa.',
		},

		{
			word: 'Viola',
			image: '/games/memory-game/tonico/cards/viola.jpg',
			tips: ['Sou um instrumento.', 'Tenho cordas.', 'Sou comum em Minas.'],
			about:
				'A viola é um instrumento de cordas muito usado na música caipira e mineira.',
		},
		{
			word: 'Corda',
			image: '/games/memory-game/tonico/cards/viola.jpg',
			tips: ['Faço som na viola.', 'Sou esticada.', 'Sou afinada.'],
			about: 'A corda é a parte da viola que vibra e produz o som.',
		},
	],
	zeca: [
		{
			word: 'Arte',
			image: 'apps/web/public/games/memory-game/zeca/cards/artesanato.jpg',
			tips: ['Sou criativa.', 'Sou feita à mão.', 'Sou muito colorida.'],
			about:
				'A arte é feita com criatividade e pode usar materiais simples, como madeira e barro.',
		},
		{
			word: 'Barro',
			image: 'apps/web/public/games/memory-game/zeca/cards/artesanato.jpg',
			tips: ['Sou mole.', 'Viro objetos.', 'Sou usado no artesanato.'],
			about:
				'O barro é usado por artesãos para criar potes, bonecos e esculturas.',
		},

		{
			word: 'Baiana',
			image: 'apps/web/public/games/memory-game/zeca/cards/baiana.jpg',
			tips: ['Uso vestido grande.', 'Tenho turbante.', 'Sou símbolo da Bahia.'],
			about:
				'A baiana usa roupas coloridas e é símbolo da cultura e da culinária da Bahia.',
		},
		{
			word: 'Vestido',
			image: 'apps/web/public/games/memory-game/zeca/cards/baiana.jpg',
			tips: ['Sou rodado.', 'Sou colorido.', 'Sou usado pela baiana.'],
			about: 'O vestido da baiana é largo e cheio de cores, muito tradicional.',
		},

		{
			word: 'Boneco',
			image:
				'apps/web/public/games/memory-game/zeca/cards/boneco-de-olinda.jpg',
			tips: ['Sou gigante.', 'Desfilo no carnaval.', 'Sou muito colorido.'],
			about:
				'O boneco gigante é um personagem alto e divertido que aparece no carnaval de Olinda.',
		},
		{
			word: 'Olinda',
			image:
				'apps/web/public/games/memory-game/zeca/cards/boneco-de-olinda.jpg',
			tips: [
				'Sou uma cidade.',
				'Fico em Pernambuco.',
				'Sou famosa pelo carnaval.',
			],
			about:
				'Olinda é uma cidade histórica de Pernambuco conhecida por seu carnaval e bonecos gigantes.',
		},

		{
			word: 'Cangaço',
			image: 'apps/web/public/games/memory-game/zeca/cards/cangaco.jpg',
			tips: [
				'Sou parte da história.',
				'Uso chapéu de couro.',
				'Vivo no sertão.',
			],
			about:
				'O cangaço foi um movimento do sertão com roupas marcantes e muita história.',
		},
		{
			word: 'Couro',
			image: 'apps/web/public/games/memory-game/zeca/cards/cangaco.jpg',
			tips: ['Sou resistente.', 'Viro chapéu.', 'Sou usado no cangaço.'],
			about:
				'O couro é um material forte usado para fazer roupas e acessórios do sertão.',
		},

		{
			word: 'Capoeira',
			image: 'apps/web/public/games/memory-game/zeca/cards/capoeira.jpg',
			tips: ['Sou uma luta.', 'Tenho música.', 'Sou cheia de movimentos.'],
			about:
				'A capoeira mistura luta, dança e música, criada por povos africanos no Brasil.',
		},
		{
			word: 'Roda',
			image: 'apps/web/public/games/memory-game/zeca/cards/capoeira.jpg',
			tips: [
				'Sou em círculo.',
				'A capoeira acontece em mim.',
				'Tenho música e palmas.',
			],
			about:
				'A roda é o círculo onde os capoeiristas se apresentam ao som de instrumentos.',
		},

		{
			word: 'Feira',
			image: 'apps/web/public/games/memory-game/zeca/cards/caruaru.jpg',
			tips: [
				'Sou movimentada.',
				'Vendo muitas coisas.',
				'Sou famosa em Caruaru.',
			],
			about:
				'A feira de Caruaru é uma das mais tradicionais do Nordeste, cheia de cores e sabores.',
		},
		{
			word: 'Caruaru',
			image: 'apps/web/public/games/memory-game/zeca/cards/caruaru.jpg',
			tips: [
				'Sou uma cidade.',
				'Fico em Pernambuco.',
				'Sou famosa por festas.',
			],
			about:
				'Caruaru é uma cidade conhecida pelo forró, festas juninas e artesanato.',
		},

		{
			word: 'Prato',
			image: 'apps/web/public/games/memory-game/zeca/cards/comida.jpg',
			tips: ['Seguro comida.', 'Fico na mesa.', 'Sou redondo.'],
			about:
				'O prato é onde a comida é servida, podendo ter sabores típicos do Nordeste.',
		},
		{
			word: 'Sabor',
			image: 'apps/web/public/games/memory-game/zeca/cards/comida.jpg',
			tips: [
				'Sou gostoso.',
				'Mudo conforme o prato.',
				'Sou importante na culinária.',
			],
			about:
				'O sabor é o gosto dos alimentos, que pode ser doce, salgado ou apimentado.',
		},

		{
			word: 'Fogueira',
			image: 'apps/web/public/games/memory-game/zeca/cards/festa-junina.jpg',
			tips: ['Sou de madeira.', 'Sou acesa na festa.', 'Sou bem quentinha.'],
			about:
				'A fogueira é acesa nas festas juninas para iluminar e animar a celebração.',
		},
		{
			word: 'Bandeira',
			image: 'apps/web/public/games/memory-game/zeca/cards/festa-junina.jpg',
			tips: ['Sou colorida.', 'Sou triangular.', 'Decoro festas.'],
			about:
				'As bandeirinhas são usadas para enfeitar as festas juninas com muitas cores.',
		},

		{
			word: 'Olodum',
			image: 'apps/web/public/games/memory-game/zeca/cards/olodum.jpg',
			tips: ['Sou um grupo musical.', 'Uso tambores.', 'Sou da Bahia.'],
			about:
				'O Olodum é um grupo musical baiano que usa tambores e ritmos africanos.',
		},
		{
			word: 'Tambor',
			image: 'apps/web/public/games/memory-game/zeca/cards/olodum.jpg',
			tips: [
				'Sou tocado com a mão.',
				'Faço tum-tum.',
				'Sou muito usado no Olodum.',
			],
			about:
				'O tambor é um instrumento de percussão que marca o ritmo das músicas baianas.',
		},

		{
			word: 'Sertão',
			image: 'apps/web/public/games/memory-game/zeca/cards/sertao.jpg',
			tips: ['Sou quente.', 'Sou do Nordeste.', 'Tenho paisagens secas.'],
			about:
				'O sertão é uma região quente e seca do Nordeste, cheia de cultura e histórias.',
		},
		{
			word: 'Mandacaru',
			image: 'apps/web/public/games/memory-game/zeca/cards/sertao.jpg',
			tips: ['Sou um cacto.', 'Tenho espinhos.', 'Vivo no sertão.'],
			about:
				'O mandacaru é um cacto alto que cresce no sertão e resiste ao calor.',
		},

		{
			word: 'Teatro',
			image: 'apps/web/public/games/memory-game/zeca/cards/teatro.jpg',
			tips: ['Tenho atores.', 'Conto histórias.', 'Sou apresentado no palco.'],
			about: 'O teatro é onde artistas interpretam histórias para o público.',
		},
		{
			word: 'Palco',
			image: 'apps/web/public/games/memory-game/zeca/cards/teatro.jpg',
			tips: [
				'Fico na frente.',
				'Atores sobem em mim.',
				'Mostro a apresentação.',
			],
			about: 'O palco é o espaço onde acontecem as apresentações do teatro.',
		},

		{
			word: 'Vaquejada',
			image: 'apps/web/public/games/memory-game/zeca/cards/vaquejada.jpg',
			tips: ['Sou um esporte.', 'Tenho cavalos.', 'Sou do Nordeste.'],
			about:
				'A vaquejada é uma tradição nordestina com cavalos e habilidade dos vaqueiros.',
		},
		{
			word: 'Vaqueiro',
			image: 'apps/web/public/games/memory-game/zeca/cards/vaquejada.jpg',
			tips: ['Ando a cavalo.', 'Uso chapéu.', 'Sou do sertão.'],
			about: 'O vaqueiro é quem cuida do gado e participa das vaquejadas.',
		},
	],
};
