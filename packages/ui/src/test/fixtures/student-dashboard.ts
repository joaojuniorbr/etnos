import type { StudentDashboardInterface } from '@etnos/types';

import { mockCharacter, mockCharacters } from './character';

export const mockStudentDashboard: StudentDashboardInterface = {
	user: {
		name: 'Ana Silva',
		totalScore: 1250,
		gamesCompleted: 2,
		classRank: 3,
		schoolStudentsCount: 24,
	},
	culturalGuide: mockCharacter,
	characters: mockCharacters,
	classRanking: [
		{
			rank: 1,
			initials: 'JP',
			name: 'João Pedro',
			score: 2100,
			isCurrentUser: false,
		},
		{
			rank: 2,
			initials: 'ML',
			name: 'Maria Luiza',
			score: 1800,
			isCurrentUser: false,
		},
		{
			rank: 3,
			initials: 'AS',
			name: 'Ana Silva',
			score: 1250,
			isCurrentUser: true,
		},
	],
	availableGames: [
		{
			slug: 'memory-game',
			name: 'Jogo da Memória',
			coverUrl: null,
		},
		{
			slug: 'guess-game',
			name: 'Adivinhe a Palavra',
			coverUrl: null,
		},
	],
	recentActivity: [
		{
			id: 'activity-1',
			description: 'Pontuou no Jogo da Memória',
			highlight: '+120',
			gameSlug: 'memory-game',
			characterSlug: 'iara',
			timestamp: new Date().toISOString(),
			points: 120,
			coverUrl: null,
		},
	],
};

export const mockStudentDashboardWithoutGuide: StudentDashboardInterface = {
	...mockStudentDashboard,
	culturalGuide: null,
};
