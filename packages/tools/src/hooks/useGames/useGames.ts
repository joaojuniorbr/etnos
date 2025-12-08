import { gamesService } from '../../services';
import { message } from 'antd';

export interface GameInterface {
	name: string;
	slug: string;
	description: string;
	url: string;
}

export enum GamesEnum {
	MEMORY_GAME = 'memory-game',
	GUESS_GAME = 'guess-game',
}

export enum GameNameEnum {
	'memory-game' = 'Jogo da Memória',
	'guess-game' = 'Adivinhe',
}

const GamesContent = [
	{
		name: GameNameEnum['memory-game'],
		slug: GamesEnum.MEMORY_GAME,
		description:
			'Encontre os pares e descubra símbolos culturais do Brasil enquanto exercita sua memória de forma divertida e educativa!',
		url: '/estudante/jogos/jogo-da-memoria',
	},
	{
		name: GameNameEnum['guess-game'],
		slug: GamesEnum.GUESS_GAME,
		description:
			'Encontre a palavra, digite uma letra de cada vez, teste suas habilidades de adivinhação e desvenda os segredos culturais do Brasil!',
		url: '/estudante/jogos/advinhe',
	},
];

export const useGames = (userId?: string) => {
	const allGames = GamesContent;

	const sounds = {
		flip: '/games/sounds/flap.mp3',
		success: '/games/sounds/success.mp3',
		error: '/games/sounds/error.mp3',
		finish: '/games/sounds/finish.mp3',
	};

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

	const playSound = (sound: keyof typeof sounds) => {
		const audio = new Audio(sounds[sound]);

		audio.play().catch((error) => {
			console.warn(`Failed to play sound ${sound}:`, error);
		});

		audio.onended = () => {
			audio.remove();
		};
	};

	return {
		allGames,
		saveGameScore,
		playSound,
	};
};
