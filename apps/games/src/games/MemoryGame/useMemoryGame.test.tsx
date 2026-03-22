import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useMemoryGame } from './useMemoryGame';
import { vi } from 'vitest';

type HarnessProps = {
	content: { name: string; image: string }[];
	matchDelayMs?: number;
	onPlaySound?: (sound: 'flip' | 'success' | 'error' | 'finish') => void;
};

const Harness = ({ content, matchDelayMs, onPlaySound }: HarnessProps) => {
	const {
		cards,
		handleCardClick,
		initializeGame,
		isFinished,
		matchedPairs,
		moves,
		score,
		totalPairs,
	} = useMemoryGame({
		content,
		matchDelayMs,
		onPlaySound,
	});

	return (
		<div>
			<div data-testid='score'>{score}</div>
			<div data-testid='moves'>{moves}</div>
			<div data-testid='matchedPairs'>{matchedPairs}</div>
			<div data-testid='totalPairs'>{totalPairs}</div>
			<div data-testid='isFinished'>{String(isFinished)}</div>
			<div data-testid='cards-count'>{cards.length}</div>
			<button onClick={initializeGame}>restart</button>
			{cards.map((card) => (
				<button
					key={card.id}
					data-testid={`card-${card.id}`}
					data-name={card.name}
					data-flipped={String(card.isFlipped)}
					onClick={() => handleCardClick(card.id)}
				>
					{card.name}
				</button>
			))}
		</div>
	);
};

describe('useMemoryGame', () => {
	beforeEach(() => {
		vi.useRealTimers();
	});

	it('inicializa vazio quando não há conteúdo', () => {
		render(<Harness content={[]} />);

		expect(screen.getByTestId('cards-count').textContent).toBe('0');
		expect(screen.getByTestId('score').textContent).toBe('0');
		expect(screen.getByTestId('moves').textContent).toBe('0');
		expect(screen.getByTestId('totalPairs').textContent).toBe('0');
		expect(screen.getByTestId('isFinished').textContent).toBe('false');
	});

	it('resolve acerto, conta movimento e finaliza o jogo', async () => {
		const onPlaySound = vi.fn();

		render(
			<Harness
				content={[{ name: 'chimarrao', image: '/chimarrao.jpg' }]}
				matchDelayMs={1}
				onPlaySound={onPlaySound}
			/>
		);

		await waitFor(() => {
			expect(screen.getAllByRole('button')).toHaveLength(3);
		});

		fireEvent.click(screen.getByTestId('card-0'));
		fireEvent.click(screen.getByTestId('card-1'));

		await waitFor(() => {
			expect(screen.getByTestId('moves').textContent).toBe('1');
			expect(screen.getByTestId('score').textContent).toBe('100');
			expect(screen.getByTestId('matchedPairs').textContent).toBe('1');
			expect(screen.getByTestId('isFinished').textContent).toBe('true');
		});

		expect(onPlaySound).toHaveBeenCalledWith('flip');
		expect(onPlaySound).toHaveBeenCalledWith('success');
		expect(onPlaySound).toHaveBeenCalledWith('finish');
	});

	it('nao toca finish quando o acerto ainda nao encerra a partida', async () => {
		const onPlaySound = vi.fn();

		render(
			<Harness
				content={[
					{ name: 'chimarrao', image: '/chimarrao.jpg' },
					{ name: 'churrasco', image: '/churrasco.jpg' },
				]}
				matchDelayMs={1}
				onPlaySound={onPlaySound}
			/>
		);

		await waitFor(() => {
			expect(screen.getByTestId('cards-count').textContent).toBe('4');
		});

		const cards = screen
			.getAllByRole('button')
			.filter((button) => button !== screen.getByText('restart'));
		const firstCard = cards[0]!;
		const matchingCard = cards.find(
			(button, index) =>
				index !== 0 &&
				button.getAttribute('data-name') === firstCard.getAttribute('data-name')
		)!;

		fireEvent.click(firstCard);
		fireEvent.click(matchingCard);

		await waitFor(() => {
			expect(screen.getByTestId('matchedPairs').textContent).toBe('1');
			expect(screen.getByTestId('isFinished').textContent).toBe('false');
		});

		expect(onPlaySound).toHaveBeenCalledWith('success');
		expect(onPlaySound).not.toHaveBeenCalledWith('finish');
	});

	it('ignora clique inválido e desfaz par incorreto com erro', async () => {
		const onPlaySound = vi.fn();

		render(
			<Harness
				content={[
					{ name: 'chimarrao', image: '/chimarrao.jpg' },
					{ name: 'churrasco', image: '/churrasco.jpg' },
				]}
				matchDelayMs={1}
				onPlaySound={onPlaySound}
			/>
		);

		await waitFor(() => {
			expect(screen.getByTestId('cards-count').textContent).toBe('4');
		});

		const cards = screen
			.getAllByRole('button')
			.filter((button) => button !== screen.getByText('restart'));
		const firstCard = cards[0]!;
		const mismatchCard = cards.find(
			(button) => button.getAttribute('data-name') !== firstCard.getAttribute('data-name')
		)!;

		fireEvent.click(firstCard);
		fireEvent.click(mismatchCard);

		await waitFor(() => {
			expect(screen.getByTestId('moves').textContent).toBe('1');
			expect(screen.getByTestId('score').textContent).toBe('0');
			expect(firstCard.getAttribute('data-flipped')).toBe('false');
			expect(mismatchCard.getAttribute('data-flipped')).toBe('false');
		});

		expect(onPlaySound).toHaveBeenCalledWith('error');
	});

	it('reinicia o jogo limpando estado acumulado', async () => {
		render(
			<Harness
				content={[{ name: 'chimarrao', image: '/chimarrao.jpg' }]}
				matchDelayMs={1}
			/>
		);

		await waitFor(() => {
			expect(screen.getByTestId('cards-count').textContent).toBe('2');
		});

		fireEvent.click(screen.getByText('restart'));

		expect(screen.getByTestId('score').textContent).toBe('0');
		expect(screen.getByTestId('moves').textContent).toBe('0');
		expect(screen.getByTestId('isFinished').textContent).toBe('false');
	});

	it('ignora clique quando o jogo ja terminou ou a carta ja esta indisponivel', async () => {
		render(
			<Harness
				content={[{ name: 'chimarrao', image: '/chimarrao.jpg' }]}
				matchDelayMs={1}
			/>
		);

		await waitFor(() => {
			expect(screen.getByTestId('cards-count').textContent).toBe('2');
		});

		const firstCard = screen.getByTestId('card-0');
		const secondCard = screen.getByTestId('card-1');

		fireEvent.click(firstCard);
		fireEvent.click(firstCard);
		expect(screen.getByTestId('moves').textContent).toBe('0');

		fireEvent.click(secondCard);

		await waitFor(() => {
			expect(screen.getByTestId('isFinished').textContent).toBe('true');
		});

		fireEvent.click(firstCard);
		expect(screen.getByTestId('moves').textContent).toBe('1');
	});

	it('limpa timeout pendente ao reinicializar o jogo', async () => {
		const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

		render(
			<Harness
				content={[
					{ name: 'chimarrao', image: '/chimarrao.jpg' },
					{ name: 'churrasco', image: '/churrasco.jpg' },
				]}
				matchDelayMs={100}
			/>
		);

		await waitFor(() => {
			expect(screen.getByTestId('cards-count').textContent).toBe('4');
		});

		const cards = screen
			.getAllByRole('button')
			.filter((button) => button !== screen.getByText('restart'));
		const firstCard = cards[0]!;
		const mismatchCard = cards.find(
			(button) => button.getAttribute('data-name') !== firstCard.getAttribute('data-name')
		)!;

		fireEvent.click(firstCard);
		fireEvent.click(mismatchCard);
		fireEvent.click(screen.getByText('restart'));

		await waitFor(() => {
			expect(clearTimeoutSpy).toHaveBeenCalled();
		});
	});
});
