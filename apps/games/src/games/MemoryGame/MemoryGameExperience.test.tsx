import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryGameExperience } from './MemoryGameExperience';

const useMemoryGameMock = vi.fn();

vi.mock('./useMemoryGame', () => ({
	useMemoryGame: (...args: unknown[]) => useMemoryGameMock(...args),
}));

vi.mock('antd', () => ({
	Spin: ({ children }: { children: React.ReactNode }) => (
		<div data-testid='spin'>{children}</div>
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
				content={[{ name: 'chimarrao', image: '/a.jpg' }]}
				bestScore={180}
				coverImage='/cover.jpg'
				selectedCharacter={{ name: 'Anita' } as any}
			/>
		);

		expect(screen.getByText('Pontuação')).toBeTruthy();
		expect(screen.getAllByAltText('Anita')[0]?.getAttribute('src')).toBe(
			'/cover.jpg'
		);
		expect(screen.getAllByAltText('chimarrao')[0]?.getAttribute('src')).toBe(
			'/a.jpg'
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

		render(<MemoryGameExperience content={[{ name: 'chimarrao', image: '/a.jpg' }]} />);

		expect(screen.getByAltText('Carta virada').getAttribute('src')).toBeNull();
	});

	it('renderiza estado final e aciona restart/save', async () => {
		const initializeGame = vi.fn();
		const onSaveScore = vi.fn().mockResolvedValue(undefined);
		useMemoryGameMock.mockReturnValue({
			cards: [],
			handleCardClick: vi.fn(),
			initializeGame,
			isFinished: true,
			matchedPairs: 2,
			moves: 4,
			score: 120,
			totalPairs: 2,
		});

		render(
			<MemoryGameExperience
				content={[]}
				onSaveScore={onSaveScore}
				selectedCharacter={{ name: 'Anita' } as any}
			/>
		);

		fireEvent.click(screen.getByText('restart'));
		fireEvent.click(screen.getByText('save'));

		expect(initializeGame).toHaveBeenCalledTimes(1);
		expect(onSaveScore).toHaveBeenCalledWith(120);
	});
});
