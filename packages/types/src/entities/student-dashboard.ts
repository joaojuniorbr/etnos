import type { CharacterInterface } from './character';

export interface StudentDashboardUserStatsInterface {
	name: string;
	totalScore: number;
	gamesCompleted: number;
	classRank: number | null;
	schoolStudentsCount: number;
}

export interface StudentDashboardRankingEntryInterface {
	rank: number;
	initials: string;
	name: string;
	score: number;
	isCurrentUser: boolean;
}

export interface StudentDashboardGameInterface {
	slug: string;
	name: string;
	coverUrl: string | null;
}

export interface StudentDashboardActivityInterface {
	id: string;
	description: string;
	highlight: string;
	gameSlug: string;
	characterSlug: string;
	timestamp: string;
	points: number;
	coverUrl: string | null;
}

export interface StudentDashboardInterface {
	user: StudentDashboardUserStatsInterface;
	culturalGuide: CharacterInterface | null;
	characters: CharacterInterface[];
	classRanking: StudentDashboardRankingEntryInterface[];
	availableGames: StudentDashboardGameInterface[];
	recentActivity: StudentDashboardActivityInterface[];
}
