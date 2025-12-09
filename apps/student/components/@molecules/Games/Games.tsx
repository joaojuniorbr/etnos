'use client';

import { MemoryGame, GuessGame } from '@etnos/games';

export type GameType = 'memory-game' | 'guess-game';

export const Games = ({
	type,
	characterSlug,
}: {
	type: GameType;
	characterSlug?: string;
}) => {
	switch (type) {
		case 'memory-game':
			return <MemoryGame characterSlug={characterSlug} />;
		case 'guess-game':
			return <GuessGame characterSlug={characterSlug} />;
		default:
			return null;
	}
};
