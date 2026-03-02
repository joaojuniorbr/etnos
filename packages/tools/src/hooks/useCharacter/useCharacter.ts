'use client';

import { useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import type { CharacterInterface } from '@etnos/types';
import { charactersService } from '../../services';

const CHARACTER_STORAGE_KEY = 'selectedCharacter';

export const useCharacter = () => {
	const [selectedCharacter, setSelectedCharacter] =
		useState<CharacterInterface>();

	const setCharacter = (slug: string) => {
		charactersService.getCharacterBySlug(slug).then((res) => {
			if (res) {
				setSelectedCharacter(res);
			}
		});
	};

	const selectCharacter = (character: string) => {
		localStorage.setItem(CHARACTER_STORAGE_KEY, character);
		setCharacter(character);
	};

	useEffect(() => {
		const storedCharacter = localStorage.getItem(CHARACTER_STORAGE_KEY);
		if (storedCharacter) {
			setCharacter(storedCharacter);
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
