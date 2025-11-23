import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGames } from './';
import { message } from 'antd';
import { gamesService } from '../../services';

vi.mock('antd', () => ({
	message: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

vi.mock('../../services', () => ({
	gamesService: {
		saveScore: vi.fn(),
	},
}));

describe('useGames hook', () => {
	beforeEach(() => {
		vi.clearAllMocks();
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
		]);
	});

	it('deve mostrar erro se não houver userId', async () => {
		const { result } = renderHook(() => useGames());

		await act(async () => {
			result.current.saveGameScore('memory-game', 'iara', 100);
		});

		expect(message.error).toHaveBeenCalledWith('Usuário não encontrado!');
		expect(gamesService.saveScore).not.toHaveBeenCalled();
	});

	it('deve salvar pontuação com sucesso', async () => {
		(gamesService.saveScore as any).mockResolvedValueOnce('ok');

		const { result } = renderHook(() => useGames('user123'));

		await act(async () => {
			await result.current.saveGameScore('memory-game', 'iara', 200);
		});

		expect(gamesService.saveScore).toHaveBeenCalledWith(
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
		(gamesService.saveScore as any).mockRejectedValueOnce(new Error('fail'));

		const { result } = renderHook(() => useGames('user123'));

		await act(async () => {
			await result.current.saveGameScore('memory-game', 'iara', 300);
		});

		expect(gamesService.saveScore).toHaveBeenCalled();
		expect(message.error).toHaveBeenCalledWith('Erro ao salvar pontuação!');
	});
});
