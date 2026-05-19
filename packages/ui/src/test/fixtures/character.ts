import type { CharacterInterface } from '@etnos/types';

export const mockCharacter: CharacterInterface = {
	id: 'iara',
	slug: 'iara',
	name: 'Iara',
	region: 'Norte',
	description: 'Guardiã das águas do rio Amazonas.',
	imageUrl: '/images/character/md/iara.png',
};

export const mockCharacters: CharacterInterface[] = [
	mockCharacter,
	{
		id: 'saci',
		slug: 'saci',
		name: 'Saci',
		region: 'Sudeste',
		description: 'Travesso guardião das tradições caipiras.',
		imageUrl: '/images/character/md/saci.png',
	},
];
