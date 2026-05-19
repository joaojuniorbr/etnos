import type { CharacterInterface } from '@etnos/types';
import { Image } from 'antd';

export interface CharacterSelectProps {
	characters?: CharacterInterface[];
	selectedCharacter?: CharacterInterface;
	onSelect: (character: CharacterInterface) => void;
}

export const CharacterSelect = ({
	characters,
	selectedCharacter,
	onSelect,
}: CharacterSelectProps) => (
	<div className="ui:flex ui:flex-col ui:gap-2">
		{characters?.map((character) => (
			<button
				key={character.slug}
				className={`
      ui:flex ui:items-center ui:gap-2 ui:border ui:p-2 ui:rounded ui:cursor-pointer ui:text-left   
      ${selectedCharacter?.slug === character.slug ? 'ui:border-primary' : 'ui:border-slate-200'}
    `}
				onClick={() => onSelect(character)}
				aria-label={`Selecionar Personagem: ${character.name}`}
			>
				<div className="ui:w-26">
					<Image
						src={
							character.imageUrl || `/images/character/md/${character.slug}.png`
						}
						alt={character.name}
						preview={false}
					/>
				</div>
				<div className="ui:flex ui:flex-col">
					<div className="ui:text-sm ui:font-bold ui:text-primary ui:uppercase">
						{character.name}
					</div>
					<div className="ui:text-xs">{character.description}</div>
				</div>
			</button>
		))}
	</div>
);
