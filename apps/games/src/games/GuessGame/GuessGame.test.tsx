import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { GuessGame } from './GuessGame';

const getRandomIndexMock = vi.fn();
const useCharacterMock = vi.fn();
const useGamesMock = vi.fn();
const useGameScoreMock = vi.fn();
const useUserMock = vi.fn();
const finishGameMock = vi.fn();

vi.mock('@etnos/tools', () => ({
	getRandomIndex: (...args: unknown[]) => getRandomIndexMock(...args),
	useCharacter: (...args: unknown[]) => useCharacterMock(...args),
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
				onChange?.(formatter ? formatter(event.target.value) : event.target.value)
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
		return <div data-testid='finish-game' />;
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
		getRandomIndexMock.mockReturnValue(0);
		useCharacterMock.mockReturnValue({
			selectedCharacter: { slug: 'anita', name: 'Anita' },
		});
		useUserMock.mockReturnValue({
			user: { uid: 'user-1' },
		});
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			playSound: vi.fn(),
		});
		useGameScoreMock.mockReturnValue({
			data: { score: 400 },
			refetch: vi.fn(),
			isLoading: false,
		});
	});

	it('renderiza conteúdo inicial e revela dica', () => {
		render(<GuessGame />);

		expect(screen.getByText('Jogo Adivinhe a Palavra')).toBeTruthy();
		expect(screen.getByText('Recorde')).toBeTruthy();
		expect(screen.getByText('400')).toBeTruthy();

		fireEvent.click(screen.getByText('Pedir uma dica'));

		expect(screen.getByText('Uso para beber chimarrão.')).toBeTruthy();
	});

	it('mantem recorde zerado e toca erro quando nao ha mais dicas', () => {
		const playSound = vi.fn();
		useCharacterMock.mockReturnValue({
			selectedCharacter: { slug: 'personagem-inexistente', name: 'Sem Conteudo' },
		});
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			playSound,
		});
		useGameScoreMock.mockReturnValue({
			data: undefined,
			refetch: vi.fn(),
			isLoading: false,
		});

		render(<GuessGame />);

		expect(screen.getAllByText('0').length).toBeGreaterThan(0);

		fireEvent.click(screen.getByText('Pedir uma dica'));

		expect(playSound).toHaveBeenCalledWith('error');
		expect(screen.queryByRole('img')).toBeNull();
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

		render(<GuessGame />);

		expect(useGameScoreMock).toHaveBeenCalledWith('user-1', 'guess-game', '');
	});

	it('trata letra incorreta e palavra correta finalizando o jogo', () => {
		const playSound = vi.fn();
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			playSound,
		});

		render(<GuessGame />);

		const inputs = screen.getAllByRole('textbox');

		fireEvent.change(inputs[1]!, { target: { value: 'x' } });
		expect(playSound).toHaveBeenCalledWith('error');

		fireEvent.change(inputs[2]!, { target: { value: 'Bomba' } });
		fireEvent.click(screen.getByText('VERIFICAR'));

		expect(playSound).toHaveBeenCalledWith('finish');
		expect(screen.getByText('A palavra correta é:')).toBeTruthy();
		expect(screen.getByTestId('finish-game')).toBeTruthy();
	});

	it('finaliza ao descobrir a ultima letra pelo campo de letra', () => {
		const playSound = vi.fn();
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			playSound,
		});

		render(<GuessGame />);

		const inputs = screen.getAllByRole('textbox');
		fireEvent.change(inputs[1]!, { target: { value: 'b' } });
		fireEvent.change(inputs[1]!, { target: { value: 'o' } });
		fireEvent.change(inputs[1]!, { target: { value: 'm' } });
		fireEvent.change(inputs[1]!, { target: { value: 'a' } });

		expect(playSound).toHaveBeenCalledWith('finish');
		expect(screen.getByTestId('finish-game')).toBeTruthy();
	});

	it('aplica bonus de 30 ao acertar a palavra com pelo menos metade revelada', () => {
		const playSound = vi.fn();
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			playSound,
		});

		render(<GuessGame />);

		const inputs = screen.getAllByRole('textbox');

		fireEvent.change(inputs[1]!, { target: { value: 'b' } });
		fireEvent.change(inputs[1]!, { target: { value: 'o' } });
		fireEvent.change(inputs[2]!, { target: { value: 'bomba' } });
		fireEvent.click(screen.getByText('VERIFICAR'));

		expect(playSound).toHaveBeenCalledWith('flip');
		expect(playSound).toHaveBeenCalledWith('finish');
		expect(screen.getByText('A palavra correta é:')).toBeTruthy();
		expect(screen.getByText('50')).toBeTruthy();
	});

	it('aplica bonus de 50 ao acertar a palavra com 80 por cento ou mais revelado', () => {
		const playSound = vi.fn();
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			playSound,
		});

		render(<GuessGame />);

		const inputs = screen.getAllByRole('textbox');

		fireEvent.change(inputs[1]!, { target: { value: 'b' } });
		fireEvent.change(inputs[1]!, { target: { value: 'o' } });
		fireEvent.change(inputs[1]!, { target: { value: 'm' } });
		fireEvent.change(inputs[2]!, { target: { value: 'bomba' } });
		fireEvent.click(screen.getByText('VERIFICAR'));

		expect(playSound).toHaveBeenCalledWith('finish');
		expect(screen.getByText('80')).toBeTruthy();
	});

	it('marca derrota depois de exceder as tentativas', () => {
		const playSound = vi.fn();
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			playSound,
		});

		render(<GuessGame />);

		const inputs = screen.getAllByRole('textbox');

		for (let index = 0; index < 11; index += 1) {
			fireEvent.change(inputs[1]!, { target: { value: 'x' } });
		}

		expect(playSound).toHaveBeenCalledWith('error');
		expect(screen.getByTestId('finish-game')).toBeTruthy();

		const props = finishGameMock.mock.calls.at(-1)?.[0] as {
			isLoser?: boolean;
		};
		expect(props.isLoser).toBe(true);
	});

	it('trata tentativa de palavra incorreta com erro', () => {
		const playSound = vi.fn();
		useGamesMock.mockReturnValue({
			saveGameScore: vi.fn().mockResolvedValue(undefined),
			playSound,
		});

		render(<GuessGame />);

		const inputs = screen.getAllByRole('textbox');
		fireEvent.change(inputs[2]!, { target: { value: 'errado' } });
		fireEvent.click(screen.getByText('VERIFICAR'));

		expect(playSound).toHaveBeenCalledWith('error');
		expect(screen.getByText('9')).toBeTruthy();
	});

	it('passa callbacks do estado final para o FinishGame', async () => {
		const saveGameScore = vi.fn().mockResolvedValue(undefined);
		const refetch = vi.fn();
		useGamesMock.mockReturnValue({
			saveGameScore,
			playSound: vi.fn(),
		});
		useGameScoreMock.mockReturnValue({
			data: { score: 400 },
			refetch,
			isLoading: false,
		});

		render(<GuessGame />);

		const inputs = screen.getAllByRole('textbox');
		fireEvent.change(inputs[2]!, { target: { value: 'Bomba' } });
		fireEvent.click(screen.getByText('VERIFICAR'));

		const props = finishGameMock.mock.calls.at(-1)?.[0] as {
			handleRestart: () => void;
			handleSaveScore: () => Promise<void>;
			isLoser?: boolean;
		};

		expect(props).toBeTruthy();
		expect(props.isLoser).toBe(false);
		await act(async () => {
			await props.handleSaveScore();
		});

		act(() => {
			props.handleRestart();
		});

		expect(saveGameScore).toHaveBeenCalledWith('guess-game', 'anita', 10);
		expect(refetch).toHaveBeenCalled();
	});

	it('nao salva score quando nao houver usuario ou personagem selecionado', async () => {
		const saveGameScore = vi.fn().mockResolvedValue(undefined);
		useCharacterMock.mockReturnValue({
			selectedCharacter: { slug: 'anita', name: 'Anita' },
		});
		useUserMock.mockReturnValue({
			user: null,
		});
		useGamesMock.mockReturnValue({
			saveGameScore,
			playSound: vi.fn(),
		});

		render(<GuessGame characterSlug='anita' />);

		const inputs = screen.getAllByRole('textbox');
		fireEvent.change(inputs[2]!, { target: { value: 'bomba' } });
		fireEvent.click(screen.getByText('VERIFICAR'));

		const props = finishGameMock.mock.calls.at(-1)?.[0] as {
			handleSaveScore: () => Promise<void>;
		};

		await act(async () => {
			await props.handleSaveScore();
		});

		expect(saveGameScore).not.toHaveBeenCalled();
	});

	it('nao inicializa conteúdo quando o índice sorteado nao existir', () => {
		getRandomIndexMock.mockReturnValue(999);

		render(<GuessGame />);

		expect(screen.queryByRole('img')).toBeNull();
		expect(screen.getAllByTestId('otp-0')[0]?.getAttribute('value')).toBe('');
	});
});
