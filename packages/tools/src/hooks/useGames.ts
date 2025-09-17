import { gamesService } from '../services';
import { message } from 'antd';

export interface GameInterface {
	name: string;
	slug: string;
	description: string;
	url: string;
}

export enum GamesEnum {
	MEMORY_GAME = 'memory-game',
}

export enum GameNameEnum {
	'memory-game' = 'Jogo da Memória',
}

const GamesContent = [
	{
		name: GameNameEnum['memory-game'],
		slug: GamesEnum.MEMORY_GAME,
		description:
			'Encontre os pares e descubra símbolos culturais do Brasil enquanto exercita sua memória de forma divertida e educativa!',
		url: '/estudante/jogos/jogo-da-memoria',
	},
];

export const useGames = (userId?: string) => {
	const allGames = GamesContent;

	const saveGameScore = (
		slug: string,
		characterSlug: string,
		score: number
	) => {
		if (!userId) {
			message.error('Usuário não encontrado!');
			return;
		}
		return gamesService
			.saveScore(slug, characterSlug, score, userId)
			.then(() => {
				message.success('Pontuação salva com sucesso!');
			})
			.catch(() => {
				message.error('Erro ao salvar pontuação!');
			});
	};

	return {
		allGames,
		saveGameScore,
	};
};
