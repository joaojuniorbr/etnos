export interface ScoreHistory {
	id?: string;
	characterName: string;
	gameName: string;
	score: number;
	/** Momento de referência da partida (fim ou único instante em registros antigos) */
	timestamp: string;
	startedAt?: string;
	endedAt?: string | null;
	status?: string;
}

export interface ScoreHistoryResponse {
	history: ScoreHistory[];
}
