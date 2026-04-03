export interface SchoolRankingInterface {
	position: number;
	schoolId: string;
	schoolName: string;
	gameSlug: string | null;
	totalScore: number;
	totalPlayers: number;
	averageScore: number;
}
