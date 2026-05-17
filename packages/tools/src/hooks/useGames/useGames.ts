'use client';

import { scoreGamesService } from '@etnos/services';
import { message } from 'antd';
import { GameNameEnum, GamesEnum } from '@etnos/types';

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
		score: number,
	) => {
		if (!userId) {
			message.error('Usuário não encontrado!');
			return;
		}
		return scoreGamesService
			.saveScore(slug, characterSlug, score, userId)
			.then(() => {
				message.success('Pontuação salva com sucesso!');
			})
			.catch(() => {
				message.error('Erro ao salvar pontuação!');
			});
	};

	const startGameSession = (slug: string, characterSlug: string) => {
		if (!userId) {
			return Promise.resolve(null);
		}

		return scoreGamesService.saveScoreHistory(slug, characterSlug, 0, userId, {
			phase: 'start',
		});
	};

	const saveGameScoreHistory = (
		slug: string,
		characterSlug: string,
		score: number,
		sessionId?: string | null,
	) => {
		if (!userId) {
			return;
		}

		return scoreGamesService.saveScoreHistory(
			slug,
			characterSlug,
			score,
			userId,
			sessionId ? { phase: 'end', sessionId } : undefined,
		);
	};

	const playSound = (sound: keyof typeof sounds) => {
		const audio = new Audio(sounds[sound]);

		audio.play();

		audio.onended = () => {
			audio.remove();
		};
	};

	const submitGameNps = (
		slug: string,
		characterSlug: string,
		rating: number,
		comment?: string,
	) => {
		if (!userId) {
			message.error('Usuário não encontrado!');
			return Promise.resolve();
		}
		return scoreGamesService
			.submitGameNps(slug, characterSlug, rating, userId, comment)
			.then(() => {
				message.success('Obrigado pelo seu feedback!');
			})
			.catch(() => {
				message.error('Não foi possível enviar o feedback.');
			});
	};

	const getGameNps = (slug: string) => {
		if (!userId) {
			return Promise.resolve(null);
		}

		return scoreGamesService.getGameNps(slug, userId);
	};

	return {
		allGames,
		saveGameScore,
		startGameSession,
		saveGameScoreHistory,
		playSound,
		submitGameNps,
		getGameNps,
	};
};
