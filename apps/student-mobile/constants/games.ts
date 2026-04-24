import { GameNameEnum, GamesEnum, type GameInterface } from '@etnos/types';

export const studentGames: GameInterface[] = [
	{
		name: GameNameEnum[GamesEnum.MEMORY_GAME],
		slug: GamesEnum.MEMORY_GAME,
		description:
			'Encontre os pares e descubra símbolos culturais do Brasil enquanto exercita sua memória.',
		url: '/games/memory',
	},
];
