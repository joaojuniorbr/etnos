import { describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import { MemoryGame } from './MemoryGame';

const useCharacterMock = vi.fn();
const useUserMock = vi.fn();
const useGamesMock = vi.fn();
const useGameScoreMock = vi.fn();
const useMemoryGameContentMock = vi.fn();
const useGamesConfigMock = vi.fn();
const memoryGameExperienceMock = vi.fn();

const { trackGameFinishedMock } = vi.hoisted(() => ({
	trackGameFinishedMock: vi.fn(),
}));

vi.mock('@etnos/analytics/web', () => ({
	trackGameFinished: trackGameFinishedMock,
}));

vi.mock('@etnos/tools', () => ({
	useCharacter: (...args: unknown[]) => useCharacterMock(...args),
	useGames: (...args: unknown[]) => useGamesMock(...args),
	useGamesConfig: (...args: unknown[]) => useGamesConfigMock(...args),
	useGameScore: (...args: unknown[]) => useGameScoreMock(...args),
	useMemoryGameContent: (...args: unknown[]) =>
		useMemoryGameContentMock(...args),
}));

vi.mock('@etnos/ui', () => ({
	useUser: () => useUserMock(),
}));

vi.mock('./MemoryGameExperience', () => ({
	MemoryGameExperience: (props: unknown) => {
		memoryGameExperienceMock(props);
		return <div data-testid="memory-game-experience" />;
	},
}));

describe('MemoryGame', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useCharacterMock.mockReturnValue({
			selectedCharacter: { slug: 'anita', name: 'Anita' },
		});
		useUserMock.mockReturnValue({
			user: { uid: 'user-1' },
		});
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			saveGameScoreHistory: vi.fn().mockResolvedValue(undefined),
			startGameSession: vi.fn().mockResolvedValue(null),
			playSound: vi.fn(),
		});
		useGameScoreMock.mockReturnValue({
			data: { score: 300 },
			refetch: vi.fn(),
			isLoading: false,
		});
		useMemoryGameContentMock.mockReturnValue({
			data: [{ name: 'chimarrao', image: '/a.jpg' }],
		});
		useGamesConfigMock.mockReturnValue({
			data: [{ characterSlug: 'anita', imageCoverUrl: '/cover-config.jpg' }],
		});
	});

	it('monta a experiência com conteúdo, score e cover vindo da configuração', () => {
		render(<MemoryGame />);

		expect(memoryGameExperienceMock).toHaveBeenCalledWith(
			expect.objectContaining({
				bestScore: 300,
				content: [{ name: 'chimarrao', image: '/a.jpg' }],
				coverImage: '/cover-config.jpg',
				selectedCharacter: { slug: 'anita', name: 'Anita' },
			}),
		);
	});

	it('prioriza o characterSlug recebido por props nas consultas', () => {
		render(<MemoryGame characterSlug="zeca" />);

		expect(useGameScoreMock).toHaveBeenCalledWith(
			'user-1',
			'memory-game',
			'zeca',
		);
		expect(useMemoryGameContentMock).toHaveBeenCalledWith('zeca');
	});

	it('usa slug vazio quando nao houver prop nem personagem selecionado', () => {
		useCharacterMock.mockReturnValue({
			selectedCharacter: undefined,
		});

		render(<MemoryGame />);

		expect(useGameScoreMock).toHaveBeenCalledWith('user-1', 'memory-game', '');
		expect(useMemoryGameContentMock).toHaveBeenCalledWith('');
	});

	it('salva score e faz refetch quando há usuário e personagem', async () => {
		const saveGameScore = vi.fn().mockResolvedValue(undefined);
		const refetch = vi.fn();
		useGamesMock.mockReturnValue({
			saveGameScore,
			saveGameScoreHistory: vi.fn().mockResolvedValue(undefined),
			startGameSession: vi.fn().mockResolvedValue(null),
			playSound: vi.fn(),
		});
		useGameScoreMock.mockReturnValue({
			data: { score: 300 },
			refetch,
			isLoading: false,
		});

		render(<MemoryGame />);

		const props = memoryGameExperienceMock.mock.calls.at(-1)?.[0] as {
			onSaveScore: (score: number) => Promise<void>;
		};

		await act(async () => {
			await props.onSaveScore(320);
		});

		expect(saveGameScore).toHaveBeenCalledWith('memory-game', 'anita', 320);
		expect(refetch).toHaveBeenCalled();
	});

	it('não salva score menor ou igual ao recorde atual', async () => {
		const saveGameScore = vi.fn().mockResolvedValue(undefined);
		const refetch = vi.fn();
		useGamesMock.mockReturnValue({
			saveGameScore,
			saveGameScoreHistory: vi.fn().mockResolvedValue(undefined),
			startGameSession: vi.fn().mockResolvedValue(null),
			playSound: vi.fn(),
		});
		useGameScoreMock.mockReturnValue({
			data: { score: 300 },
			refetch,
			isLoading: false,
		});

		render(<MemoryGame />);

		const props = memoryGameExperienceMock.mock.calls.at(-1)?.[0] as {
			onSaveScore: (score: number) => Promise<void>;
		};

		await act(async () => {
			await props.onSaveScore(300);
			await props.onSaveScore(120);
		});

		expect(saveGameScore).not.toHaveBeenCalled();
	});

	it('usa characterSlug da prop para salvar score quando disponível', async () => {
		const saveGameScore = vi.fn().mockResolvedValue(undefined);
		const refetch = vi.fn();
		useGamesMock.mockReturnValue({
			saveGameScore,
			saveGameScoreHistory: vi.fn().mockResolvedValue(undefined),
			startGameSession: vi.fn().mockResolvedValue(null),
			playSound: vi.fn(),
		});
		useGameScoreMock.mockReturnValue({
			data: { score: 10 },
			refetch,
			isLoading: false,
		});

		render(<MemoryGame characterSlug="zeca" />);

		const props = memoryGameExperienceMock.mock.calls.at(-1)?.[0] as {
			onSaveScore: (score: number) => Promise<void>;
		};

		await act(async () => {
			await props.onSaveScore(90);
		});

		expect(saveGameScore).toHaveBeenCalledWith('memory-game', 'zeca', 90);
	});

	it('salva histórico automaticamente quando há usuário e personagem', async () => {
		const saveGameScoreHistory = vi.fn().mockResolvedValue(undefined);
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			saveGameScoreHistory,
			startGameSession: vi.fn().mockResolvedValue(null),
			playSound: vi.fn(),
		});

		render(<MemoryGame />);

		const props = memoryGameExperienceMock.mock.calls.at(-1)?.[0] as {
			onSaveScoreHistory: (score: number) => Promise<void>;
		};

		await act(async () => {
			await props.onSaveScoreHistory(250);
		});

		expect(saveGameScoreHistory).toHaveBeenCalledWith(
			'memory-game',
			'anita',
			250,
			null,
		);
	});

	it('inicia sessão e usa o id retornado ao salvar histórico', async () => {
		const saveGameScoreHistory = vi.fn().mockResolvedValue(undefined);
		const startGameSession = vi
			.fn()
			.mockResolvedValue({ id: 'memory-session-1' });
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			saveGameScoreHistory,
			startGameSession,
			playSound: vi.fn(),
		});

		render(<MemoryGame />);

		const props = memoryGameExperienceMock.mock.calls.at(-1)?.[0] as {
			onGameSessionStart: () => Promise<void>;
			onSaveScoreHistory: (score: number) => Promise<void>;
		};

		await act(async () => {
			await props.onGameSessionStart();
			await props.onSaveScoreHistory(250);
		});

		expect(startGameSession).toHaveBeenCalledWith('memory-game', 'anita');
		expect(saveGameScoreHistory).toHaveBeenCalledWith(
			'memory-game',
			'anita',
			250,
			'memory-session-1',
		);
	});

	it('reseta a sessão antes de salvar histórico novamente', async () => {
		const saveGameScoreHistory = vi.fn().mockResolvedValue(undefined);
		const startGameSession = vi
			.fn()
			.mockResolvedValue({ id: 'memory-session-1' });
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			saveGameScoreHistory,
			startGameSession,
			playSound: vi.fn(),
		});

		render(<MemoryGame />);

		const props = memoryGameExperienceMock.mock.calls.at(-1)?.[0] as {
			onGameSessionStart: () => Promise<void>;
			onSaveScoreHistory: (score: number) => Promise<void>;
			onSessionReset: () => void;
		};

		await act(async () => {
			await props.onGameSessionStart();
			props.onSessionReset();
			await props.onSaveScoreHistory(180);
		});

		expect(saveGameScoreHistory).toHaveBeenCalledWith(
			'memory-game',
			'anita',
			180,
			null,
		);
	});

	it('ignora retorno de sessão sem id ao salvar histórico', async () => {
		const saveGameScoreHistory = vi.fn().mockResolvedValue(undefined);
		const startGameSession = vi.fn().mockResolvedValue({ ok: true });
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			saveGameScoreHistory,
			startGameSession,
			playSound: vi.fn(),
		});

		render(<MemoryGame />);

		const props = memoryGameExperienceMock.mock.calls.at(-1)?.[0] as {
			onGameSessionStart: () => Promise<void>;
			onSaveScoreHistory: (score: number) => Promise<void>;
		};

		await act(async () => {
			await props.onGameSessionStart();
			await props.onSaveScoreHistory(210);
		});

		expect(saveGameScoreHistory).toHaveBeenCalledWith(
			'memory-game',
			'anita',
			210,
			null,
		);
	});

	it('não inicia sessão quando não houver usuário ou personagem', async () => {
		const startGameSession = vi
			.fn()
			.mockResolvedValue({ id: 'memory-session-1' });
		useCharacterMock.mockReturnValue({ selectedCharacter: undefined });
		useUserMock.mockReturnValue({ user: null });
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			saveGameScoreHistory: vi.fn().mockResolvedValue(undefined),
			startGameSession,
			playSound: vi.fn(),
		});

		render(<MemoryGame />);

		const props = memoryGameExperienceMock.mock.calls.at(-1)?.[0] as {
			onGameSessionStart: () => Promise<void>;
		};

		await act(async () => {
			await props.onGameSessionStart();
		});

		expect(startGameSession).not.toHaveBeenCalled();
	});

	it('usa cover fallback e não salva score sem usuário ou personagem', async () => {
		useCharacterMock.mockReturnValue({ selectedCharacter: undefined });
		useUserMock.mockReturnValue({ user: null });
		useGamesConfigMock.mockReturnValue({ data: undefined });
		useGameScoreMock.mockReturnValue({
			data: undefined,
			refetch: vi.fn(),
			isLoading: true,
		});
		useMemoryGameContentMock.mockReturnValue({
			data: undefined,
		});

		render(<MemoryGame characterSlug="zeca" />);

		const props = memoryGameExperienceMock.mock.calls.at(-1)?.[0] as {
			coverImage: string;
			bestScore: number;
			content: unknown[];
			isLoading: boolean;
			onSaveScoreHistory: (score: number) => Promise<void>;
			onSaveScore: (score: number) => Promise<void>;
		};

		expect(props.coverImage).toBe('/games/memory-game/cover/undefined.jpg');
		expect(props.bestScore).toBe(0);
		expect(props.content).toEqual([]);
		expect(props.isLoading).toBe(true);

		await act(async () => {
			await props.onSaveScoreHistory(90);
			await props.onSaveScore(90);
		});

		expect(
			useGamesMock.mock.results[0]?.value.saveGameScore,
		).not.toHaveBeenCalled();
		expect(
			useGamesMock.mock.results[0]?.value.saveGameScoreHistory,
		).not.toHaveBeenCalled();
	});

	it('dispara trackGameFinished quando a partida termina com personagem ativo', () => {
		render(<MemoryGame />);

		const props = memoryGameExperienceMock.mock.calls.at(-1)?.[0] as {
			onGameFinished: (payload: { score: number }) => void;
		};

		props.onGameFinished({ score: 180 });

		expect(trackGameFinishedMock).toHaveBeenCalledWith({
			game_slug: 'memory-game',
			character_slug: 'anita',
			score: 180,
			outcome: 'won',
		});
	});

	it('não dispara trackGameFinished sem personagem ativo', () => {
		useCharacterMock.mockReturnValue({
			selectedCharacter: undefined,
		});

		render(<MemoryGame />);

		const props = memoryGameExperienceMock.mock.calls.at(-1)?.[0] as {
			onGameFinished: (payload: { score: number }) => void;
		};

		props.onGameFinished({ score: 180 });

		expect(trackGameFinishedMock).not.toHaveBeenCalled();
	});

	it('submete NPS do jogo e marca como respondido', async () => {
		const submitGameNps = vi.fn().mockResolvedValue(undefined);
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			saveGameScoreHistory: vi.fn().mockResolvedValue(undefined),
			startGameSession: vi.fn().mockResolvedValue(null),
			playSound: vi.fn(),
			submitGameNps,
			getGameNps: vi.fn().mockResolvedValue(null),
		});

		render(<MemoryGame />);

		const props = memoryGameExperienceMock.mock.calls.at(-1)?.[0] as {
			npsEnabled: boolean;
			onSubmitGameNps: (
				gameSlug: string,
				characterSlug: string,
				rating: number,
				comment?: string,
			) => Promise<void>;
		};

		expect(props.npsEnabled).toBe(true);

		await act(async () => {
			await props.onSubmitGameNps('memory-game', 'anita', 4, 'Legal');
		});

		expect(submitGameNps).toHaveBeenCalledWith(
			'memory-game',
			'anita',
			4,
			'Legal',
		);
		expect(
			(
				memoryGameExperienceMock.mock.calls.at(-1)?.[0] as {
					npsEnabled: boolean;
				}
			).npsEnabled,
		).toBe(false);
	});
});
