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
		className={`ui:flex ui:items-center ui:border-2 ui:rounded ui:shadow ui:overflow-hidden ui:gap-2 ui:bg-white ui:transition-all ${selected ? 'ui:border-primary' : 'ui:border-white'}`}
		{...props}
	>
		<Image
			src={`/images/character/md/${character.slug}.png`}
			alt={character.name}
			width={80}
			height={80}
			className='ui:w-28 ui:h-28 md:ui:w-24 md:ui:h-24'
		/>
		<dl className='ui:flex ui:flex-col ui:text-left ui:w-full'>
			<dt className='ui:text-sm md:ui:text-xs ui:text-slate-800 ui:m-0'>
				{character.region}
			</dt>
			<dd className='ui:text-lg md:ui:text-sm ui:font-bold ui:m-0'>
				{character.name}
			</dd>
		</dl>
	</div>
);
