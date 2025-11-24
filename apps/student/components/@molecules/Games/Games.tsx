'use client';

import { MemoryGame } from '@etnos/games';

export const Games = ({
	type,
	characterSlug,
}: {
	type: 'memory-game';
	characterSlug?: string;
}) => {
	switch (type) {
		case 'memory-game':
			return <MemoryGame characterSlug={characterSlug} />;
		default:
			return null;
	}
};
