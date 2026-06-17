import { describe, expect, it, vi } from 'vitest';
import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GuessGame } from './GuessGame';

const useCharacterMock = vi.fn();
const useGuessGamePlayableContentMock = vi.fn();
const useGamesMock = vi.fn();
const useGameScoreMock = vi.fn();
const useUserMock = vi.fn();
const validateAttemptMock = vi.fn();
const finishGameMock = vi.fn();
const gameNpsModalMock = vi.fn();
const { trackGameFinishedMock } = vi.hoisted(() => ({
	trackGameFinishedMock: vi.fn(),
}));
const playableContent = {
	id: 'guess-1',
	title: 'Chimarrao',
	tips: ['Uso para beber chimarrão.', 'Tenho furinhos na ponta.'],
	imageUrl: '/imagem.jpg',
	characterSlug: 'anita',
	wordLength: 5,
};

const renderWithQueryClient = (ui: React.ReactNode) => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
			mutations: {
				retry: false,
			},
		},
	});

	return render(
		<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
	);
};

const submitLetter = async (letter: string) => {
	const input = screen.getByTestId('guess-game-letter-input');

	await act(async () => {
		fireEvent.change(input, { target: { value: letter } });
		fireEvent.click(screen.getByText('Tentar letra'));
	});
};

const pressWordSectionKey = async (key: string) => {
	const section = screen.getByTestId('guess-game-word-section');

	await act(async () => {
		section.focus();
		fireEvent.keyDown(section, { key });
	});
};

const submitWord = async (word: string) => {
	for (const char of word) {
		await pressWordSectionKey(char);
	}

	await act(async () => {
		fireEvent.click(screen.getByText('Chutar palavra'));
	});
};

const clickBackspaceButton = async () => {
	await act(async () => {
		fireEvent.click(screen.getByText('← Apagar'));
	});
};

const clickWordAttemptBox = async (index: number) => {
	await act(async () => {
		fireEvent.click(screen.getByTestId(`word-attempt-${index}`));
	});
};

vi.mock('@etnos/analytics/web', () => ({
	trackGameFinished: trackGameFinishedMock,
}));

vi.mock('@etnos/services', () => ({
	guessGameContentService: {
		validateAttempt: (...args: unknown[]) => validateAttemptMock(...args),
	},
}));

vi.mock('@etnos/tools', () => ({
	useCharacter: (...args: unknown[]) => useCharacterMock(...args),
	useGuessGamePlayableContent: (...args: unknown[]) =>
		useGuessGamePlayableContentMock(...args),
	useGames: (...args: unknown[]) => useGamesMock(...args),
	useGameScore: (...args: unknown[]) => useGameScoreMock(...args),
}));

vi.mock('@etnos/ui', () => ({
	useUser: () => useUserMock(),
}));

vi.mock('antd', () => ({
	Spin: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../components', () => ({
	FinishGame: (props: unknown) => {
		finishGameMock(props);
		return <div data-testid="finish-game" />;
	},
	GameNpsModal: (props: {
		onClose: () => void;
		onSubmit: (rating: number, comment?: string) => Promise<void>;
	}) => {
		gameNpsModalMock(props);
		return (
			<div data-testid="game-nps-modal">
				<button onClick={() => props.onClose()}>close nps</button>
				<button onClick={() => void props.onSubmit(5, 'Muito bom')}>
					submit nps
				</button>
			</div>
		);
	},
}));

describe('GuessGame', () => {
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
			submitGameNps: vi.fn().mockResolvedValue(undefined),
		});
		useGuessGamePlayableContentMock.mockReturnValue({
			data: playableContent,
			isLoading: false,
			refetch: vi.fn().mockResolvedValue({ data: playableContent }),
		});
		useGameScoreMock.mockReturnValue({
			data: { score: 400 },
			refetch: vi.fn(),
			isLoading: false,
		});
	});

	it('renderiza conteúdo inicial e revela dica', () => {
		renderWithQueryClient(<GuessGame />);

		expect(screen.getByText('Dicas')).toBeTruthy();
		expect(screen.getByRole('img').getAttribute('src')).toBe('/imagem.jpg');

		fireEvent.click(screen.getByText(/Pedir uma dica/));

		expect(screen.getByText('Uso para beber chimarrão.')).toBeTruthy();
	});

	it('usa singular na prévia quando a palavra tem uma letra', () => {
		useGuessGamePlayableContentMock.mockReturnValue({
			data: {
				...playableContent,
				wordLength: 1,
			},
			isLoading: false,
			refetch: vi.fn(),
		});

		renderWithQueryClient(<GuessGame />);

		expect(document.body.textContent).toMatch(/1\s+letra/);
	});

	it('usa alt padrão na imagem quando título e alt não forem informados', () => {
		useGuessGamePlayableContentMock.mockReturnValue({
			data: {
				...playableContent,
				title: undefined,
				imageUrl: '/sem-titulo.jpg',
			},
			isLoading: false,
			refetch: vi.fn(),
		});

		renderWithQueryClient(<GuessGame />);

		expect(screen.getByRole('img').getAttribute('alt')).toBe(
			'Ilustração do jogo',
		);
	});

	it('usa slug vazio quando nao houver prop nem personagem selecionado', () => {
		useCharacterMock.mockReturnValue({
			selectedCharacter: undefined,
		});
		useGameScoreMock.mockReturnValue({
			data: undefined,
			refetch: vi.fn(),
			isLoading: false,
		});

		renderWithQueryClient(<GuessGame />);

		expect(useGameScoreMock).toHaveBeenCalledWith('user-1', 'guess-game', '');
		expect(useGuessGamePlayableContentMock).toHaveBeenCalledWith('', 0);
	});

	it('trata letra incorreta', async () => {
		const playSound = vi.fn();
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			saveGameScoreHistory: vi.fn().mockResolvedValue(undefined),
			startGameSession: vi.fn().mockResolvedValue(null),
			playSound,
		});
		validateAttemptMock.mockResolvedValueOnce({
			isCorrect: false,
			isSolved: false,
			matchedIndexes: [],
			revealedCharacters: [],
		});

		renderWithQueryClient(<GuessGame />);

		await submitLetter('x');

		expect(validateAttemptMock).toHaveBeenCalledWith(
			{
				contentId: 'guess-1',
				guess: 'X',
				type: 'letter',
			},
			expect.any(Object),
		);
		expect(playSound).toHaveBeenCalledWith('error');
		expect(screen.getByText('Vidas restantes: 9')).toBeTruthy();
	});

	it('ignora tentativa de letra vazia', async () => {
		renderWithQueryClient(<GuessGame />);

		await act(async () => {
			fireEvent.click(screen.getByText('Tentar letra'));
		});

		expect(validateAttemptMock).not.toHaveBeenCalled();
	});

	it('ignora tentativa de letra quando o conteúdo ainda não carregou', async () => {
		useGuessGamePlayableContentMock.mockReturnValue({
			data: null,
			isLoading: false,
			refetch: vi.fn(),
		});

		renderWithQueryClient(<GuessGame />);

		await submitLetter('x');

		expect(validateAttemptMock).not.toHaveBeenCalled();
	});

	it('resolve a palavra por tentativa completa usando o backend', async () => {
		const playSound = vi.fn();
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			saveGameScoreHistory: vi.fn().mockResolvedValue(undefined),
			startGameSession: vi.fn().mockResolvedValue(null),
			playSound,
		});
		validateAttemptMock.mockResolvedValueOnce({
			isCorrect: true,
			isSolved: true,
			matchedIndexes: [],
			revealedCharacters: [],
			word: 'Bomba',
			description: 'Descricao final',
		});

		renderWithQueryClient(<GuessGame />);

		await submitWord('BOMBA');

		expect(validateAttemptMock).toHaveBeenCalledWith(
			{
				contentId: 'guess-1',
				guess: 'BOMBA',
				type: 'word',
			},
			expect.any(Object),
		);
		expect(playSound).toHaveBeenCalledWith('finish');
		expect(screen.getByText('A palavra correta é:')).toBeTruthy();
		expect(screen.getByText('Descricao final')).toBeTruthy();
	});

	it('aplica bonus intermediario quando parte da palavra ja foi revelada', async () => {
		const saveGameScore = vi.fn().mockResolvedValue(undefined);
		const saveGameScoreHistory = vi.fn().mockResolvedValue(undefined);
		useGamesMock.mockReturnValue({
			saveGameScore,
			saveGameScoreHistory,
			startGameSession: vi.fn().mockResolvedValue(null),
			playSound: vi.fn(),
		});
		useGuessGamePlayableContentMock.mockReturnValue({
			data: {
				...playableContent,
				wordLength: 4,
			},
			isLoading: false,
			refetch: vi.fn(),
		});
		validateAttemptMock
			.mockResolvedValueOnce({
				isCorrect: true,
				isSolved: false,
				matchedIndexes: [0],
				revealedCharacters: ['B'],
			})
			.mockResolvedValueOnce({
				isCorrect: true,
				isSolved: false,
				matchedIndexes: [1],
				revealedCharacters: ['o'],
			})
			.mockResolvedValueOnce({
				isCorrect: true,
				isSolved: true,
				matchedIndexes: [],
				revealedCharacters: [],
				word: 'Bola',
				description: 'Descricao final',
			});

		renderWithQueryClient(<GuessGame />);

		await submitLetter('b');
		await submitLetter('o');
		await submitWord('BOLA');

		const props = finishGameMock.mock.calls.at(-1)?.[0] as {
			handleSaveScore: () => Promise<void>;
		};

		await act(async () => {
			await props.handleSaveScore();
		});

		expect(saveGameScoreHistory).toHaveBeenCalledWith(
			'guess-game',
			'anita',
			440,
			null,
		);
		expect(saveGameScore).toHaveBeenCalledWith('guess-game', 'anita', 440);
	});

	it('resolve a palavra ao completar as letras e busca descrição no backend', async () => {
		const playSound = vi.fn();
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			saveGameScoreHistory: vi.fn().mockResolvedValue(undefined),
			startGameSession: vi.fn().mockResolvedValue(null),
			playSound,
		});
		validateAttemptMock
			.mockResolvedValueOnce({
				isCorrect: true,
				isSolved: false,
				matchedIndexes: [0],
				revealedCharacters: ['B'],
			})
			.mockResolvedValueOnce({
				isCorrect: true,
				isSolved: false,
				matchedIndexes: [1],
				revealedCharacters: ['o'],
			})
			.mockResolvedValueOnce({
				isCorrect: true,
				isSolved: false,
				matchedIndexes: [2, 3],
				revealedCharacters: ['m', 'b'],
			})
			.mockResolvedValueOnce({
				isCorrect: true,
				isSolved: false,
				matchedIndexes: [4],
				revealedCharacters: ['a'],
			})
			.mockResolvedValueOnce({
				isCorrect: true,
				isSolved: true,
				matchedIndexes: [],
				revealedCharacters: [],
				word: 'Bomba',
				description: 'Descricao final',
			});

		renderWithQueryClient(<GuessGame />);

		await submitLetter('b');
		await submitLetter('o');
		await submitLetter('m');
		await submitLetter('a');

		expect(validateAttemptMock).toHaveBeenLastCalledWith(
			{
				contentId: 'guess-1',
				guess: 'Bomba',
				type: 'word',
			},
			expect.any(Object),
		);
		expect(playSound).toHaveBeenCalledWith('finish');
		expect(screen.getByTestId('finish-game')).toBeTruthy();
	});

	it('tolera resposta parcial sem caractere revelado correspondente', async () => {
		validateAttemptMock.mockResolvedValueOnce({
			isCorrect: true,
			isSolved: false,
			matchedIndexes: [0],
			revealedCharacters: [],
		});

		renderWithQueryClient(<GuessGame />);

		await submitLetter('b');

		expect(screen.getByTestId('word-display-0').textContent).toBe('');
	});

	it('dispara trackGameFinished ao vencer a rodada', async () => {
		validateAttemptMock.mockResolvedValueOnce({
			isCorrect: true,
			isSolved: true,
			matchedIndexes: [],
			revealedCharacters: [],
			word: 'Bomba',
			description: 'Descricao final',
		});

		renderWithQueryClient(<GuessGame />);

		await submitWord('BOMBA');

		await waitFor(() => {
			expect(trackGameFinishedMock).toHaveBeenCalledWith(
				expect.objectContaining({
					game_slug: 'guess-game',
					character_slug: 'anita',
					outcome: 'won',
				}),
			);
		});
	});

	it('dispara trackGameFinished com outcome lost ao esgotar tentativas', async () => {
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			saveGameScoreHistory: vi.fn().mockResolvedValue(undefined),
			startGameSession: vi.fn().mockResolvedValue(null),
			playSound: vi.fn(),
		});
		validateAttemptMock.mockResolvedValue({
			isCorrect: false,
			isSolved: false,
			matchedIndexes: [],
			revealedCharacters: [],
		});

		renderWithQueryClient(<GuessGame />);

		for (let index = 0; index < 11; index += 1) {
			await submitWord('ERRAX');
		}

		await waitFor(() => {
			expect(trackGameFinishedMock).toHaveBeenCalledWith(
				expect.objectContaining({
					game_slug: 'guess-game',
					character_slug: 'anita',
					outcome: 'lost',
				}),
			);
		});
	});

	it('não dispara trackGameFinished sem personagem ativo', async () => {
		useCharacterMock.mockReturnValue({
			selectedCharacter: undefined,
		});
		validateAttemptMock.mockResolvedValueOnce({
			isCorrect: true,
			isSolved: true,
			matchedIndexes: [],
			revealedCharacters: [],
			word: 'Bomba',
			description: 'Descricao final',
		});

		renderWithQueryClient(<GuessGame />);

		await submitWord('BOMBA');

		expect(trackGameFinishedMock).not.toHaveBeenCalled();
	});

	it('trata palavra incorreta e encerra como derrota ao acabar tentativas', async () => {
		const playSound = vi.fn();
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			saveGameScoreHistory: vi.fn().mockResolvedValue(undefined),
			startGameSession: vi.fn().mockResolvedValue(null),
			playSound,
		});
		validateAttemptMock.mockResolvedValue({
			isCorrect: false,
			isSolved: false,
			matchedIndexes: [],
			revealedCharacters: [],
		});

		renderWithQueryClient(<GuessGame />);

		for (let index = 0; index < 11; index += 1) {
			await submitWord('ERRAX');
		}

		const props = finishGameMock.mock.calls.at(-1)?.[0] as {
			isLoser?: boolean;
		};

		expect(playSound).toHaveBeenCalledWith('error');
		expect(props.isLoser).toBe(true);
	});

	it('ignora verificação de palavra vazia', async () => {
		renderWithQueryClient(<GuessGame />);

		await act(async () => {
			fireEvent.click(screen.getByText('Chutar palavra'));
		});

		expect(validateAttemptMock).not.toHaveBeenCalled();
	});

	it('ignora chute de palavra quando o conteúdo não carregou', async () => {
		useGuessGamePlayableContentMock.mockReturnValue({
			data: null,
			isLoading: false,
			refetch: vi.fn(),
		});

		renderWithQueryClient(<GuessGame />);

		await act(async () => {
			fireEvent.click(screen.getByText('Chutar palavra'));
		});

		expect(validateAttemptMock).not.toHaveBeenCalled();
	});

	it('submete letra ao pressionar Enter no input', async () => {
		validateAttemptMock.mockResolvedValueOnce({
			isCorrect: false,
			isSolved: false,
			matchedIndexes: [],
			revealedCharacters: [],
		});

		renderWithQueryClient(<GuessGame />);

		const input = screen.getByTestId('guess-game-letter-input');

		await act(async () => {
			fireEvent.change(input, { target: { value: 'x' } });
			fireEvent.keyDown(input, { key: 'Enter' });
		});

		expect(validateAttemptMock).toHaveBeenCalledWith(
			{
				contentId: 'guess-1',
				guess: 'X',
				type: 'letter',
			},
			expect.any(Object),
		);
	});

	it('ignora Enter no input de letra vazio', async () => {
		renderWithQueryClient(<GuessGame />);

		const input = screen.getByTestId('guess-game-letter-input');

		await act(async () => {
			fireEvent.keyDown(input, { key: 'Enter' });
		});

		expect(validateAttemptMock).not.toHaveBeenCalled();
	});

	it('apaga a letra da caixa ativa com backspace no teclado', async () => {
		renderWithQueryClient(<GuessGame />);

		await pressWordSectionKey('B');
		await pressWordSectionKey('O');
		await clickWordAttemptBox(1);
		await pressWordSectionKey('Backspace');

		expect(screen.getByTestId('word-attempt-1').textContent).toBe('');
	});

	it('apaga a letra anterior quando a caixa ativa está vazia', async () => {
		renderWithQueryClient(<GuessGame />);

		await pressWordSectionKey('B');
		await pressWordSectionKey('Backspace');

		expect(screen.getByTestId('word-attempt-0').textContent).toBe('');
	});

	it('não altera tentativa ao apagar com todas as caixas vazias', async () => {
		renderWithQueryClient(<GuessGame />);

		await pressWordSectionKey('Backspace');

		expect(screen.getByTestId('word-attempt-0').textContent).toBe('');
	});

	it('apaga letra com o botão Apagar', async () => {
		renderWithQueryClient(<GuessGame />);

		await pressWordSectionKey('B');
		await clickBackspaceButton();

		expect(screen.getByTestId('word-attempt-0').textContent).toBe('');
	});

	it('seleciona caixa ao clicar na tentativa de palavra', async () => {
		renderWithQueryClient(<GuessGame />);

		await clickWordAttemptBox(2);

		expect(screen.getByTestId('word-attempt-2').className).toContain(
			'border-secondary',
		);
	});

	it('ignora teclas inválidas na seção de palavra', async () => {
		renderWithQueryClient(<GuessGame />);

		await pressWordSectionKey('1');

		expect(screen.getByTestId('word-attempt-0').textContent).toBe('');
	});

	it('ignora teclas diferentes de Enter no input de letra', async () => {
		renderWithQueryClient(<GuessGame />);

		const input = screen.getByTestId('guess-game-letter-input');

		await act(async () => {
			fireEvent.change(input, { target: { value: 'x' } });
			fireEvent.keyDown(input, { key: 'Tab' });
		});

		expect(validateAttemptMock).not.toHaveBeenCalled();
	});

	it('ignora digitação na seção de palavra quando wordLength é zero', async () => {
		useGuessGamePlayableContentMock.mockReturnValue({
			data: {
				...playableContent,
				wordLength: 0,
			},
			isLoading: false,
			refetch: vi.fn(),
		});

		renderWithQueryClient(<GuessGame />);

		await pressWordSectionKey('A');

		expect(screen.queryByTestId('word-attempt-0')).toBeNull();
		expect(validateAttemptMock).not.toHaveBeenCalled();
	});

	it('mantém a máscara atual quando o backend conclui sem retornar a palavra', async () => {
		validateAttemptMock.mockResolvedValueOnce({
			isCorrect: true,
			isSolved: true,
			matchedIndexes: [],
			revealedCharacters: [],
			description: 'Descricao final',
		});

		renderWithQueryClient(<GuessGame />);

		await submitWord('BOMBA');

		expect(screen.getByText('A palavra correta é:')).toBeTruthy();
		expect(
			screen.getByText('A palavra correta é:').nextElementSibling?.textContent,
		).toBe('');
	});

	it('calcula bônus mínimo quando o conteúdo vier com tamanho zero', async () => {
		const saveGameScore = vi.fn().mockResolvedValue(undefined);
		const saveGameScoreHistory = vi.fn().mockResolvedValue(undefined);
		useGamesMock.mockReturnValue({
			saveGameScore,
			saveGameScoreHistory,
			startGameSession: vi.fn().mockResolvedValue(null),
			playSound: vi.fn(),
		});
		useGuessGamePlayableContentMock.mockReturnValue({
			data: {
				...playableContent,
				wordLength: 0,
			},
			isLoading: false,
			refetch: vi.fn(),
		});
		validateAttemptMock.mockResolvedValueOnce({
			isCorrect: true,
			isSolved: true,
			matchedIndexes: [],
			revealedCharacters: [],
			word: 'Bomba',
			description: 'Descricao final',
		});

		renderWithQueryClient(<GuessGame />);

		await act(async () => {
			fireEvent.click(screen.getByText('Chutar palavra'));
		});

		const props = finishGameMock.mock.calls.at(-1)?.[0] as {
			handleSaveScore: () => Promise<void>;
		};

		await act(async () => {
			await props.handleSaveScore();
		});

		expect(saveGameScoreHistory).toHaveBeenCalledWith(
			'guess-game',
			'anita',
			0,
			null,
		);
		expect(saveGameScore).not.toHaveBeenCalled();
	});

	it('não exibe descrição quando o backend não retornar descrição', async () => {
		validateAttemptMock.mockResolvedValueOnce({
			isCorrect: true,
			isSolved: true,
			matchedIndexes: [],
			revealedCharacters: [],
			word: 'Bomba',
		});
		useGuessGamePlayableContentMock.mockReturnValue({
			data: { ...playableContent, imageUrl: null },
			isLoading: false,
			refetch: vi
				.fn()
				.mockResolvedValue({ data: { ...playableContent, imageUrl: null } }),
		});

		renderWithQueryClient(<GuessGame />);

		expect(screen.queryByRole('img', { name: 'Chimarrao' })).toBeNull();

		await submitWord('BOMBA');

		expect(screen.queryByText('O que é isso?')).toBeNull();
	});

	it('toca erro quando não houver conteúdo para exibir dicas', () => {
		const playSound = vi.fn();
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			saveGameScoreHistory: vi.fn().mockResolvedValue(undefined),
			startGameSession: vi.fn().mockResolvedValue(null),
			playSound,
		});
		useGuessGamePlayableContentMock.mockReturnValue({
			data: null,
			isLoading: false,
			refetch: vi.fn(),
		});

		renderWithQueryClient(<GuessGame />);

		fireEvent.click(screen.getByText(/Pedir uma dica/));

		expect(playSound).toHaveBeenCalledWith('error');
	});

	it('passa callbacks do estado final para o FinishGame', async () => {
		const saveGameScore = vi.fn().mockResolvedValue(undefined);
		const saveGameScoreHistory = vi.fn().mockResolvedValue(undefined);
		const refetchScore = vi.fn();
		useGamesMock.mockReturnValue({
			saveGameScore,
			saveGameScoreHistory,
			startGameSession: vi.fn().mockResolvedValue(null),
			playSound: vi.fn(),
		});
		useGameScoreMock.mockReturnValue({
			data: { score: 400 },
			refetch: refetchScore,
			isLoading: false,
		});
		useGuessGamePlayableContentMock.mockReturnValue({
			data: playableContent,
			isLoading: false,
			refetch: vi.fn().mockResolvedValue({ data: playableContent }),
		});
		validateAttemptMock.mockResolvedValueOnce({
			isCorrect: true,
			isSolved: true,
			matchedIndexes: [],
			revealedCharacters: [],
			word: 'Bomba',
			description: 'Descricao final',
		});

		renderWithQueryClient(<GuessGame />);

		await submitWord('BOMBA');

		const props = finishGameMock.mock.calls.at(-1)?.[0] as {
			handleRestart: () => Promise<void>;
			handleSaveScore: () => Promise<void>;
			isLoser?: boolean;
		};

		expect(props.isLoser).toBe(false);

		await act(async () => {
			await props.handleSaveScore();
		});

		await act(async () => {
			await props.handleRestart();
		});

		expect(saveGameScoreHistory).toHaveBeenCalledWith(
			'guess-game',
			'anita',
			1000,
			null,
		);
		expect(saveGameScore).toHaveBeenCalledWith('guess-game', 'anita', 1000);
		expect(refetchScore).toHaveBeenCalled();
		expect(useGuessGamePlayableContentMock).toHaveBeenLastCalledWith(
			'anita',
			1,
		);
	});

	it('não salva recorde quando a pontuação final for menor que o recorde atual', async () => {
		const saveGameScore = vi.fn().mockResolvedValue(undefined);
		const saveGameScoreHistory = vi.fn().mockResolvedValue(undefined);
		useGamesMock.mockReturnValue({
			saveGameScore,
			saveGameScoreHistory,
			startGameSession: vi.fn().mockResolvedValue(null),
			playSound: vi.fn(),
		});
		useGameScoreMock.mockReturnValue({
			data: { score: 1200 },
			refetch: vi.fn(),
			isLoading: false,
		});
		validateAttemptMock.mockResolvedValueOnce({
			isCorrect: true,
			isSolved: true,
			matchedIndexes: [],
			revealedCharacters: [],
			word: 'Bomba',
			description: 'Descricao final',
		});

		renderWithQueryClient(<GuessGame />);

		await submitWord('BOMBA');

		const props = finishGameMock.mock.calls.at(-1)?.[0] as {
			handleSaveScore: () => Promise<void>;
		};

		await act(async () => {
			await props.handleSaveScore();
		});

		expect(saveGameScoreHistory).toHaveBeenCalledWith(
			'guess-game',
			'anita',
			1000,
			null,
		);
		expect(saveGameScore).not.toHaveBeenCalled();
	});

	it('usa o id da sessão iniciada ao salvar histórico', async () => {
		const saveGameScore = vi.fn().mockResolvedValue(undefined);
		const saveGameScoreHistory = vi.fn().mockResolvedValue(undefined);
		const startGameSession = vi
			.fn()
			.mockResolvedValue({ id: 'guess-session-1' });
		useGamesMock.mockReturnValue({
			saveGameScore,
			saveGameScoreHistory,
			startGameSession,
			playSound: vi.fn(),
		});
		validateAttemptMock.mockResolvedValueOnce({
			isCorrect: true,
			isSolved: true,
			matchedIndexes: [],
			revealedCharacters: [],
			word: 'Bomba',
			description: 'Descricao final',
		});

		renderWithQueryClient(<GuessGame />);

		await waitFor(() =>
			expect(startGameSession).toHaveBeenCalledWith('guess-game', 'anita'),
		);

		await submitWord('BOMBA');

		await waitFor(() =>
			expect(saveGameScoreHistory).toHaveBeenCalledWith(
				'guess-game',
				'anita',
				1000,
				'guess-session-1',
			),
		);
		expect(saveGameScore).toHaveBeenCalledWith('guess-game', 'anita', 1000);
	});

	it('salva recorde usando zero como fallback quando ainda não existir score anterior', async () => {
		const saveGameScore = vi.fn().mockResolvedValue(undefined);
		const saveGameScoreHistory = vi.fn().mockResolvedValue(undefined);
		const refetchScore = vi.fn();
		useGamesMock.mockReturnValue({
			saveGameScore,
			saveGameScoreHistory,
			startGameSession: vi.fn().mockResolvedValue(null),
			playSound: vi.fn(),
		});
		useGameScoreMock.mockReturnValue({
			data: undefined,
			refetch: refetchScore,
			isLoading: false,
		});
		validateAttemptMock.mockResolvedValueOnce({
			isCorrect: true,
			isSolved: true,
			matchedIndexes: [],
			revealedCharacters: [],
			word: 'Bomba',
			description: 'Descricao final',
		});

		renderWithQueryClient(<GuessGame />);

		await submitWord('BOMBA');

		const props = finishGameMock.mock.calls.at(-1)?.[0] as {
			handleSaveScore: () => Promise<void>;
		};

		await act(async () => {
			await props.handleSaveScore();
		});

		expect(saveGameScoreHistory).toHaveBeenCalledWith(
			'guess-game',
			'anita',
			1000,
			null,
		);
		expect(saveGameScore).toHaveBeenCalledWith('guess-game', 'anita', 1000);
		expect(refetchScore).toHaveBeenCalled();
	});

	it('nao salva score nem histórico quando nao houver usuario', async () => {
		const saveGameScore = vi.fn().mockResolvedValue(undefined);
		const saveGameScoreHistory = vi.fn().mockResolvedValue(undefined);
		useUserMock.mockReturnValue({
			user: null,
		});
		useGamesMock.mockReturnValue({
			saveGameScore,
			saveGameScoreHistory,
			startGameSession: vi.fn().mockResolvedValue(null),
			playSound: vi.fn(),
		});
		validateAttemptMock.mockResolvedValueOnce({
			isCorrect: true,
			isSolved: true,
			matchedIndexes: [],
			revealedCharacters: [],
			word: 'Bomba',
			description: 'Descricao final',
		});

		renderWithQueryClient(<GuessGame characterSlug="anita" />);

		await submitWord('BOMBA');

		const props = finishGameMock.mock.calls.at(-1)?.[0] as {
			handleSaveScore: () => Promise<void>;
		};

		await act(async () => {
			await props.handleSaveScore();
		});

		expect(saveGameScore).not.toHaveBeenCalled();
		expect(saveGameScoreHistory).not.toHaveBeenCalled();
	});

	it('submete NPS do jogo e desabilita novas respostas', async () => {
		const submitGameNps = vi.fn().mockResolvedValue(undefined);
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			saveGameScoreHistory: vi.fn().mockResolvedValue(undefined),
			startGameSession: vi.fn().mockResolvedValue(null),
			playSound: vi.fn(),
			submitGameNps,
			getGameNps: vi.fn().mockResolvedValue(null),
		});
		validateAttemptMock.mockResolvedValueOnce({
			isCorrect: true,
			isSolved: true,
			matchedIndexes: [],
			revealedCharacters: [],
			word: 'Bomba',
			description: 'Descricao final',
		});

		renderWithQueryClient(<GuessGame />);

		await submitWord('BOMBA');

		fireEvent.click(screen.getByText('close nps'));

		await act(async () => {
			fireEvent.click(screen.getByText('submit nps'));
		});

		expect(submitGameNps).toHaveBeenCalledWith(
			'guess-game',
			'anita',
			5,
			'Muito bom',
		);
		expect(gameNpsModalMock).toHaveBeenCalled();
	});
});
