export interface GameInterface {
	name: string;
	slug: string;
	description: string;
	url: string;
}

enum GamesEnum {
	MEMORY_GAME = 'memory-game',
}

const GamesContent = [
	{
		name: 'Jogo da Memória',
		slug: GamesEnum.MEMORY_GAME,
		description:
			'Encontre os pares e descubra símbolos culturais do Brasil enquanto exercita sua memória de forma divertida e educativa!',
		url: '/estudante/jogos/jogo-da-memoria',
	},
];

export const useGames = () => {
	const allGames = GamesContent;

	return {
		allGames,
	};
};
