import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryGameExperience } from './MemoryGameExperience';

const useMemoryGameMock = vi.fn();

vi.mock('./useMemoryGame', () => ({
	useMemoryGame: (...args: unknown[]) => useMemoryGameMock(...args),
}));

vi.mock('antd', () => ({
	Spin: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="spin">{children}</div>
	),
}));

vi.mock('next/image', () => ({
	default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
		<img {...props} />
	),
}));

vi.mock('../../components', () => ({
	FinishGame: ({
		handleRestart,
		handleSaveScore,
		isLoser,
	}: {
		handleRestart: () => void;
		handleSaveScore: () => void;
		isLoser?: boolean;
	}) => (
		<div>
			<span>{isLoser ? 'Perdeu' : 'Finalizou'}</span>
			<button onClick={handleRestart}>restart</button>
			<button onClick={handleSaveScore}>save</button>
		</div>
	),
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

describe('MemoryGameExperience', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('renderiza cartas e encaminha clique para o hook', () => {
		const handleCardClick = vi.fn();
		useMemoryGameMock.mockReturnValue({
			cards: [
				{
					id: 1,
					name: 'chimarrao',
					image: '/a.jpg',
					isFlipped: false,
					isMatched: false,
				},
				{
					id: 2,
					name: 'chimarrao',
					image: '/a.jpg',
					isFlipped: true,
					isMatched: false,
				},
			],
			handleCardClick,
			initializeGame: vi.fn(),
			isFinished: false,
			matchedPairs: 0,
			moves: 1,
			score: 50,
			totalPairs: 1,
		});

		render(
			<MemoryGameExperience
				content={[
					{ name: 'chimarrao', image: '/a.jpg' },
					{ name: 'churrasco', image: '/b.jpg' },
					{ name: 'cafe', image: '/c.jpg' },
				]}
				bestScore={180}
				coverImage="/cover.jpg"
				selectedCharacter={{ name: 'Anita' } as any}
			/>,
		);

		fireEvent.click(screen.getByText('Nível 1'));

		expect(screen.getByText('Pontuação')).toBeTruthy();
		expect(screen.getAllByAltText('Anita')[0]?.getAttribute('src')).toBe(
			'/cover.jpg',
		);
		expect(screen.getAllByAltText('chimarrao')[0]?.getAttribute('src')).toBe(
			'/a.jpg',
		);

		fireEvent.click(screen.getAllByRole('button')[0]!);
		expect(handleCardClick).toHaveBeenCalledWith(1);
	});

	it('usa fallback de capa e alt quando coverImage ou personagem nao forem informados', () => {
		useMemoryGameMock.mockReturnValue({
			cards: [
				{
					id: 1,
					name: 'chimarrao',
					image: '/a.jpg',
					isFlipped: false,
					isMatched: true,
				},
			],
			handleCardClick: vi.fn(),
			initializeGame: vi.fn(),
			isFinished: false,
			matchedPairs: 1,
			moves: 1,
			score: 50,
			totalPairs: 1,
		});

		render(
			<MemoryGameExperience
				content={[
					{ name: 'chimarrao', image: '/a.jpg' },
					{ name: 'churrasco', image: '/b.jpg' },
					{ name: 'cafe', image: '/c.jpg' },
				]}
			/>,
		);

		fireEvent.click(screen.getByText('Nível 1'));

		expect(screen.getByAltText('Carta virada').getAttribute('src')).toBeNull();
	});

	it('renderiza estado final e aciona restart/save', async () => {
		const onSaveScoreHistory = vi.fn().mockResolvedValue(undefined);
		const onSaveScore = vi.fn().mockResolvedValue(undefined);
		useMemoryGameMock.mockReturnValue({
			cards: [],
			handleCardClick: vi.fn(),
			initializeGame: vi.fn(),
			isFinished: true,
			matchedPairs: 2,
			moves: 4,
			score: 120,
			totalPairs: 2,
		});

		render(
			<MemoryGameExperience
				content={[
					{ name: 'chimarrao', image: '/a.jpg' },
					{ name: 'churrasco', image: '/b.jpg' },
					{ name: 'cafe', image: '/c.jpg' },
				]}
				onSaveScoreHistory={onSaveScoreHistory}
				onSaveScore={onSaveScore}
				selectedCharacter={{ name: 'Anita' } as any}
			/>,
		);

		fireEvent.click(screen.getByText('Nível 1'));

		await waitFor(() => {
			expect(onSaveScoreHistory).toHaveBeenCalledWith(120);
		});

		fireEvent.click(screen.getByText('save'));
		fireEvent.click(screen.getByText('restart'));

		expect(
			screen.getByText('Escolha o nível para começar'),
		).toBeTruthy();
		expect(onSaveScoreHistory).toHaveBeenCalledTimes(1);
		expect(onSaveScore).toHaveBeenCalledTimes(2);
	});

	it('salva automaticamente só uma vez por finalização enquanto o score não muda', async () => {
		const onSaveScoreHistory = vi.fn().mockResolvedValue(undefined);
		const nextOnSaveScoreHistory = vi.fn().mockResolvedValue(undefined);
		useMemoryGameMock.mockReturnValue({
			cards: [],
			handleCardClick: vi.fn(),
			initializeGame: vi.fn(),
			isFinished: true,
			matchedPairs: 2,
			moves: 4,
			score: 120,
			totalPairs: 2,
		});

		const { rerender } = render(
			<MemoryGameExperience
				content={[
					{ name: 'chimarrao', image: '/a.jpg' },
					{ name: 'churrasco', image: '/b.jpg' },
					{ name: 'cafe', image: '/c.jpg' },
				]}
				onSaveScoreHistory={onSaveScoreHistory}
			/>,
		);

		fireEvent.click(screen.getByText('Nível 1'));

		await waitFor(() => {
			expect(onSaveScoreHistory).toHaveBeenCalledTimes(1);
		});

		rerender(
			<MemoryGameExperience
				content={[
					{ name: 'chimarrao', image: '/a.jpg' },
					{ name: 'churrasco', image: '/b.jpg' },
					{ name: 'cafe', image: '/c.jpg' },
				]}
				onSaveScoreHistory={nextOnSaveScoreHistory}
			/>,
		);

		expect(onSaveScoreHistory).toHaveBeenCalledTimes(1);
		expect(nextOnSaveScoreHistory).not.toHaveBeenCalled();
	});

	it('exibe botoes de nivel antes de iniciar o jogo', () => {
		useMemoryGameMock.mockReturnValue({
			cards: [],
			handleCardClick: vi.fn(),
			initializeGame: vi.fn(),
			isFinished: false,
			matchedPairs: 0,
			moves: 0,
			score: 0,
			totalPairs: 0,
		});

		render(
			<MemoryGameExperience
				content={[
					{ name: 'chimarrao', image: '/a.jpg' },
					{ name: 'churrasco', image: '/b.jpg' },
					{ name: 'cafe', image: '/c.jpg' },
					{ name: 'bolo', image: '/d.jpg' },
					{ name: 'erva', image: '/e.jpg' },
					{ name: 'tambor', image: '/f.jpg' },
				]}
			/>,
		);

		expect(screen.getByText('Escolha o nível para começar')).toBeTruthy();
		expect(screen.getByText('Nível 1')).toBeTruthy();
		expect(screen.getByText('Nível 2')).toBeTruthy();
		expect(screen.queryByText('Nível 3')).toBeNull();
	});

	it('limpa o nível selecionado quando o conteúdo deixa de ter níveis disponíveis', () => {
		useMemoryGameMock.mockReturnValue({
			cards: [],
			handleCardClick: vi.fn(),
			initializeGame: vi.fn(),
			isFinished: false,
			matchedPairs: 0,
			moves: 0,
			score: 0,
			totalPairs: 0,
		});

		const { rerender } = render(
			<MemoryGameExperience
				content={[
					{ name: 'chimarrao', image: '/a.jpg' },
					{ name: 'churrasco', image: '/b.jpg' },
					{ name: 'cafe', image: '/c.jpg' },
				]}
			/>,
		);

		fireEvent.click(screen.getByText('Nível 1'));
		expect(screen.queryByText('Escolha o nível para começar')).toBeNull();

		rerender(<MemoryGameExperience content={[]} />);

		expect(screen.queryByText('Escolha o nível para começar')).toBeNull();
		expect(screen.queryByText('Finalizou')).toBeNull();
		expect(screen.queryByText('restart')).toBeNull();
	});

	it('volta para a seleção quando o nível atual deixa de existir após rerender', () => {
		useMemoryGameMock.mockReturnValue({
			cards: [],
			handleCardClick: vi.fn(),
			initializeGame: vi.fn(),
			isFinished: false,
			matchedPairs: 0,
			moves: 0,
			score: 0,
			totalPairs: 0,
		});

		const { rerender } = render(
			<MemoryGameExperience
				content={[
					{ name: 'chimarrao', image: '/a.jpg' },
					{ name: 'churrasco', image: '/b.jpg' },
					{ name: 'cafe', image: '/c.jpg' },
					{ name: 'bolo', image: '/d.jpg' },
					{ name: 'erva', image: '/e.jpg' },
					{ name: 'tambor', image: '/f.jpg' },
				]}
			/>,
		);

		fireEvent.click(screen.getByText('Nível 2'));
		expect(screen.queryByText('Escolha o nível para começar')).toBeNull();

		rerender(
			<MemoryGameExperience
				content={[
					{ name: 'chimarrao', image: '/a.jpg' },
					{ name: 'churrasco', image: '/b.jpg' },
					{ name: 'cafe', image: '/c.jpg' },
				]}
			/>,
		);

		expect(screen.getByText('Escolha o nível para começar')).toBeTruthy();
		expect(screen.getByText('Nível 1')).toBeTruthy();
		expect(screen.queryByText('Nível 2')).toBeNull();
	});

	it('mantém o nível selecionado quando ele continua disponível após rerender', () => {
		useMemoryGameMock.mockReturnValue({
			cards: [],
			handleCardClick: vi.fn(),
			initializeGame: vi.fn(),
			isFinished: false,
			matchedPairs: 0,
			moves: 0,
			score: 0,
			totalPairs: 0,
		});

		const { rerender } = render(
			<MemoryGameExperience
				content={[
					{ name: 'chimarrao', image: '/a.jpg' },
					{ name: 'churrasco', image: '/b.jpg' },
					{ name: 'cafe', image: '/c.jpg' },
				]}
			/>,
		);

		fireEvent.click(screen.getByText('Nível 1'));
		expect(screen.queryByText('Escolha o nível para começar')).toBeNull();

		rerender(
			<MemoryGameExperience
				content={[
					{ name: 'chimarrao', image: '/a.jpg' },
					{ name: 'churrasco', image: '/b.jpg' },
					{ name: 'cafe', image: '/c.jpg' },
					{ name: 'bolo', image: '/d.jpg' },
				]}
			/>,
		);

		expect(screen.queryByText('Escolha o nível para começar')).toBeNull();
		expect(screen.getByText('Pontuação')).toBeTruthy();
	});
});
