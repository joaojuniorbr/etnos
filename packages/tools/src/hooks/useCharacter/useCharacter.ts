'use client';

import { useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import type { CharacterInterface } from '@etnos/types';
import { trackCharacterSelected } from '@etnos/analytics/web';
import { QUERY_STALE_TIME } from '../../constants/query-cache';
import { characterKeys } from '../../query-keys';
import { charactersService } from '@etnos/services';

const CHARACTER_STORAGE_KEY = 'selectedCharacter';
const CHARACTER_CHANGE_EVENT = 'etnos:selected-character-change';

type UseCharacterOptions = {
	fetchList?: boolean;
};

export const useCharacter = (options?: UseCharacterOptions) => {
	const fetchList = options?.fetchList ?? true;

	const [selectedSlug, setSelectedSlug] = useState<string>();

	const charactersQuery = useQuery<CharacterInterface[]>({
		queryKey: characterKeys.all(),
		enabled: fetchList,
		staleTime: QUERY_STALE_TIME.catalog,
		queryFn: () => charactersService.getCharacters(),
	});

	const selectedCharacterFromList = charactersQuery.data?.find(
		(character) => character.slug === selectedSlug,
	);

	const selectedCharacterQuery = useQuery<CharacterInterface | null>({
		queryKey: characterKeys.selected(selectedSlug),
		enabled: Boolean(selectedSlug) && !selectedCharacterFromList,
		staleTime: QUERY_STALE_TIME.catalog,
		queryFn: () => charactersService.getCharacterBySlug(selectedSlug!),
	});

	const selectCharacter = (character: string) => {
		if (character) {
			localStorage.setItem(CHARACTER_STORAGE_KEY, character);
			setSelectedSlug(character);

			const characterName = charactersQuery.data?.find(
				(item) => item.slug === character,
			)?.name;

			trackCharacterSelected({
				character_slug: character,
				character_name: characterName,
			});
		} else {
			localStorage.removeItem(CHARACTER_STORAGE_KEY);
			setSelectedSlug(undefined);
		}

		globalThis.window.dispatchEvent(
			new CustomEvent(CHARACTER_CHANGE_EVENT, {
				detail: { slug: character },
			}),
		);
	};

	useEffect(() => {
		const syncSelectedCharacter = (slug?: string | null) => {
			setSelectedSlug(slug ?? undefined);
		};

		syncSelectedCharacter(localStorage.getItem(CHARACTER_STORAGE_KEY));

		const handleStorage = (event: StorageEvent) => {
			if (event.key !== CHARACTER_STORAGE_KEY) {
				return;
			}

			syncSelectedCharacter(event.newValue);
		};

		const handleCharacterChange = (event: Event) => {
			const customEvent = event as CustomEvent<{ slug?: string }>;
			syncSelectedCharacter(customEvent.detail?.slug);
		};

		globalThis.window.addEventListener('storage', handleStorage);
		globalThis.window.addEventListener(
			CHARACTER_CHANGE_EVENT,
			handleCharacterChange,
		);

		return () => {
			globalThis.window.removeEventListener('storage', handleStorage);
			globalThis.window.removeEventListener(
				CHARACTER_CHANGE_EVENT,
				handleCharacterChange,
			);
		};
	}, []);

	const selectedCharacter =
		selectedCharacterFromList ?? selectedCharacterQuery.data ?? undefined;

	return {
		selectedCharacter,
		selectCharacter,
		...charactersQuery,
	};
};
