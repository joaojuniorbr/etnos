'use client';

import dynamic from 'next/dynamic';

const GuessGame = dynamic(
	() => import('@etnos/games/guess-game').then((module) => module.GuessGame),
	{
		ssr: false,
		loading: () => (
			<div className='p-6 text-center text-slate-500'>Carregando jogo...</div>
		),
	}
);

const MemoryGame = dynamic(
	() => import('@etnos/games/memory-game').then((module) => module.MemoryGame),
	{
		ssr: false,
		loading: () => (
			<div className='p-6 text-center text-slate-500'>Carregando jogo...</div>
		),
	}
);

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
