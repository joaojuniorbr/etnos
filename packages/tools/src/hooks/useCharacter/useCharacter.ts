import { useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { CharacterInterface, charactersService } from '../../services';

const CHARACTER_STORAGE_KEY = 'selectedCharacter';

export const useCharacter = () => {
	const [selectedCharacter, setSelectedCharacter] =
		useState<CharacterInterface>();

	const selectCharacter = (character: string) => {
		localStorage.setItem(CHARACTER_STORAGE_KEY, character);
		charactersService.getCharacterBySlug(character).then((res) => {
			if (res) {
				setSelectedCharacter(res);
			}
		});
	};

	useEffect(() => {
		const storedCharacter = localStorage.getItem(CHARACTER_STORAGE_KEY);
		if (storedCharacter) {
			charactersService.getCharacterBySlug(storedCharacter).then((res) => {
				if (res) {
					setSelectedCharacter(res);
				}
			});
		}
	}, []);

	return {
		selectedCharacter,
		selectCharacter,
		...useQuery({
			queryKey: ['character'],
			queryFn: charactersService.getCharacters,
		}),
	};
};
