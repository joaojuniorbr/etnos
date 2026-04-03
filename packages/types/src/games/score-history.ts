export interface ScoreHistory {
	characterName: string;
	gameName: string;
	score: number;
	timestamp: string; // ISO 8601 string
}

export interface ScoreHistoryResponse {
	history: ScoreHistory[];
}
