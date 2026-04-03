import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GuessGame } from './GuessGame';

const useCharacterMock = vi.fn();
const useGuessGamePlayableContentMock = vi.fn();
const useGamesMock = vi.fn();
const useGameScoreMock = vi.fn();
const useUserMock = vi.fn();
const validateAttemptMock = vi.fn();
const finishGameMock = vi.fn();
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

vi.mock('@etnos/tools', () => ({
	guessGameContentService: {
		validateAttempt: (...args: unknown[]) => validateAttemptMock(...args),
	},
	useCharacter: (...args: unknown[]) => useCharacterMock(...args),
	useGuessGamePlayableContent: (...args: unknown[]) =>
		useGuessGamePlayableContentMock(...args),
	useGames: (...args: unknown[]) => useGamesMock(...args),
	useGameScore: (...args: unknown[]) => useGameScoreMock(...args),
}));

vi.mock('@etnos/ui', () => ({
	useUser: () => useUserMock(),
}));

vi.mock('antd', () => {
	const Button = ({
		children,
		onClick,
		disabled,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
		disabled?: boolean;
	}) => (
		<button onClick={onClick} disabled={disabled}>
			{children}
		</button>
	);

	const InputOtp = ({
		value,
		onChange,
		length,
		disabled,
		formatter,
	}: {
		value?: string;
		onChange?: (value: string) => void;
		length?: number;
		disabled?: boolean;
		formatter?: (value: string) => string;
	}) => (
		<input
			data-testid={`otp-${length ?? 0}`}
			value={value ?? ''}
			disabled={disabled}
			onChange={(event) =>
				onChange?.(
					formatter ? formatter(event.target.value) : event.target.value,
				)
			}
		/>
	);

	return {
		Button,
		Divider: () => <hr />,
		Input: { OTP: InputOtp },
		Spin: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
	};
});

vi.mock('next/image', () => ({
	default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
		<img {...props} />
	),
}));

vi.mock('../../components', () => ({
	FinishGame: (props: unknown) => {
		finishGameMock(props);
		return <div data-testid="finish-game" />;
	},
	ScoreHighlight: ({
		label,
		score,
	}: {
		label: string;
		score: React.ReactNode;
	}) => (
		<div>
			<span>{label}</span>
			<span>{score}</span>
		</div>
	),
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
			playSound: vi.fn(),
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

		expect(screen.getByText('Jogo Adivinhe a Palavra')).toBeTruthy();
		expect(screen.getByText('Recorde')).toBeTruthy();
		expect(screen.getByText('400')).toBeTruthy();
		expect(screen.getByRole('img').getAttribute('src')).toBe('/imagem.jpg');

		fireEvent.click(screen.getByText('Pedir uma dica'));

		expect(screen.getByText('Uso para beber chimarrão.')).toBeTruthy();
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
			playSound,
		});
		validateAttemptMock.mockResolvedValueOnce({
			isCorrect: false,
			isSolved: false,
			matchedIndexes: [],
			revealedCharacters: [],
		});

		renderWithQueryClient(<GuessGame />);

		const inputs = screen.getAllByRole('textbox');
		await act(async () => {
			fireEvent.change(inputs[1]!, { target: { value: 'x' } });
		});

		expect(validateAttemptMock).toHaveBeenCalledWith(
			{
				contentId: 'guess-1',
				guess: 'X',
				type: 'letter',
			},
			expect.any(Object),
		);
		expect(playSound).toHaveBeenCalledWith('error');
		expect(screen.getByText('9')).toBeTruthy();
	});

	it('ignora tentativa de letra vazia', async () => {
		renderWithQueryClient(<GuessGame />);

		const inputs = screen.getAllByRole('textbox');
		await act(async () => {
			fireEvent.change(inputs[1]!, { target: { value: '' } });
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

		const inputs = screen.getAllByRole('textbox');
		await act(async () => {
			fireEvent.change(inputs[1]!, { target: { value: 'x' } });
		});

		expect(validateAttemptMock).not.toHaveBeenCalled();
	});

	it('resolve a palavra por tentativa completa usando o backend', async () => {
		const playSound = vi.fn();
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			saveGameScoreHistory: vi.fn().mockResolvedValue(undefined),
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

		const inputs = screen.getAllByRole('textbox');
		await act(async () => {
			fireEvent.change(inputs[2]!, { target: { value: 'BOMBA' } });
			fireEvent.click(screen.getByText('VERIFICAR'));
		});

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

		const inputs = screen.getAllByRole('textbox');
		await act(async () => {
			fireEvent.change(inputs[1]!, { target: { value: 'b' } });
		});
		await act(async () => {
			fireEvent.change(inputs[1]!, { target: { value: 'o' } });
		});
		await act(async () => {
			fireEvent.change(inputs[2]!, { target: { value: 'BOLA' } });
			fireEvent.click(screen.getByText('VERIFICAR'));
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
			440,
		);
		expect(saveGameScore).toHaveBeenCalledWith('guess-game', 'anita', 440);
	});

	it('resolve a palavra ao completar as letras e busca descrição no backend', async () => {
		const playSound = vi.fn();
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			saveGameScoreHistory: vi.fn().mockResolvedValue(undefined),
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

		const inputs = screen.getAllByRole('textbox');

		await act(async () => {
			fireEvent.change(inputs[1]!, { target: { value: 'b' } });
		});
		await act(async () => {
			fireEvent.change(inputs[1]!, { target: { value: 'o' } });
		});
		await act(async () => {
			fireEvent.change(inputs[1]!, { target: { value: 'm' } });
		});
		await act(async () => {
			fireEvent.change(inputs[1]!, { target: { value: 'a' } });
		});

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

		const inputs = screen.getAllByRole('textbox');
		await act(async () => {
			fireEvent.change(inputs[1]!, { target: { value: 'b' } });
		});

		expect(screen.getAllByTestId('otp-5')[0]?.getAttribute('value')).toBe(
			'••••',
		);
	});

	it('trata palavra incorreta e encerra como derrota ao acabar tentativas', async () => {
		const playSound = vi.fn();
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			saveGameScoreHistory: vi.fn().mockResolvedValue(undefined),
			playSound,
		});
		validateAttemptMock.mockResolvedValue({
			isCorrect: false,
			isSolved: false,
			matchedIndexes: [],
			revealedCharacters: [],
		});

		renderWithQueryClient(<GuessGame />);

		const inputs = screen.getAllByRole('textbox');

		for (let index = 0; index < 11; index += 1) {
			await act(async () => {
				fireEvent.change(inputs[2]!, { target: { value: 'ERRO' } });
				fireEvent.click(screen.getByText('VERIFICAR'));
			});
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
			fireEvent.click(screen.getByText('VERIFICAR'));
		});

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

		const inputs = screen.getAllByRole('textbox');
		await act(async () => {
			fireEvent.change(inputs[2]!, { target: { value: 'BOMBA' } });
			fireEvent.click(screen.getByText('VERIFICAR'));
		});

		expect(screen.getByText('A palavra correta é:')).toBeTruthy();
		expect(
			screen
				.getByText('A palavra correta é:')
				.parentElement?.querySelector('span:last-child')?.textContent,
		).toBe('');
	});

	it('calcula bônus mínimo quando o conteúdo vier com tamanho zero', async () => {
		const saveGameScore = vi.fn().mockResolvedValue(undefined);
		const saveGameScoreHistory = vi.fn().mockResolvedValue(undefined);
		useGamesMock.mockReturnValue({
			saveGameScore,
			saveGameScoreHistory,
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

		const inputs = screen.getAllByRole('textbox');
		await act(async () => {
			fireEvent.change(inputs[2]!, { target: { value: 'BOMBA' } });
			fireEvent.click(screen.getByText('VERIFICAR'));
		});

		const props = finishGameMock.mock.calls.at(-1)?.[0] as {
			handleSaveScore: () => Promise<void>;
		};

		await act(async () => {
			await props.handleSaveScore();
		});

		expect(saveGameScoreHistory).toHaveBeenCalledWith('guess-game', 'anita', 0);
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

		expect(screen.queryByRole('img')).toBeNull();

		const inputs = screen.getAllByRole('textbox');
		await act(async () => {
			fireEvent.change(inputs[2]!, { target: { value: 'BOMBA' } });
			fireEvent.click(screen.getByText('VERIFICAR'));
		});

		expect(screen.queryByText('O que e isso?')).toBeNull();
	});

	it('toca erro quando não houver conteúdo para exibir dicas', () => {
		const playSound = vi.fn();
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			saveGameScoreHistory: vi.fn().mockResolvedValue(undefined),
			playSound,
		});
		useGuessGamePlayableContentMock.mockReturnValue({
			data: null,
			isLoading: false,
			refetch: vi.fn(),
		});

		renderWithQueryClient(<GuessGame />);

		fireEvent.click(screen.getByText('Pedir uma dica'));

		expect(playSound).toHaveBeenCalledWith('error');
	});

	it('passa callbacks do estado final para o FinishGame', async () => {
		const saveGameScore = vi.fn().mockResolvedValue(undefined);
		const saveGameScoreHistory = vi.fn().mockResolvedValue(undefined);
		const refetchScore = vi.fn();
		useGamesMock.mockReturnValue({
			saveGameScore,
			saveGameScoreHistory,
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

		const inputs = screen.getAllByRole('textbox');
		await act(async () => {
			fireEvent.change(inputs[2]!, { target: { value: 'BOMBA' } });
			fireEvent.click(screen.getByText('VERIFICAR'));
		});

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

		const inputs = screen.getAllByRole('textbox');
		await act(async () => {
			fireEvent.change(inputs[2]!, { target: { value: 'BOMBA' } });
			fireEvent.click(screen.getByText('VERIFICAR'));
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
			1000,
		);
		expect(saveGameScore).not.toHaveBeenCalled();
	});

	it('salva recorde usando zero como fallback quando ainda não existir score anterior', async () => {
		const saveGameScore = vi.fn().mockResolvedValue(undefined);
		const saveGameScoreHistory = vi.fn().mockResolvedValue(undefined);
		const refetchScore = vi.fn();
		useGamesMock.mockReturnValue({
			saveGameScore,
			saveGameScoreHistory,
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

		const inputs = screen.getAllByRole('textbox');
		await act(async () => {
			fireEvent.change(inputs[2]!, { target: { value: 'BOMBA' } });
			fireEvent.click(screen.getByText('VERIFICAR'));
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
			1000,
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

		const inputs = screen.getAllByRole('textbox');
		await act(async () => {
			fireEvent.change(inputs[2]!, { target: { value: 'BOMBA' } });
			fireEvent.click(screen.getByText('VERIFICAR'));
		});

		const props = finishGameMock.mock.calls.at(-1)?.[0] as {
			handleSaveScore: () => Promise<void>;
		};

		await act(async () => {
			await props.handleSaveScore();
		});

		expect(saveGameScore).not.toHaveBeenCalled();
		expect(saveGameScoreHistory).not.toHaveBeenCalled();
	});
});
