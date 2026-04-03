'use client';

import Image from 'next/image';
import { RiStarFill, RiStarSLine } from 'react-icons/ri';
import type {
	MemoryGameCardContent,
	MemoryGameLevelConfig,
} from './memory-game.types';
import type { CharacterInterface } from '@etnos/types';

type MemoryGameLevelSelectorProps = {
	availableLevels: MemoryGameLevelConfig[];
	content: MemoryGameCardContent[];
	onSelectLevel: (level: number) => void;
	selectedCharacter?: CharacterInterface;
};

export const MemoryGameLevelSelector = ({
	availableLevels,
	content,
	onSelectLevel,
	selectedCharacter,
}: MemoryGameLevelSelectorProps) => {
	if (!content.length) {
		return null;
	}

	const heroImageSrc =
		selectedCharacter?.imageUrl ||
		(selectedCharacter?.slug
			? `/images/character/md/${selectedCharacter.slug}.png`
			: null);

	return (
		<div className="w-full text-center">
			{heroImageSrc ? (
				<Image
					src={heroImageSrc}
					alt="Etnos"
					width={256}
					height={256}
					className="mx-auto"
				/>
			) : null}
			<h2 className="text-2xl font-black text-slate-900">
				Escolha o nível para começar
			</h2>
			<p className="mt-2 text-slate-600">
				Cada nível aumenta a quantidade de pares e deixa a pontuação maior.
			</p>

			<div className="mt-6 grid gap-2 md:grid-cols-4">
				{availableLevels.map((level) => (
					<button
						key={level.level}
						type="button"
						onClick={() => onSelectLevel(level.level)}
						className="rounded border border-slate-200 bg-white px-4 py-4 text-left cursor-pointer flex flex-row items-center"
					>
						<div className="text-5xl font-black">{level.level}</div>
						<div className="ml-2">
							<div className="text-base font-black text-slate-900">
								{level.label}
							</div>
							<div className="flex items-center gap-1 text-xl text-amber-500">
								{Array.from({ length: availableLevels.length }, (_, index) =>
									index < level.level ? (
										<RiStarFill key={`filled-${level.level}-${index}`} />
									) : (
										<RiStarSLine key={`outline-${level.level}-${index}`} />
									),
								)}
							</div>
							<div className="mt-1 text-xs text-slate-600 leading-3">
								{level.pairs * 2} cartas
							</div>
						</div>
					</button>
				))}
			</div>
		</div>
	);
};
