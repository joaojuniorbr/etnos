export interface GameInterface {
	name: string;
	slug: string;
	description: string;
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
	},
];

export const useGames = () => {
	const allGames = GamesContent;

	return {
		allGames,
	};
};
