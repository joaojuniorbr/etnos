import { storageAdapter } from '@/utils';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'etnos_selected_character';

type CharacterSelectionContextValue = {
	isHydrated: boolean;
	selectedCharacterSlug: string | null;
	selectCharacter: (slug: string | null) => Promise<void>;
};

const CharacterSelectionContext =
	createContext<CharacterSelectionContextValue | null>(null);

export const CharacterSelectionProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [selectedCharacterSlug, setSelectedCharacterSlug] = useState<
		string | null
	>(null);
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		let isMounted = true;

		const loadSelection = async () => {
			const slug = await storageAdapter.getItem(STORAGE_KEY);

			if (isMounted) {
				setSelectedCharacterSlug(slug);
				setIsHydrated(true);
			}
		};

		void loadSelection();

		return () => {
			isMounted = false;
		};
	}, []);

	const selectCharacter = async (slug: string | null) => {
		if (slug) {
			await storageAdapter.setItem(STORAGE_KEY, slug);
		} else {
			await storageAdapter.removeItem(STORAGE_KEY);
		}

		setSelectedCharacterSlug(slug);
	};

	const value: CharacterSelectionContextValue = useMemo(
		() => ({
			isHydrated,
			selectedCharacterSlug,
			selectCharacter,
		}),
		[isHydrated, selectedCharacterSlug, selectCharacter],
	);

	return (
		<CharacterSelectionContext.Provider value={value}>
			{children}
		</CharacterSelectionContext.Provider>
	);
};

export const useCharacterSelection = () => {
	const context = useContext(CharacterSelectionContext);

	if (!context) {
		throw new Error(
			'useCharacterSelection must be used inside CharacterSelectionProvider',
		);
	}

	return context;
};
