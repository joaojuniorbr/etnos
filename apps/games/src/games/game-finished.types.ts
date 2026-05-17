export type GameFinishedPayload = {
	score: number;
	outcome?: 'won' | 'lost';
};
