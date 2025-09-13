import { useEffect, useState } from 'react';
import {
	CharacterInterface,
	getAllCharacters,
	getCharacterBySlug,
} from '../characters';

const CHARACTER_STORAGE_KEY = 'selectedCharacter';

export const useCharacter = () => {
	const [selectedCharacter, setSelectedCharacter] =
		useState<CharacterInterface>();

	const characters = getAllCharacters();

	const selectCharacter = (character: string) => {
		localStorage.setItem(CHARACTER_STORAGE_KEY, character);
		setSelectedCharacter(getCharacterBySlug(character));
	};

	useEffect(() => {
		const storedCharacter = localStorage.getItem(CHARACTER_STORAGE_KEY);
		if (storedCharacter) {
			setSelectedCharacter(getCharacterBySlug(storedCharacter));
		}
	}, []);

	return {
		characters,
		selectedCharacter,
		selectCharacter,
	};
};
