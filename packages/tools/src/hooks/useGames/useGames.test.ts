import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGames } from './';
import { message } from 'antd';
import { scoreGamesService } from '../../services';

class MockAudio {
	src: string;
	play = vi.fn().mockResolvedValue(undefined);
	remove = vi.fn();
	onended: (() => void) | null = null;

	constructor(src: string) {
		this.src = src;
	}
}

vi.stubGlobal('Audio', MockAudio);

vi.mock('antd', () => ({
	message: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

vi.mock('../../services', () => ({
	scoreGamesService: {
		saveScore: vi.fn(),
	},
}));

describe('useGames hook', () => {
	let instances: any[] = [];

	class MockAudio {
		src: string;
		play = vi.fn().mockResolvedValue(undefined);
		remove = vi.fn();
		onended: (() => void) | null = null;

		constructor(src: string) {
			this.src = src;
			instances.push(this);
		}
	}

	beforeEach(() => {
		instances = [];

		vi.clearAllMocks();

		Object.defineProperty(global, 'Audio', {
			value: MockAudio,
			configurable: true,
		});
	});

	it('deve retornar todos os jogos', () => {
		const { result } = renderHook(() => useGames('user123'));
		expect(result.current.allGames).toEqual([
			{
				name: 'Jogo da Memória',
				slug: 'memory-game',
				description:
					'Encontre os pares e descubra símbolos culturais do Brasil enquanto exercita sua memória de forma divertida e educativa!',
				url: '/estudante/jogos/jogo-da-memoria',
			},
			{
				description:
					'Encontre a palavra, digite uma letra de cada vez, teste suas habilidades de adivinhação e desvenda os segredos culturais do Brasil!',
				name: 'Adivinhe',
				slug: 'guess-game',
				url: '/estudante/jogos/advinhe',
			},
		]);
	});

	it('deve mostrar erro se não houver userId', async () => {
		const { result } = renderHook(() => useGames());

		await act(async () => {
			result.current.saveGameScore('memory-game', 'iara', 100);
		});

		expect(message.error).toHaveBeenCalledWith('Usuário não encontrado!');
		expect(scoreGamesService.saveScore).not.toHaveBeenCalled();
	});

	it('deve salvar pontuação com sucesso', async () => {
		(scoreGamesService.saveScore as any).mockResolvedValueOnce('ok');

		const { result } = renderHook(() => useGames('user123'));

		await act(async () => {
			await result.current.saveGameScore('memory-game', 'iara', 200);
		});

		expect(scoreGamesService.saveScore).toHaveBeenCalledWith(
			'memory-game',
			'iara',
			200,
			'user123'
		);
		expect(message.success).toHaveBeenCalledWith(
			'Pontuação salva com sucesso!'
		);
	});

	it('deve mostrar erro ao falhar salvar pontuação', async () => {
		(scoreGamesService.saveScore as any).mockRejectedValueOnce(
			new Error('fail')
		);

		const { result } = renderHook(() => useGames('user123'));

		await act(async () => {
			await result.current.saveGameScore('memory-game', 'iara', 300);
		});

		expect(scoreGamesService.saveScore).toHaveBeenCalled();
		expect(message.error).toHaveBeenCalledWith('Erro ao salvar pontuação!');
	});

	it('deve tocar o som correto ao chamar playSound()', () => {
		const { playSound } = useGames();

		playSound('flip');

		const instance = instances[0];

		expect(instance).toBeTruthy();
		expect(instance.src).toBe('/games/sounds/flap.mp3');
		expect(instance.play).toHaveBeenCalled();

		instance.onended?.();

		expect(instance.remove).toHaveBeenCalled();
	});
});
