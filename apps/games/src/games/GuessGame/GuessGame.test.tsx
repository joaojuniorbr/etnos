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
	}: {
		value?: string;
		onChange?: (value: string) => void;
		length?: number;
		disabled?: boolean;
	}) => (
		<input
			data-testid={`otp-${length ?? 0}`}
			value={value ?? ''}
			disabled={disabled}
			onChange={(event) => onChange?.(event.target.value)}
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
});
