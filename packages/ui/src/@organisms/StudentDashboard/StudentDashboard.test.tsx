import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { trackGameSelected } from '@etnos/analytics/web';

import {
	mockStudentDashboard,
	mockStudentDashboardWithoutGuide,
} from '@ui/test/fixtures';

import { StudentDashboard } from './StudentDashboard';

const { selectCharacterMock } = vi.hoisted(() => ({
	selectCharacterMock: vi.fn(),
}));

vi.mock('@etnos/tools', () => ({
	useCharacter: () => ({
		selectCharacter: selectCharacterMock,
	}),
}));

vi.mock('@etnos/analytics/web', () => ({
	trackGameSelected: vi.fn(),
}));

describe('@organisms/StudentDashboard', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renderiza painel completo com guia, atividades e capas dos jogos', () => {
		const data = {
			...mockStudentDashboard,
			availableGames: [
				{
					slug: 'memory-game',
					name: 'Jogo da Memória',
					coverUrl: 'https://cdn.etnos.test/memory.jpg',
				},
			],
		};

		render(<StudentDashboard data={data} />);

		expect(
			screen.getByRole('heading', { name: /Olá Ana Silva/i }),
		).toBeInTheDocument();
		expect(screen.getByText('Iara')).toBeInTheDocument();
		expect(
			screen.getByText(/Pontuou no Jogo da Memória/i),
		).toBeInTheDocument();

		const gameImage = screen.getByRole('img', { name: 'Jogo da Memória' });
		expect(gameImage).toHaveAttribute('src', 'https://cdn.etnos.test/memory.jpg');
	});

	it('dispara analytics ao selecionar um jogo', () => {
		render(<StudentDashboard data={mockStudentDashboard} />);

		fireEvent.click(
			screen.getByRole('link', { name: /Jogar Jogo da Memória/i }),
		);

		expect(trackGameSelected).toHaveBeenCalledWith({
			game_slug: 'memory-game',
			character_slug: 'iara',
			game_name: 'Jogo da Memória',
		});
	});

	it('renderiza estado sem guia, atividade vazia e analytics sem personagem', () => {
		const data = {
			...mockStudentDashboardWithoutGuide,
			recentActivity: [],
		};

		render(<StudentDashboard data={data} />);

		expect(
			screen.getByText(/Escolha um personagem para começar/i),
		).toBeInTheDocument();
		expect(
			screen.getByText(
				/Nenhuma atividade recente. Jogue para ver seu histórico aqui./i,
			),
		).toBeInTheDocument();

		fireEvent.click(
			screen.getByRole('link', { name: /Jogar Jogo da Memória/i }),
		);

		expect(trackGameSelected).toHaveBeenCalledWith({
			game_slug: 'memory-game',
			character_slug: '',
			game_name: 'Jogo da Memória',
		});
	});

	it('abre o modal e seleciona um personagem', () => {
		render(<StudentDashboard data={mockStudentDashboard} />);

		fireEvent.click(screen.getByRole('button', { name: /Trocar guia/i }));

		const dialog = screen.getByRole('dialog');
		fireEvent.click(
			within(dialog).getByRole('button', {
				name: /Selecionar Personagem: Saci/i,
			}),
		);

		expect(selectCharacterMock).toHaveBeenCalledWith('saci');
	});
});
