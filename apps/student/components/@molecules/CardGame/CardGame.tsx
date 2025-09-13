'use client';

import { GameInterface } from '@etnos/tools';
import Image from 'next/image';

interface CardGameProps {
	game: GameInterface;
	character: string;
}

export const CardGame = ({ game, character }: CardGameProps) => {
	return (
		<div className='shadow rounded overflow-hidden bg-white md:max-w-3xs w-full'>
			<Image
				src={`/games/${game.slug}/${character}/cover.png`}
				alt={game.name}
				width={300}
				height={300}
				className='aspect-[1/1] object-cover w-full '
			/>
			<dl className='p-4 text-center text-primary'>
				<dt className='text-lg font-bold'>{game.name}</dt>
				<dd className='text-xs'>{game.description}</dd>
			</dl>
		</div>
	);
};
