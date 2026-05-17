import type { GameInterface } from '@etnos/types';
import Image from 'next/image';
import Link from 'next/link';

interface CardGameProps extends React.HTMLAttributes<HTMLDivElement> {
	game: GameInterface;
	character: string;
	isAboveTheFold?: boolean;
	onSelect?: () => void;
}

export const CardGame = ({
	game,
	character,
	isAboveTheFold = false,
	onSelect,
	...props
}: CardGameProps) => (
	<Link href={game.url} onClick={() => onSelect?.()}>
		<div
			className="shadow rounded overflow-hidden bg-white md:max-w-3xs w-full"
			{...props}
		>
			<Image
				src={`/games/${game.slug}/cover/${character}.jpg`}
				alt={game.name}
				width={256}
				height={256}
				priority={isAboveTheFold}
				loading={isAboveTheFold ? 'eager' : 'lazy'}
				className="aspect-[1/1] object-cover w-full "
			/>
			<dl className="p-4 text-center text-primary">
				<dt className="text-lg font-bold">{game.name}</dt>
				<dd className="text-xs">{game.description}</dd>
			</dl>
		</div>
	</Link>
);
