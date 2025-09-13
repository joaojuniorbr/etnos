'use client';

import Image from 'next/image';
import { CharacterInterface } from '@etnos/tools';

interface CharacterCardProps extends React.HTMLAttributes<HTMLDivElement> {
	character: CharacterInterface;
	selected?: boolean;
}

export const CharacterCard = ({
	character,
	selected,
	...props
}: CharacterCardProps) => (
	<div
		className={`flex items-center border-2 rounded shadow overflow-hidden gap-2 bg-white transition-all ${selected ? 'border-primary' : 'border-white'}`}
		{...props}
	>
		<Image
			src={`/images/character/md/${character.slug}.png`}
			alt={character.name}
			width={80}
			height={80}
			className='w-28 h-28 md:w-24 md:h-24'
		/>
		<dl className='flex flex-col text-left w-full'>
			<dt className='text-sm md:text-xs text-slate-800 m-0'>
				{character.region}
			</dt>
			<dd className='text-lg md:text-sm font-bold m-0'>{character.name}</dd>
		</dl>
	</div>
);
