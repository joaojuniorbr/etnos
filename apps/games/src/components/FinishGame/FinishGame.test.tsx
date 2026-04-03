import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { FinishGame } from './FinishGame';

vi.mock('@etnos/ui', () => ({
	Button: ({
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
	),
}));

vi.mock('next/image', () => ({
	default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
		<img {...props} />
	),
}));

describe('FinishGame', () => {
	it('renderiza estado de sucesso com imagem e aciona callbacks', () => {
		const handleRestart = vi.fn();
		const handleSaveScore = vi.fn();

		render(
			<FinishGame
				handleRestart={handleRestart}
				handleSaveScore={handleSaveScore}
				isLoading={false}
				selectedCharacter={{
					slug: 'anita',
					name: 'Anita',
					description: 'Gaúcha',
					id: '1',
					imageUrl: '/games/success/anita.jpg',
					region: 'Sul',
				}}
			/>,
		);

		expect(screen.getByText('Parabéns!')).toBeTruthy();
		expect(screen.getByText('Você completou o desafio.')).toBeTruthy();
		expect(screen.getByAltText('Anita').getAttribute('src')).toBe(
			'/games/success/anita.jpg',
		);

		fireEvent.click(screen.getByText('Reiniciar Jogo'));
		fireEvent.click(screen.getByText('Salvar Pontuação'));

		expect(handleRestart).toHaveBeenCalledTimes(1);
		expect(handleSaveScore).toHaveBeenCalledTimes(1);
	});

	it('renderiza estado de derrota sem permitir salvar pontuação', () => {
		render(
			<FinishGame
				handleRestart={vi.fn()}
				handleSaveScore={vi.fn()}
				isLoading={false}
				isLoser
				selectedCharacter={{
					slug: 'iara',
					name: 'Iara',
					id: '1',
					imageUrl: '/games/error/iara.jpg',
					region: 'Amazonas',
					description: 'Amazonense',
				}}
			/>,
		);

		expect(screen.getByText('Você perdeu')).toBeTruthy();
		expect(screen.getByText('Tente novamente')).toBeTruthy();
		expect(screen.getByAltText('Iara').getAttribute('src')).toBe(
			'/games/error/iara.jpg',
		);
		expect(
			(screen.getByText('Salvar Pontuação') as HTMLButtonElement).disabled,
		).toBe(true);
	});
});
