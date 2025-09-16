import { GameInterface } from '@etnos/tools';
import Image from 'next/image';
import Link from 'next/link';

interface CardGameProps extends React.HTMLAttributes<HTMLDivElement> {
	game: GameInterface;
	character: string;
}

export const CardGame = ({ game, character, ...props }: CardGameProps) => (
	<Link href={game.url}>
		<div
			className='shadow rounded overflow-hidden bg-white md:max-w-3xs w-full'
			{...props}
		>
			<Image
				src={`/games/${game.slug}/${character}/cover.jpg`}
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
	</Link>
);
