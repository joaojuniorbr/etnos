'use client';

import { MemoryGame, GuessGame } from '@etnos/games';

export const Games = ({
	type,
	characterSlug,
}: {
	type: 'memory-game' | 'guess-game';
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
