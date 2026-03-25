'use client';

import dynamic from 'next/dynamic';

type GameComponentProps = {
	characterSlug?: string;
};

const GameLoading = () => (
	<div className='p-6 text-center text-slate-500'>Carregando jogo...</div>
);

const GuessGame = dynamic<GameComponentProps>(
	() => import('@etnos/games').then((module) => module.GuessGame),
	{
		ssr: false,
		loading: () => <GameLoading />,
	}
);

const MemoryGame = dynamic<GameComponentProps>(
	() => import('@etnos/games').then((module) => module.MemoryGame),
	{
		ssr: false,
		loading: () => <GameLoading />,
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
